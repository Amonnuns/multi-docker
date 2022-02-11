const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

console.log(keys.pgUser,
  keys.pgHost,
  keys.pgDatabase,
  keys.pgPassword,
  keys.pgPort, keys.redisHost, keys.redisPort)

// Postgres Client Setup
const { Pool } = require('pg')
const pgClient = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'postgres',
  password: 'postgres_password',
  port: 5432,
});

console.log('POSTGRESS CREATEDs')


pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});

console.log(keys.redisHost.toString())
// Redis Client Setup
const redis = require("redis");
const redisClient = redis.createClient({
  host: 'redis',
  port: 6379,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();
redisClient.connect


// Express route handlers

app.get("/", (req, res) => {

  res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");

  res.send(values.rows);
});

console.log('redis hgetall')
app.get("/values/current", async (req, res) => {
  console.log('redis hgetall inside')
  await redisClient.hgetall("values", (err, values) => {
    console.log(values);
    res.send(values);
  });
  
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }
  console.log('we reach here')
  redisClient.hset("values", index, "Nothing yet!");
  console.log('here two')
  redisPublisher.publish("insert", index);
  console.log('here after publisher')
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);
  console.log('here possible?')

  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log("Listening");
});
