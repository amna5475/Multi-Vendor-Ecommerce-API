const Redis = require('ioredis');
const config = require('config');

const redisConfig = config.get('redis');

let client = null;
let isReady = false;

/**
 * Shared Redis client.
 * Fails open: if Redis is unavailable the API still works without cache/rate-limit storage.
 */
const getRedisClient = () => {
  if (client) return client;

  client = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 200, 1000);
    }
  });

  client.on('ready', () => {
    isReady = true;
    console.log('Redis connected.');
  });

  client.on('error', (err) => {
    isReady = false;
    console.error('Redis error:', err.message);
  });

  client.on('end', () => {
    isReady = false;
  });

  client.connect().catch((err) => {
    isReady = false;
    console.warn('Redis unavailable — continuing without cache:', err.message);
  });

  return client;
};

const isRedisReady = () => Boolean(client && isReady);

module.exports = {
  getRedisClient,
  isRedisReady
};
