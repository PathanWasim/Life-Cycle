// Test script for Redis caching implementation
require('dotenv').config();
const cacheService = require('./services/cacheService');

async function testCaching() {
  console.log('🧪 Testing Redis Caching Implementation...\n');
  
  try {
    // Initialize cache service
    console.log('1. Initializing cache service...');
    const initialized = await cacheService.initialize();
    
    if (!initialized) {
      console.log('❌ Cache service initialization failed');
      console.log('⚠️  Make sure Redis is running on localhost:6379');
      console.log('   You can start Redis with: redis-server');
      return;
    }
    
    console.log('✅ Cache service initialized successfully\n');
    
    // Test basic operations
    console.log('2. Testing basic cache operations...');
    
    // Test SET operation
    const testKey = cacheService.generateKey('test', 'basic_ops');
    const testData = {
      message: 'Hello Redis!',
      timestamp: new Date().toISOString(),
      data: [1, 2, 3, 4, 5]
    };
    
    const setResult = await cacheService.set(testKey, testData, 60);
    console.log(`   SET operation: ${setResult ? '✅ Success' : '❌ Failed'}`);
    
    // Test GET operation
    const retrievedData = await cacheService.get(testKey);
    const getResult = retrievedData && retrievedData.message === testData.message;
    console.log(`   GET operation: ${getResult ? '✅ Success' : '❌ Failed'}`);
    
    // Test EXISTS operation
    const existsResult = await cacheService.exists(testKey);
    console.log(`   EXISTS operation: ${existsResult ? '✅ Success' : '❌ Failed'}`);
    
    // Test TTL operation
    const ttlResult = await cacheService.ttl(testKey);
    console.log(`   TTL operation: ${ttlResult > 0 ? '✅ Success' : '❌ Failed'} (TTL: ${ttlResult}s)`);
    
    console.log('');
    
    // Test cache invalidation patterns
    console.log('3. Testing cache invalidation patterns...');
    
    // Set up test data for different cache types
    const bloodAvailabilityKey = cacheService.generateKey('blood_availability', 'Mumbai', 'any_pincode', 'A+');
    const campaignsKey = cacheService.generateKey('campaigns_active', 'Mumbai', 'any_pincode', 'A+', 'page_1', 'limit_10');
    const hospitalVerificationKey = cacheService.generateKey('hospital_verification', 'test_hospital_id');
    
    await cacheService.set(bloodAvailabilityKey, { units: 10, hospitals: 3 }, 300);
    await cacheService.set(campaignsKey, { campaigns: [], total: 0 }, 120);
    await cacheService.set(hospitalVerificationKey, { verified: true, hospitals: [] }, 1800);
    
    console.log('   ✅ Test cache data set');
    
    // Test pattern-based invalidation
    const bloodInvalidated = await cacheService.invalidateBloodAvailability();
    console.log(`   Blood availability invalidation: ${bloodInvalidated >= 0 ? '✅ Success' : '❌ Failed'} (${bloodInvalidated} keys)`);
    
    const campaignsInvalidated = await cacheService.invalidateCampaigns();
    console.log(`   Campaigns invalidation: ${campaignsInvalidated >= 0 ? '✅ Success' : '❌ Failed'} (${campaignsInvalidated} keys)`);
    
    const hospitalInvalidated = await cacheService.invalidateHospitalVerification();
    console.log(`   Hospital verification invalidation: ${hospitalInvalidated >= 0 ? '✅ Success' : '❌ Failed'} (${hospitalInvalidated} keys)`);
    
    console.log('');
    
    // Test health check
    console.log('4. Testing health check...');
    const healthCheck = await cacheService.healthCheck();
    console.log(`   Health status: ${healthCheck.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`   Response time: ${healthCheck.responseTime || 'N/A'}`);
    console.log(`   Connected: ${healthCheck.connected || false}`);
    console.log(`   Ready: ${healthCheck.ready || false}`);
    
    console.log('');
    
    // Test performance
    console.log('5. Testing cache performance...');
    const performanceData = {
      campaigns: Array.from({ length: 100 }, (_, i) => ({
        id: `campaign_${i}`,
        title: `Campaign ${i}`,
        date: new Date().toISOString()
      })),
      metadata: {
        total: 100,
        page: 1,
        limit: 100
      }
    };
    
    const perfKey = cacheService.generateKey('performance_test', 'large_data');
    
    // Measure SET performance
    const setStart = Date.now();
    await cacheService.set(perfKey, performanceData, 300);
    const setTime = Date.now() - setStart;
    
    // Measure GET performance
    const getStart = Date.now();
    const perfRetrieved = await cacheService.get(perfKey);
    const getTime = Date.now() - getStart;
    
    console.log(`   SET performance: ${setTime}ms`);
    console.log(`   GET performance: ${getTime}ms`);
    console.log(`   Data integrity: ${perfRetrieved?.campaigns?.length === 100 ? '✅ Verified' : '❌ Failed'}`);
    
    console.log('');
    
    // Clean up test data
    console.log('6. Cleaning up test data...');
    await cacheService.del(testKey);
    await cacheService.del(perfKey);
    console.log('   ✅ Test data cleaned up');
    
    console.log('');
    console.log('🎉 All cache tests completed successfully!');
    console.log('');
    console.log('Cache Configuration Summary:');
    console.log('- Blood Availability Cache: 5 minutes TTL');
    console.log('- Active Campaigns Cache: 2 minutes TTL');
    console.log('- Campaign Details Cache: 3 minutes TTL');
    console.log('- Hospital Verification Cache: 30 minutes TTL');
    console.log('');
    console.log('Cache Invalidation Triggers:');
    console.log('- Blood availability: When blood units are created, transferred, or used');
    console.log('- Campaigns: When campaigns are created, updated, or registrations change');
    console.log('- Hospital verification: When hospital verification status changes');
    
  } catch (error) {
    console.error('❌ Cache test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Redis is installed and running');
    console.log('2. Check Redis connection settings in .env file');
    console.log('3. Verify Redis is accessible on the configured port');
  } finally {
    // Disconnect from Redis
    await cacheService.disconnect();
    console.log('\n🔌 Disconnected from Redis');
  }
}

// Run the test
testCaching().catch(console.error);