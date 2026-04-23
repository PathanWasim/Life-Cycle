const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.redisAvailable = false; // permanently false if can't connect initially
    this._errorLogged = false;   // suppress repeated error spam
  }

  async initialize() {
    // If no REDIS_URL and no local redis expected, skip silently
    const redisUrl = process.env.REDIS_URL || null;

    if (!redisUrl) {
      console.log('ℹ️  Redis not configured (REDIS_URL not set) — running without cache');
      this.redisAvailable = false;
      return false;
    }

    try {
      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries >= 3) {
              // Give up after 3 attempts — don't spam forever
              if (!this._errorLogged) {
                console.warn('⚠️  Redis unavailable after 3 attempts — running without cache');
                this._errorLogged = true;
              }
              return false; // stop reconnecting
            }
            return Math.min(retries * 500, 2000);
          },
          connectTimeout: 5000,
        }
      });

      // Single error handler — only log once
      this.client.on('error', (err) => {
        if (!this._errorLogged) {
          console.warn(`⚠️  Redis connection failed: ${err.message} — running without cache`);
          this._errorLogged = true;
        }
        this.isConnected = false;
        this.redisAvailable = false;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis connected and ready');
        this.isConnected = true;
        this.redisAvailable = true;
        this._errorLogged = false;
      });

      this.client.on('end', () => {
        this.isConnected = false;
        this.redisAvailable = false;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      if (!this._errorLogged) {
        console.warn(`⚠️  Redis initialization failed: ${error.message} — running without cache`);
        this._errorLogged = true;
      }
      this.isConnected = false;
      this.redisAvailable = false;
      return false;
    }
  }

  isAvailable() {
    return this.redisAvailable && this.client && this.client.isReady;
  }

  generateKey(prefix, ...parts) {
    const cleanParts = parts.filter(p => p !== null && p !== undefined);
    return `lifechain:${prefix}:${cleanParts.join(':')}`;
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.isAvailable()) return false;
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  async get(key) {
    if (!this.isAvailable()) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async del(key) {
    if (!this.isAvailable()) return false;
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch {
      return false;
    }
  }

  async delPattern(pattern) {
    if (!this.isAvailable()) return 0;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        return await this.client.del(keys);
      }
      return 0;
    } catch {
      return 0;
    }
  }

  async exists(key) {
    if (!this.isAvailable()) return false;
    try {
      return (await this.client.exists(key)) === 1;
    } catch {
      return false;
    }
  }

  async ttl(key) {
    if (!this.isAvailable()) return -1;
    try {
      return await this.client.ttl(key);
    } catch {
      return -1;
    }
  }

  async incr(key, ttlSeconds = 3600) {
    if (!this.isAvailable()) return 1;
    try {
      const result = await this.client.incr(key);
      if (result === 1) await this.client.expire(key, ttlSeconds);
      return result;
    } catch {
      return 1;
    }
  }

  async invalidateBloodAvailability(city = '*', pincode = '*', bloodGroup = '*') {
    return await this.delPattern(this.generateKey('blood_availability', city, pincode, bloodGroup));
  }

  async invalidateCampaigns(status = '*', city = '*', bloodGroup = '*') {
    return await this.delPattern(this.generateKey('campaigns', status, city, bloodGroup));
  }

  async invalidateHospitalVerification(hospitalId = '*') {
    return await this.delPattern(this.generateKey('hospital_verification', hospitalId));
  }

  async invalidateCampaignDetails(campaignId = '*') {
    return await this.delPattern(this.generateKey('campaign_details', campaignId));
  }

  async healthCheck() {
    if (!this.isAvailable()) {
      return {
        status: 'unavailable',
        message: 'Redis not configured or not reachable — app running without cache (non-critical)'
      };
    }
    try {
      const start = Date.now();
      await this.client.ping();
      return {
        status: 'healthy',
        responseTime: `${Date.now() - start}ms`,
        connected: true
      };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        // ignore disconnect errors
      }
    }
  }
}

module.exports = new CacheService();