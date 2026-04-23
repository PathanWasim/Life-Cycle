/**
 * Summary Report - Task Completion Status
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function checkSystemHealth() {
  console.log('🏥 LIFECHAIN SYSTEM HEALTH CHECK');
  console.log('='.repeat(60));
  
  // Check Backend
  console.log('\n📡 Backend Server');
  try {
    const response = await axios.get(`${API_URL}/api/auth/login`);
    console.log('   Status: ❌ Unexpected response');
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 404) {
      console.log('   Status: ✅ Running (port 5000)');
    } else {
      console.log('   Status: ❌ Not responding');
    }
  }
  
  // Check AI Service
  console.log('\n🤖 AI Service');
  try {
    const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.get(`${AI_URL}/api/health`);
    console.log('   Status: ✅ Running (port 5001)');
    console.log(`   Models: ${response.data.models_available ? '✅ Loaded' : '❌ Not loaded'}`);
  } catch (error) {
    console.log('   Status: ❌ Not responding');
  }
  
  // Check MongoDB
  console.log('\n🗄️  MongoDB Database');
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   Status: ✅ Connected');
    console.log(`   Database: ${mongoose.connection.name}`);
    await mongoose.disconnect();
  } catch (error) {
    console.log('   Status: ❌ Connection failed');
  }
  
  // Check Blockchain
  console.log('\n⛓️  Blockchain (Polygon Amoy)');
  const blockchainService = require('./services/blockchainService');
  try {
    const blockNumber = await blockchainService.provider.getBlockNumber();
    console.log('   Status: ✅ Connected');
    console.log(`   Latest Block: ${blockNumber}`);
    console.log(`   Contract: ${process.env.CONTRACT_ADDRESS}`);
  } catch (error) {
    console.log('   Status: ❌ Connection failed');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TASK COMPLETION STATUS');
  console.log('='.repeat(60));
  console.log('✅ Completed: 21 out of 35 tasks (60%)');
  console.log('\nCompleted Tasks:');
  console.log('  1. ✅ Project Setup');
  console.log('  2. ✅ MongoDB Schemas');
  console.log('  3. ✅ Blockchain Foundation');
  console.log('  4. ✅ Blockchain Verification');
  console.log('  5. ✅ Authentication & Middleware');
  console.log('  6. ✅ Blockchain Service Integration');
  console.log('  7. ✅ Donor Eligibility Validation');
  console.log('  8. ✅ Blood Donation Recording');
  console.log('  9. ✅ Blood Inventory Management');
  console.log(' 10. ✅ Blood Transfer');
  console.log(' 11. ✅ Blood Usage Recording');
  console.log(' 12. ✅ Supply Chain Flow Test');
  console.log(' 13. ✅ AI Service Setup');
  console.log(' 14. ✅ AI Donor Recommendations');
  console.log(' 15. ✅ AI Expiry Alerts');
  console.log(' 16. ✅ AI Service Integration');
  console.log(' 17. ✅ Emergency Request Handling');
  console.log(' 18. ✅ Email Notification System');
  console.log(' 19. ✅ Certificate Generation');
  console.log(' 20. ✅ Donor Endpoints');
  console.log(' 21. ✅ Admin Panel Endpoints');
  
  console.log('\nRemaining Tasks:');
  console.log(' 22. ⏳ Blockchain Verification Endpoints');
  console.log(' 23. ⏳ System Health Monitoring');
  console.log(' 24. ⏳ Backend API Complete Checkpoint');
  console.log(' 25. ⏳ Frontend Setup & Authentication');
  console.log(' 26. ⏳ Donor Dashboard');
  console.log(' 27. ⏳ Hospital Dashboard');
  console.log(' 28. ⏳ Admin Panel Frontend');
  console.log(' 29. ⏳ Shared Components');
  console.log(' 30. ⏳ Frontend Complete Checkpoint');
  console.log(' 31. ⏳ Testing & QA');
  console.log(' 32. ⏳ Deployment Preparation');
  console.log(' 33. ⏳ Production Deployment');
  console.log(' 34. ⏳ Final Testing');
  console.log(' 35. ⏳ System Complete Checkpoint');
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 NEXT MILESTONE: Task 22 - Blockchain Verification Endpoints');
  console.log('='.repeat(60));
}

checkSystemHealth().catch(err => {
  console.error('❌ Health check failed:', err);
  process.exit(1);
});
