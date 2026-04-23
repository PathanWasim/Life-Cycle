const redis = require('redis');

let client = null;

const connectRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      const redisUrl = process.env.REDIS_URL;

      // Upstash and other TLS Redis providers use rediss:// or require TLS on port 6379
      const isTLS = redisUrl.startsWith('rediss://') ||
        redisUrl.includes('upstash.io') ||
        process.env.REDIS_TLS === 'true';

      client = redis.createClient({
        url: redisUrl,
        socket: isTLS ? {
          tls: true,
          rejectUnauthorized: false
        } : undefined
      });

      client.on('error', (err) => {
        console.error('❌ Redis client error:', err.message);
      });

      await client.connect();
      console.log('✅ Redis connected for caching');
    } else {
      console.log('⚠️  Redis not configured, using memory cache');
    }
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    client = null;
  }
};

const cache = {
  async get(key) {
    if (!client) return null;
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key, value, ttl = 300) {
    if (!client) return;
    try {
      await client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async del(key) {
    if (!client) return;
    try {
      await client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },

  async flush() {
    if (!client) return;
    try {
      await client.flushAll();
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }
};

module.exports = { connectRedis, cache };