const { cache } = require('../config/cache');

const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    try {
      const cached = await cache.get(key);
      if (cached) {
        return res.json(cached);
      }
      
      const originalSend = res.json;
      res.json = function(data) {
        cache.set(key, data, ttl);
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = cacheMiddleware;