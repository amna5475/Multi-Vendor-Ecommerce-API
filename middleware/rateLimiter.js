const config = require('config');
const { getRedisClient, isRedisReady } = require('../config/redis');
const { TooManyRequestsError } = require('../adapters/errorAdapter');

/**
 * Redis-backed rate limiter.
 * Fails open if Redis is unavailable so local development is not blocked.
 */
const createRateLimiter = ({
  prefix,
  windowSeconds,
  maxRequests,
  message = 'Too many requests, please try again later'
} = {}) => {
  return async (req, res, next) => {
    if (!isRedisReady()) {
      return next();
    }

    try {
      const identifier = req.ip || req.connection?.remoteAddress || 'unknown';
      const key = `rl:${prefix}:${identifier}`;
      const client = getRedisClient();

      const current = await client.incr(key);
      if (current === 1) {
        await client.expire(key, windowSeconds);
      }

      const ttl = await client.ttl(key);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      if (ttl > 0) {
        res.setHeader('X-RateLimit-Reset', ttl);
      }

      if (current > maxRequests) {
        return next(TooManyRequestsError(message));
      }

      return next();
    } catch (error) {
      console.warn('Rate limiter skipped due to Redis error:', error.message);
      return next();
    }
  };
};

const rateLimitConfig = config.get('rateLimit');

const authRateLimiter = createRateLimiter({
  prefix: 'auth',
  windowSeconds: rateLimitConfig.authWindowSeconds,
  maxRequests: rateLimitConfig.authMaxRequests,
  message: 'Too many authentication attempts. Please wait and try again.'
});

const apiRateLimiter = createRateLimiter({
  prefix: 'api',
  windowSeconds: rateLimitConfig.apiWindowSeconds,
  maxRequests: rateLimitConfig.apiMaxRequests,
  message: 'API rate limit exceeded. Please slow down and try again.'
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter
};
