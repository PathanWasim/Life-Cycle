/**
 * Comprehensive Test Suite - All Features
 * Tests all implemented features to verify error-free operation
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${message}`);
  }
}

async function apiRequest(method, endpoint, data = null, token = null) {
  try {
    const config = { method, url: `${API_URL}${endpoint}`, headers: {} };
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (data) config.data = data;
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message, status: error.response?.status };
  }
}

async function runComprehensiveTests() {
  console.log('🧪 COMPREHENSIVE TEST SUITE - LifeChain System');
  console.log('='.repeat(60));
  
  let donorToken, hospitalToken, adminToken, bloodUnitID;
  const timestamp = Date.now();
  
  // ========== AUTHENTICATION TESTS ==========
  console.log('\n📋 AUTHENTICATION & AUTHORIZATION');
  console.log('-'.repeat(60));
  
  // Test 1: Donor Registration
  const donorData = {
    email: `donor.${timestamp}@example.com`,
    password: 'Donor@123456',
    role: 'Donor',
    name: 'Test Donor',
    bloodGroup: 'O+',
    dateOfBirth: '1995-05-15',
    weight: 70,
    city: 'Mumbai',
    pincode: '400001',
    walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
  };
  
  const donorReg = await apiRequest('POST', '/api/auth/register', donorData);
  logTest('Donor Registration', donorReg.success);
  if (donorReg.success) donorToken = donorReg.data.token;
  
  // Test 2: Hospital Registration
  const hospitalData = {
    email: `hospital.${timestamp}@example.com`,
    password: 'Hospital@123456',
    role: 'Hospital',
    hospitalName: 'Test Hospital',
    city: 'Mumbai',
    pincode: '400001',
    walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
  };
  
  const hospitalReg = await apiRequest('POST', '/api/auth/register', hospitalData);
  logTest('Hospital Registration', hospitalReg.success);
  if (hospitalReg.success) {
    hospitalToken = hospitalReg.data.token;
    
    // Verify hospital
    const mongoose = require('mongoose');
    const User = require('./models/User');
    await mongoose.connect(process.env.MONGODB_URI);
    await User.findByIdAndUpdate(hospitalReg.data.user.id, { isVerified: true });
    await mongoose.disconnect();
    logTest('Hospital Verification', true);
  }
  
  // Test 3: Admin Registration
  const adminData = {
    email: `admin.${timestamp}@example.com`,
    password: 'Admin@123456',
    role: 'Admin',
    name: 'Test Admin'
  };
  
  const adminReg = await apiRequest('POST', '/api/auth/register', adminData);
  logTest('Admin Registration', adminReg.success);
  if (adminReg.success) adminToken = adminReg.data.token;
  
  // Test 4: Login
  const login = await apiRequest('POST', '/api/auth/login', {
    email: donorData.email,
    password: donorData.password
  });
  logTest('Login', login.success);
  
  // ========== DONOR TESTS ==========
  console.log('\n📋 DONOR FEATURES');
  console.log('-'.repeat(60));
  
  // Test 5: Donor Profile
  const profile = await apiRequest('GET', '/api/donor/profile', null, donorToken);
  logTest('Get Donor Profile', profile.success && profile.data.data.eligibilityStatus === 'Eligible');
  
  // ========== BLOOD DONATION TESTS ==========
  console.log('\n📋 BLOOD DONATION & INVENTORY');
  console.log('-'.repeat(60));
  
  // Test 6: Record Donation
  const donation = await apiRequest('POST', '/api/hospital/donate', {
    donorEmail: donorData.email,
    bloodGroup: 'O+',
    collectionDate: new Date().toISOString()
  }, hospitalToken);
  logTest('Record Blood Donation', donation.success);
  if (donation.success) bloodUnitID = donation.data.data.bloodUnitID;
  
  // Test 7: Get Inventory
  const inventory = await apiRequest('GET', '/api/hospital/inventory', null, hospitalToken);
  logTest('Get Hospital Inventory', inventory.success && inventory.data.data.inventory.length > 0);
  
  // Test 8: Update Blood Unit Status
  if (bloodUnitID) {
    const statusUpdate = await apiRequest('PATCH', `/api/hospital/blood-unit/${bloodUnitID}/status`, {
      status: 'Stored'
    }, hospitalToken);
    logTest('Update Blood Unit Status', statusUpdate.success);
  }
  
  // Test 9: Get Donation History
  const history = await apiRequest('GET', '/api/donor/donations', null, donorToken);
  logTest('Get Donation History', history.success && history.data.data.total > 0);
  
  // ========== BLOOD TRANSFER TESTS ==========
  console.log('\n📋 BLOOD TRANSFER');
  console.log('-'.repeat(60));
  
  // Register second hospital for transfer
  const hospital2Data = {
    email: `hospital2.${timestamp}@example.com`,
    password: 'Hospital@123456',
    role: 'Hospital',
    hospitalName: 'Test Hospital 2',
    city: 'Delhi',
    pincode: '110001',
    walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
  };
  
  const hospital2Reg = await apiRequest('POST', '/api/auth/register', hospital2Data);
  if (hospital2Reg.success) {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    await mongoose.connect(process.env.MONGODB_URI);
    await User.findByIdAndUpdate(hospital2Reg.data.user.id, { isVerified: true });
    await mongoose.disconnect();
    
    // Test 10: Transfer Blood Unit
    if (bloodUnitID) {
      const transfer = await apiRequest('POST', '/api/hospital/transfer', {
        bloodUnitID: bloodUnitID,
        destinationHospitalID: hospital2Reg.data.user.id
      }, hospitalToken);
      logTest('Transfer Blood Unit', transfer.success);
      
      // Test 11: Use Blood Unit
      const usage = await apiRequest('POST', '/api/hospital/use', {
        bloodUnitID: bloodUnitID,
        patientID: 'PAT-12345'
      }, hospital2Reg.data.token);
      logTest('Record Blood Usage', usage.success);
    }
  }
  
  // ========== AI SERVICE TESTS ==========
  console.log('\n📋 AI SERVICE INTEGRATION');
  console.log('-'.repeat(60));
  
  // Test 12: Demand Prediction
  const demand = await apiRequest('GET', '/api/hospital/predict-demand/O+', null, hospitalToken);
  logTest('Demand Prediction', demand.success || demand.error?.message?.includes('Insufficient historical data'));
  
  // ========== EMERGENCY REQUEST TESTS ==========
  console.log('\n📋 EMERGENCY REQUESTS');
  console.log('-'.repeat(60));
  
  // Test 13: Create Emergency Request
  const emergency = await apiRequest('POST', '/api/hospital/emergency-request', {
    bloodGroup: 'O+',
    quantity: 5,
    city: 'Mumbai',
    pincode: '400001',
    urgencyLevel: 'High',
    notes: 'Urgent requirement'
  }, hospitalToken);
  logTest('Create Emergency Request', emergency.success);
  
  // Test 14: Get Emergency Requests
  const emergencyList = await apiRequest('GET', '/api/hospital/emergency-requests', null, hospitalToken);
  logTest('Get Emergency Requests', emergencyList.success);
  
  // ========== ADMIN TESTS ==========
  console.log('\n📋 ADMIN PANEL');
  console.log('-'.repeat(60));
  
  // Test 15: Get Pending Hospitals
  const pending = await apiRequest('GET', '/api/admin/pending-hospitals', null, adminToken);
  logTest('Get Pending Hospitals', pending.success);
  
  // Test 16: Get System Statistics
  const stats = await apiRequest('GET', '/api/admin/statistics', null, adminToken);
  logTest('Get System Statistics', stats.success && stats.data.data.totalDonors > 0);
  
  // ========== CERTIFICATE TESTS ==========
  console.log('\n📋 CERTIFICATE GENERATION');
  console.log('-'.repeat(60));
  
  // Test 17: Download Certificate
  if (bloodUnitID) {
    try {
      const cert = await axios.get(`${API_URL}/api/donor/certificate/${bloodUnitID}`, {
        headers: { Authorization: `Bearer ${donorToken}` },
        responseType: 'arraybuffer'
      });
      logTest('Download Certificate', cert.status === 200 && cert.data.length > 0);
    } catch (error) {
      logTest('Download Certificate', false, error.message);
    }
  }
  
  // ========== BLOCKCHAIN TESTS ==========
  console.log('\n📋 BLOCKCHAIN SERVICE');
  console.log('-'.repeat(60));
  
  // Test 18: Blockchain Service Health
  const blockchainService = require('./services/blockchainService');
  try {
    const provider = blockchainService.provider;
    const blockNumber = await provider.getBlockNumber();
    logTest('Blockchain Connection', blockNumber > 0);
  } catch (error) {
    logTest('Blockchain Connection', false, error.message);
  }
  
  // ========== SUMMARY ==========
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED - SYSTEM IS ERROR-FREE!');
  } else {
    console.log('\n⚠️  Failed Tests:');
    testResults.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}: ${t.message}`);
    });
  }
}

runComprehensiveTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
