const NodeCache = require('node-cache');
const logger = require('./logger');

// Cache with 5min default TTL + automatic pruning
const cache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 60, // Cleanup interval (seconds)
  useClones: false // Better performance for objects
});

module.exports = {
  set: (key, value, ttl) => {
    if (!key || value === undefined) {
      logger.warn(`Cache set failed - invalid key/value`);
      return false;
    }
    return cache.set(key, value, ttl || 300);
  },

  get: (key) => {
    const value = cache.get(key);
    if (value === undefined) {
      logger.debug(`Cache miss for key: ${key}`);
    }
    return value;
  },

  del: (key) => {
    if (!key) return false;
    return cache.del(key);
  },

  flush: () => cache.flushAll()
};