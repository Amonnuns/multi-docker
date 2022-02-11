const keys = require('./keys');
const redis = require('redis');

const redishost = keys.redisHost
console.log(redishost)
const redisClient = redis.createClient({
  host: 'multi-docker-redis.mqrqjn.0001.use1.cache.amazonaws.com',
  port: 6379,
  retry_strategy: () => 1000,
});
const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fib(parseInt(message)));
});
sub.subscribe('insert');
