const crypto = require('crypto');
const config = require('config');
const { getRedisClient, isRedisReady } = require('../config/redis');

const redisTtl = () => config.get('redis');

/**
 * Cache helper built on Redis.
 * All methods fail open when Redis is down.
 */
const CacheHelper = {
  hashKey: (value) =>
    crypto.createHash('sha1').update(JSON.stringify(value || {})).digest('hex'),

  toPlain: (data) => {
    if (data == null) return data;
    if (Array.isArray(data)) {
      return data.map((item) => (item && typeof item.toJSON === 'function' ? item.toJSON() : item));
    }
    return typeof data.toJSON === 'function' ? data.toJSON() : data;
  },

  get: async (key) => {
    if (!isRedisReady()) return null;
    try {
      const raw = await getRedisClient().get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn(`Redis GET failed for ${key}:`, error.message);
      return null;
    }
  },

  set: async (key, value, ttlSeconds) => {
    if (!isRedisReady()) return false;
    try {
      const payload = JSON.stringify(value);
      if (ttlSeconds) {
        await getRedisClient().set(key, payload, 'EX', ttlSeconds);
      } else {
        await getRedisClient().set(key, payload);
      }
      return true;
    } catch (error) {
      console.warn(`Redis SET failed for ${key}:`, error.message);
      return false;
    }
  },

  del: async (...keys) => {
    if (!isRedisReady() || keys.length === 0) return 0;
    try {
      return await getRedisClient().del(...keys);
    } catch (error) {
      console.warn('Redis DEL failed:', error.message);
      return 0;
    }
  },

  incr: async (key) => {
    if (!isRedisReady()) return 0;
    try {
      return await getRedisClient().incr(key);
    } catch (error) {
      console.warn(`Redis INCR failed for ${key}:`, error.message);
      return 0;
    }
  },

  getVersion: async (namespace) => {
    if (!isRedisReady()) return 0;
    try {
      const raw = await getRedisClient().get(`cache:ver:${namespace}`);
      return raw ? Number(raw) : 0;
    } catch (error) {
      console.warn(`Redis version read failed for ${namespace}:`, error.message);
      return 0;
    }
  },

  bumpVersion: async (namespace) => {
    if (!isRedisReady()) return 0;
    try {
      // INCR from missing key starts at 1, invalidating prior v0 cache entries
      return await getRedisClient().incr(`cache:ver:${namespace}`);
    } catch (error) {
      console.warn(`Redis version bump failed for ${namespace}:`, error.message);
      return 0;
    }
  },

  /**
   * Read-through cache for expensive catalog reads.
   */
  getOrSet: async (key, ttlSeconds, loader) => {
    const cached = await CacheHelper.get(key);
    if (cached !== null) return cached;

    const fresh = await loader();
    const plain = CacheHelper.toPlain(fresh);
    await CacheHelper.set(key, plain, ttlSeconds);
    return plain;
  },

  productListKey: async (filter = {}) => {
    const version = await CacheHelper.getVersion('products');
    return `products:list:v${version}:${CacheHelper.hashKey(filter)}`;
  },

  productDetailKey: (id) => `products:detail:${id}`,

  categoryListKey: async (filter = {}) => {
    const version = await CacheHelper.getVersion('categories');
    return `categories:list:v${version}:${CacheHelper.hashKey(filter)}`;
  },

  categoryDetailKey: (id) => `categories:detail:${id}`,

  invalidateProducts: async (productId = null) => {
    await CacheHelper.bumpVersion('products');
    if (productId) {
      await CacheHelper.del(CacheHelper.productDetailKey(productId));
    }
  },

  invalidateCategories: async (categoryId = null) => {
    await CacheHelper.bumpVersion('categories');
    if (categoryId) {
      await CacheHelper.del(CacheHelper.categoryDetailKey(categoryId));
    }
  },

  ttls: redisTtl
};

module.exports = CacheHelper;
