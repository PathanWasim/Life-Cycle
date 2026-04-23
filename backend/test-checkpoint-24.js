/**
 * Task 24: Checkpoint - Backend API Complete
 * Comprehensive test to verify all backend functionality
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
  }
  if (details) console.log(`   ${details}`);
}

async function runCheckpoint() {
  console.log('🧪 Task 24: Backend API Complete Checkpoint');
  console.log('='.repeat(70));
  console.log('\n📋 Testing all backend functionality...\n');

  let donorToken, hospitalToken, adminToken;
  let donorId, hospitalId;
  let bloodUnitId;
  let donorEmail, hospitalEmail;

  try {
    // ========================================
    // 1. HEALTH CHECK
    // ========================================
    console.log('1️⃣  Health Check');
    console.log('-'.repeat(70));
    
    try {
      const health = await axios.get(`${API_URL}/api/health`);
      const healthData = health.data.data || health.data;
      
      const mongoHealthy = healthData.components.mongodb.status === 'healthy';
      const blockchainHealthy = healthData.components.blockchain.status === 'healthy';
      const aiHealthy = healthData.components.aiService.status === 'healthy';
      
      logTest('Health endpoint responds', true, `Status: ${healthData.status}`);
      logTest('MongoDB connectivity', mongoHealthy, healthData.components.mongodb.responseTime);
      logTest('Blockchain connectivity', blockchainHealthy, healthData.components.blockchain.responseTime);
      logTest('AI Service connectivity', aiHealthy, healthData.components.aiService.responseTime);
    } catch (error) {
      logTest('Health check', false, error.message);
    }

    // ========================================
    // 2. AUTHENTICATION & AUTHORIZATION
    // ========================================
    console.log('\n2️⃣  Authentication & Authorization');
    console.log('-'.repeat(70));
    
    // Register donor
    try {
      donorEmail = `checkpoint.donor.${Date.now()}@test.com`;
      const donorData = {
        name: 'Checkpoint Donor',
        email: donorEmail,
        password: 'Test@1234',
        role: 'Donor',
        bloodGroup: 'O+',
        dateOfBirth: '1995-01-01',
        weight: 70,
        city: 'Mumbai',
        pincode: '400001',
        phone: '9876543210',
        walletAddress: '0x' + Math.random().toString(16).substring(2, 42).padEnd(40, '0')
      };
      
      const donorReg = await axios.post(`${API_URL}/api/auth/register`, donorData);
      donorToken = donorReg.data.token;
      donorId = donorReg.data.user.id;
      
      logTest('Donor registration', true, `ID: ${donorId}`);
    } catch (error) {
      logTest('Donor registration', false, error.response?.data?.message || error.message);
    }

    // Register hospital
    try {
      hospitalEmail = `checkpoint.hospital.${Date.now()}@test.com`;
      const hospitalData = {
        hospitalName: 'Checkpoint Hospital',
        email: hospitalEmail,
        password: 'Test@1234',
        role: 'Hospital',
        city: 'Mumbai',
        pincode: '400001',
        phone: '9876543211',
        walletAddress: '0x' + Math.random().toString(16).substring(2, 42).padEnd(40, '0')
      };
      
      const hospitalReg = await axios.post(`${API_URL}/api/auth/register`, hospitalData);
      hospitalToken = hospitalReg.data.token;
      hospitalId = hospitalReg.data.user.id;
      
      logTest('Hospital registration', true, `ID: ${hospitalId}`);
    } catch (error) {
      logTest('Hospital registration', false, error.response?.data?.message || error.message);
    }

    // Login test
    try {
      const loginData = {
        email: donorEmail,
        password: 'Test@1234'
      };
      
      const loginRes = await axios.post(`${API_URL}/api/auth/login`, loginData);
      logTest('Login with valid credentials', true, 'Token received');
    } catch (error) {
      logTest('Login with valid credentials', false, error.response?.data?.message || error.message);
    }

    // Test protected route without token
    try {
      await axios.get(`${API_URL}/api/donor/profile`);
      logTest('Protected route without token', false, 'Should have returned 401');
    } catch (error) {
      if (error.response?.status === 401) {
        logTest('Protected route without token', true, 'Returns 401 as expected');
      } else {
        logTest('Protected route without token', false, error.message);
      }
    }

    // Test protected route with token
    try {
      const profile = await axios.get(`${API_URL}/api/donor/profile`, {
        headers: { Authorization: `Bearer ${donorToken}` }
      });
      logTest('Protected route with token', true, `Donor: ${profile.data.donor.name}`);
    } catch (error) {
      logTest('Protected route with token', false, error.response?.data?.message || error.message);
    }

    // ========================================
    // 3. DONOR ENDPOINTS
    // ========================================
    console.log('\n3️⃣  Donor Endpoints');
    console.log('-'.repeat(70));
    
    try {
      const profile = await axios.get(`${API_URL}/api/donor/profile`, {
        headers: { Authorization: `Bearer ${donorToken}` }
      });
      logTest('GET /api/donor/profile', true, `Eligibility: ${profile.data.donor.eligibilityStatus}`);
    } catch (error) {
      logTest('GET /api/donor/profile', false, error.response?.data?.message || error.message);
    }

    try {
      const donations = await axios.get(`${API_URL}/api/donor/donations`, {
        headers: { Authorization: `Bearer ${donorToken}` }
      });
      logTest('GET /api/donor/donations', true, `Count: ${donations.data.donations.length}`);
    } catch (error) {
      logTest('GET /api/donor/donations', false, error.response?.data?.message || error.message);
    }

    // ========================================
    // 4. ADMIN ENDPOINTS
    // ========================================
    console.log('\n4️⃣  Admin Endpoints');
    console.log('-'.repeat(70));
    
    // Create admin token (using existing admin or create one)
    try {
      const adminLogin = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'admin@lifechain.com',
        password: 'Admin@1234'
      });
      adminToken = adminLogin.data.token;
      logTest('Admin login', true, 'Admin authenticated');
    } catch (error) {
      // Try to register admin if doesn't exist
      try {
        const adminReg = await axios.post(`${API_URL}/api/auth/register`, {
          name: 'System Admin',
          email: 'admin@lifechain.com',
          password: 'Admin@1234',
          role: 'Admin',
          walletAddress: '0x' + Math.random().toString(16).substring(2, 42).padEnd(40, '0')
        });
        adminToken = adminReg.data.token;
        logTest('Admin creation', true, 'Admin account created');
      } catch (regError) {
        logTest('Admin setup', false, regError.response?.data?.message || 'Could not create or login admin');
      }
    }

    if (adminToken) {
      // Verify hospital
      try {
        await axios.post(`${API_URL}/api/admin/verify-hospital/${hospitalId}`, {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('POST /api/admin/verify-hospital', true, 'Hospital verified');
      } catch (error) {
        logTest('POST /api/admin/verify-hospital', false, error.response?.data?.message || error.message);
      }

      // Get statistics
      try {
        const stats = await axios.get(`${API_URL}/api/admin/statistics`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('GET /api/admin/statistics', true, `Donors: ${stats.data.statistics.totalDonors}, Hospitals: ${stats.data.statistics.totalHospitals}`);
      } catch (error) {
        logTest('GET /api/admin/statistics', false, error.response?.data?.message || error.message);
      }
    }

    // ========================================
    // 5. BLOOD DONATION & INVENTORY
    // ========================================
    console.log('\n5️⃣  Blood Donation & Inventory');
    console.log('-'.repeat(70));
    
    // Record donation
    try {
      const donation = await axios.post(`${API_URL}/api/hospital/donate`, {
        donorID: donorId,
        bloodGroup: 'O+',
        collectionDate: new Date().toISOString()
      }, {
        headers: { Authorization: `Bearer ${hospitalToken}` }
      });
      
      bloodUnitId = donation.data.bloodUnit.bloodUnitID;
      const txHash = donation.data.bloodUnit.donationTxHash || 'Queued for retry';
      
      logTest('POST /api/hospital/donate', true, `Blood Unit: ${bloodUnitId}`);
      logTest('Blockchain milestone recording', txHash !== 'Queued for retry', `TX: ${txHash.substring(0, 20)}...`);
    } catch (error) {
      logTest('POST /api/hospital/donate', false, error.response?.data?.message || error.message);
    }

    // Get inventory
    try {
      const inventory = await axios.get(`${API_URL}/api/hospital/inventory`, {
        headers: { Authorization: `Bearer ${hospitalToken}` }
      });
      logTest('GET /api/hospital/inventory', true, `Total units: ${inventory.data.summary.total}`);
    } catch (error) {
      logTest('GET /api/hospital/inventory', false, error.response?.data?.message || error.message);
    }

    // ========================================
    // 6. AI SERVICE INTEGRATION
    // ========================================
    console.log('\n6️⃣  AI Service Integration');
    console.log('-'.repeat(70));
    
    try {
      const prediction = await axios.get(`${API_URL}/api/hospital/predict-demand/O+`, {
        headers: { Authorization: `Bearer ${hospitalToken}` }
      });
      logTest('GET /api/hospital/predict-demand', true, `Confidence: ${prediction.data.prediction.confidence}`);
    } catch (error) {
      logTest('GET /api/hospital/predict-demand', false, error.response?.data?.message || error.message);
    }

    // ========================================
    // 7. EMERGENCY REQUESTS
    // ========================================
    console.log('\n7️⃣  Emergency Requests');
    console.log('-'.repeat(70));
    
    try {
      const emergency = await axios.post(`${API_URL}/api/hospital/emergency-request`, {
        bloodGroup: 'O+',
        quantity: 2,
        city: 'Mumbai',
        pincode: '400001',
        urgencyLevel: 'High',
        notes: 'Checkpoint test'
      }, {
        headers: { Authorization: `Bearer ${hospitalToken}` }
      });
      logTest('POST /api/hospital/emergency-request', true, `Notified: ${emergency.data.notifiedDonors} donors`);
    } catch (error) {
      logTest('POST /api/hospital/emergency-request', false, error.response?.data?.message || error.message);
    }

    // ========================================
    // 8. BLOCKCHAIN VERIFICATION
    // ========================================
    console.log('\n8️⃣  Blockchain Verification');
    console.log('-'.repeat(70));
    
    if (bloodUnitId) {
      try {
        const milestones = await axios.get(`${API_URL}/api/blockchain/milestones/${bloodUnitId}`);
        logTest('GET /api/blockchain/milestones', true, `Milestones: ${milestones.data.milestones.length}`);
      } catch (error) {
        logTest('GET /api/blockchain/milestones', false, error.response?.data?.message || error.message);
      }
    }

    // ========================================
    // 9. CERTIFICATE GENERATION
    // ========================================
    console.log('\n9️⃣  Certificate Generation');
    console.log('-'.repeat(70));
    
    if (bloodUnitId) {
      try {
        const cert = await axios.get(`${API_URL}/api/donor/certificate/${bloodUnitId}`, {
          headers: { Authorization: `Bearer ${donorToken}` },
          responseType: 'arraybuffer'
        });
        const pdfSize = cert.data.byteLength;
        logTest('GET /api/donor/certificate', true, `PDF size: ${(pdfSize / 1024).toFixed(2)} KB`);
      } catch (error) {
        logTest('GET /api/donor/certificate', false, error.response?.data?.message || error.message);
      }
    }

  } catch (error) {
    console.error('\n❌ Checkpoint failed with error:', error.message);
  }

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n' + '='.repeat(70));
  console.log('📊 CHECKPOINT SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Backend API is complete and ready for frontend development.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the results above.');
  }
  
  console.log('\n✅ Task 24 Checkpoint Complete');
}

runCheckpoint();
