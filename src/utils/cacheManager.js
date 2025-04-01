// cacheManager.js

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes by default

module.exports = {
  set: (key, value, ttl) => {
    return cache.set(key, value, ttl);
  },

  get: (key) => {
    return cache.get(key);
  },

  del: (key) => {
    return cache.del(key);
  },

  flush: () => {
    return cache.flushAll();
  }
};
