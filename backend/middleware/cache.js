const cacheService = require('../services/cacheService');

/**
 * Cache middleware factory
 * @param {Object} options - Caching options
 * @param {string} options.keyPrefix - Cache key prefix
 * @param {number} options.ttl - Time to live in seconds
 * @param {Function} options.keyGenerator - Function to generate cache key from req
 * @param {Function} options.condition - Function to determine if response should be cached
 */
function createCacheMiddleware(options = {}) {
  const {
    keyPrefix = 'api',
    ttl = 300, // 5 minutes default
    keyGenerator = null,
    condition = null
  } = options;

  return async (req, res, next) => {
    // Skip caching if service is not available
    if (!cacheService.isAvailable()) {
      return next();
    }

    // Generate cache key
    let cacheKey;
    if (keyGenerator && typeof keyGenerator === 'function') {
      cacheKey = keyGenerator(req);
    } else {
      // Default key generation
      const queryString = Object.keys(req.query)
        .sort()
        .map(key => `${key}=${req.query[key]}`)
        .join('&');
      
      cacheKey = cacheService.generateKey(
        keyPrefix,
        req.path.replace(/\//g, '_'),
        queryString || 'no_query'
      );
    }

    try {
      // Try to get cached response
      const cachedResponse = await cacheService.get(cacheKey);
      
      if (cachedResponse) {
        // Return cached response
        res.json(cachedResponse);
        return;
      }

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function(data) {
        // Check if response should be cached
        const shouldCache = condition ? condition(req, res, data) : true;
        
        if (shouldCache && res.statusCode === 200 && data.success) {
          // Cache the response asynchronously
          cacheService.set(cacheKey, data, ttl).catch(err => {
            console.error('❌ Failed to cache response:', err.message);
          });
        }

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('❌ Cache middleware error:', error.message);
      next();
    }
  };
}

/**
 * Predefined cache middleware for blood availability
 */
const bloodAvailabilityCache = createCacheMiddleware({
  keyPrefix: 'blood_availability',
  ttl: 300, // 5 minutes
  keyGenerator: (req) => {
    const { city, pincode, bloodGroup } = req.query;
    return cacheService.generateKey(
      'blood_availability',
      city || 'any_city',
      pincode || 'any_pincode',
      bloodGroup || 'all_groups'
    );
  },
  condition: (req, res, data) => {
    // Only cache successful responses with data
    return data.success && data.data && data.data.availability;
  }
});

/**
 * Predefined cache middleware for active campaigns
 */
const activeCampaignsCache = createCacheMiddleware({
  keyPrefix: 'campaigns_active',
  ttl: 120, // 2 minutes
  keyGenerator: (req) => {
    const { city, pincode, bloodGroup, page = 1, limit = 10 } = req.query;
    return cacheService.generateKey(
      'campaigns_active',
      city || 'any_city',
      pincode || 'any_pincode',
      bloodGroup || 'all_groups',
      `page_${page}`,
      `limit_${limit}`
    );
  },
  condition: (req, res, data) => {
    // Only cache successful responses with campaigns
    return data.success && data.data && Array.isArray(data.data.campaigns);
  }
});

/**
 * Predefined cache middleware for campaign details
 */
const campaignDetailsCache = createCacheMiddleware({
  keyPrefix: 'campaign_details',
  ttl: 180, // 3 minutes
  keyGenerator: (req) => {
    const { campaignID } = req.params;
    return cacheService.generateKey('campaign_details', campaignID);
  },
  condition: (req, res, data) => {
    // Only cache successful responses
    return data.success && data.data;
  }
});

/**
 * Predefined cache middleware for hospital verification status
 */
const hospitalVerificationCache = createCacheMiddleware({
  keyPrefix: 'hospital_verification',
  ttl: 1800, // 30 minutes
  keyGenerator: (req) => {
    const hospitalId = req.user?.id || 'anonymous';
    return cacheService.generateKey('hospital_verification', hospitalId);
  },
  condition: (req, res, data) => {
    // Only cache successful responses
    return data.success && data.data;
  }
});

/**
 * Cache invalidation middleware
 */
const cacheInvalidation = {
  /**
   * Invalidate blood availability cache when blood units change
   */
  async invalidateBloodAvailability(hospitalId, city, pincode) {
    try {
      await cacheService.invalidateBloodAvailability();
      console.log('📦 Invalidated blood availability cache');
    } catch (error) {
      console.error('❌ Failed to invalidate blood availability cache:', error.message);
    }
  },

  /**
   * Invalidate campaigns cache when campaigns change
   */
  async invalidateCampaigns(city, bloodGroup) {
    try {
      await cacheService.invalidateCampaigns();
      console.log('📦 Invalidated campaigns cache');
    } catch (error) {
      console.error('❌ Failed to invalidate campaigns cache:', error.message);
    }
  },

  /**
   * Invalidate hospital verification cache
   */
  async invalidateHospitalVerification(hospitalId) {
    try {
      await cacheService.invalidateHospitalVerification(hospitalId);
      console.log('📦 Invalidated hospital verification cache');
    } catch (error) {
      console.error('❌ Failed to invalidate hospital verification cache:', error.message);
    }
  },

  /**
   * Invalidate campaign details cache
   */
  async invalidateCampaignDetails(campaignId) {
    try {
      await cacheService.invalidateCampaignDetails(campaignId);
      console.log('📦 Invalidated campaign details cache');
    } catch (error) {
      console.error('❌ Failed to invalidate campaign details cache:', error.message);
    }
  }
};

module.exports = {
  createCacheMiddleware,
  bloodAvailabilityCache,
  activeCampaignsCache,
  campaignDetailsCache,
  hospitalVerificationCache,
  cacheInvalidation
};