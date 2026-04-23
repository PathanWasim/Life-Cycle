/**
 * Test System Health Monitoring
 * Tests the comprehensive health check endpoint
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testHealthEndpoint() {
  console.log('🧪 Testing System Health Monitoring');
  console.log('='.repeat(60));
  
  try {
    console.log('\n📝 Test: GET /api/health');
    
    const response = await axios.get(`${API_URL}/api/health`);
    const healthData = response.data.data || response.data;
    
    console.log('\n✅ Health check endpoint responded');
    console.log(`   Overall Status: ${healthData.status}`);
    console.log(`   Uptime: ${healthData.uptime} seconds`);
    console.log(`   Timestamp: ${healthData.timestamp}`);
    
    // Check MongoDB
    console.log('\n🗄️  MongoDB:');
    const mongo = healthData.components.mongodb;
    console.log(`   Status: ${mongo.status === 'healthy' ? '✅' : '❌'} ${mongo.status}`);
    console.log(`   Response Time: ${mongo.responseTime || 'N/A'}`);
    console.log(`   Database: ${mongo.database || 'N/A'}`);
    if (mongo.error) console.log(`   Error: ${mongo.error}`);
    
    // Check Blockchain
    console.log('\n⛓️  Blockchain:');
    const blockchain = healthData.components.blockchain;
    console.log(`   Status: ${blockchain.status === 'healthy' ? '✅' : '❌'} ${blockchain.status}`);
    console.log(`   Response Time: ${blockchain.responseTime || 'N/A'}`);
    console.log(`   Network: ${blockchain.network || 'N/A'}`);
    console.log(`   Latest Block: ${blockchain.latestBlock || 'N/A'}`);
    console.log(`   Contract: ${blockchain.contractAddress || 'N/A'}`);
    if (blockchain.error) console.log(`   Error: ${blockchain.error}`);
    
    // Check AI Service
    console.log('\n🤖 AI Service:');
    const ai = healthData.components.aiService;
    console.log(`   Status: ${ai.status === 'healthy' ? '✅' : '❌'} ${ai.status}`);
    console.log(`   Response Time: ${ai.responseTime || 'N/A'}`);
    console.log(`   Models Available: ${ai.modelsAvailable ? '✅ Yes' : '❌ No'}`);
    console.log(`   URL: ${ai.url || 'N/A'}`);
    if (ai.error) console.log(`   Error: ${ai.error}`);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    
    const allHealthy = healthData.status === 'healthy';
    
    if (allHealthy) {
      console.log('🎉 All systems operational!');
      console.log('✅ MongoDB: Connected');
      console.log('✅ Blockchain: Connected');
      console.log('✅ AI Service: Connected');
    } else {
      console.log('⚠️  System Status: Degraded');
      console.log('Some components are experiencing issues.');
    }
    
    console.log('\n📊 Test Result: ✅ Health endpoint working correctly');
    
  } catch (error) {
    console.error('\n❌ Health check failed:', error.message);
    
    if (error.response) {
      console.log(`   Status Code: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

testHealthEndpoint();
