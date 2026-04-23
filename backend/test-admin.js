/**
 * Test Admin Endpoints
 * Tests hospital verification, rejection, and statistics
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Test credentials
let adminToken = '';
let hospitalToken = '';
let hospitalID = '';

/**
 * Helper function to make API requests
 */
async function apiRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Test 1: Create Admin User Directly (Admin registration not public)
 */
async function testCreateAdmin() {
  console.log('\n📝 Test 1: Create Admin User (Direct DB)');
  
  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');
  const User = require('./models/User');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if admin already exists
    let admin = await User.findOne({ role: 'Admin' });
    
    if (!admin) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123456', salt);
      
      admin = await User.create({
        email: 'admin@lifechain.com',
        password: hashedPassword,
        role: 'Admin',
        walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
      });
      
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    console.log(`   Email: ${admin.email}`);
    
    // Now login to get token
    const loginResult = await apiRequest('POST', '/api/auth/login', {
      email: admin.email,
      password: 'Admin@123456'
    });
    
    if (loginResult.success) {
      adminToken = loginResult.data.token;
      console.log(`   Token obtained: ${adminToken.substring(0, 20)}...`);
      await mongoose.disconnect();
      return true;
    } else {
      console.log('❌ Admin login failed:', loginResult.error.message);
      await mongoose.disconnect();
      return false;
    }
    
  } catch (error) {
    console.log('❌ Admin creation failed:', error.message);
    await mongoose.disconnect();
    return false;
  }
}

/**
 * Test 2: Register Unverified Hospital
 */
async function testRegisterHospital() {
  console.log('\n📝 Test 2: Register Unverified Hospital');
  
  const hospitalData = {
    email: `hospital.test.${Date.now()}@example.com`,
    password: 'Hospital@123456',
    role: 'Hospital',
    hospitalName: 'Test Hospital for Verification',
    city: 'Mumbai',
    pincode: '400001',
    walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
  };
  
  const result = await apiRequest('POST', '/api/auth/register', hospitalData);
  
  if (result.success) {
    console.log('✅ Hospital registered successfully');
    hospitalToken = result.data.token;
    hospitalID = result.data.user.id;
    console.log(`   Hospital ID: ${hospitalID}`);
    console.log(`   Verified: ${result.data.user.isVerified}`);
  } else {
    console.log('❌ Hospital registration failed:', result.error.message);
  }
  
  return result.success;
}

/**
 * Test 3: Get Pending Hospitals
 */
async function testGetPendingHospitals() {
  console.log('\n📝 Test 3: Get Pending Hospitals');
  
  const result = await apiRequest('GET', '/api/admin/pending-hospitals', null, adminToken);
  
  if (result.success) {
    console.log('✅ Pending hospitals retrieved successfully');
    console.log(`   Total pending: ${result.data.data.total}`);
    if (result.data.data.hospitals.length > 0) {
      console.log(`   First hospital: ${result.data.data.hospitals[0].hospitalName}`);
    }
  } else {
    console.log('❌ Failed to get pending hospitals:', result.error.message);
  }
  
  return result.success;
}

/**
 * Test 4: Verify Hospital (should send email)
 */
async function testVerifyHospital() {
  console.log('\n📝 Test 4: Verify Hospital');
  
  const result = await apiRequest('POST', `/api/admin/verify-hospital/${hospitalID}`, null, adminToken);
  
  if (result.success) {
    console.log('✅ Hospital verified successfully');
    console.log(`   Hospital: ${result.data.data.hospitalName}`);
    console.log(`   Verified: ${result.data.data.isVerified}`);
    console.log('   📧 Verification email should be sent (check console logs)');
  } else {
    console.log('❌ Hospital verification failed:', result.error.message);
  }
  
  return result.success;
}

/**
 * Test 5: Try to verify already verified hospital
 */
async function testVerifyAlreadyVerified() {
  console.log('\n📝 Test 5: Try to Verify Already Verified Hospital');
  
  const result = await apiRequest('POST', `/api/admin/verify-hospital/${hospitalID}`, null, adminToken);
  
  if (!result.success && result.error.message === 'Hospital is already verified') {
    console.log('✅ Correctly rejected already verified hospital');
  } else {
    console.log('❌ Should have rejected already verified hospital');
  }
  
  return !result.success;
}

/**
 * Test 6: Get System Statistics
 */
async function testGetStatistics() {
  console.log('\n📝 Test 6: Get System Statistics');
  
  const result = await apiRequest('GET', '/api/admin/statistics', null, adminToken);
  
  if (result.success) {
    console.log('✅ Statistics retrieved successfully');
    console.log(`   Total Donors: ${result.data.data.totalDonors}`);
    console.log(`   Total Hospitals: ${result.data.data.totalHospitals}`);
    console.log(`   Pending Hospitals: ${result.data.data.pendingHospitals}`);
    console.log(`   Total Blood Units: ${result.data.data.totalBloodUnits}`);
    console.log(`   Active Emergency Requests: ${result.data.data.activeEmergencyRequests}`);
  } else {
    console.log('❌ Failed to get statistics:', result.error.message);
  }
  
  return result.success;
}

/**
 * Test 7: Register Another Hospital for Rejection Test
 */
async function testRegisterHospitalForRejection() {
  console.log('\n📝 Test 7: Register Hospital for Rejection Test');
  
  const hospitalData = {
    email: `hospital.reject.${Date.now()}@example.com`,
    password: 'Hospital@123456',
    role: 'Hospital',
    hospitalName: 'Test Hospital for Rejection',
    city: 'Delhi',
    pincode: '110001',
    walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
  };
  
  const result = await apiRequest('POST', '/api/auth/register', hospitalData);
  
  if (result.success) {
    console.log('✅ Hospital registered successfully');
    const rejectHospitalID = result.data.user.id;
    console.log(`   Hospital ID: ${rejectHospitalID}`);
    return rejectHospitalID;
  } else {
    console.log('❌ Hospital registration failed:', result.error.message);
    return null;
  }
}

/**
 * Test 8: Reject Hospital (should send email)
 */
async function testRejectHospital(rejectHospitalID) {
  console.log('\n📝 Test 8: Reject Hospital');
  
  const result = await apiRequest('DELETE', `/api/admin/reject-hospital/${rejectHospitalID}`, null, adminToken);
  
  if (result.success) {
    console.log('✅ Hospital rejected successfully');
    console.log(`   Hospital: ${result.data.data.hospitalName}`);
    console.log('   📧 Rejection email should be sent (check console logs)');
  } else {
    console.log('❌ Hospital rejection failed:', result.error.message);
  }
  
  return result.success;
}

/**
 * Test 9: Try to reject verified hospital
 */
async function testRejectVerifiedHospital() {
  console.log('\n📝 Test 9: Try to Reject Verified Hospital');
  
  const result = await apiRequest('DELETE', `/api/admin/reject-hospital/${hospitalID}`, null, adminToken);
  
  if (!result.success && result.error.message === 'Cannot reject verified hospital. Please contact support.') {
    console.log('✅ Correctly rejected attempt to delete verified hospital');
  } else {
    console.log('❌ Should have rejected deletion of verified hospital');
  }
  
  return !result.success;
}

/**
 * Test 10: Non-admin cannot access admin endpoints
 */
async function testNonAdminAccess() {
  console.log('\n📝 Test 10: Non-Admin Cannot Access Admin Endpoints');
  
  const result = await apiRequest('GET', '/api/admin/pending-hospitals', null, hospitalToken);
  
  if (!result.success && result.error.message === 'Access denied. Insufficient permissions.') {
    console.log('✅ Correctly denied non-admin access');
  } else {
    console.log('❌ Should have denied non-admin access');
  }
  
  return !result.success;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting Admin Endpoint Tests...');
  console.log('=' .repeat(50));
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test 1: Create Admin
  if (await testCreateAdmin()) results.passed++; else results.failed++;
  
  // Test 2: Register Hospital
  if (await testRegisterHospital()) results.passed++; else results.failed++;
  
  // Test 3: Get Pending Hospitals
  if (await testGetPendingHospitals()) results.passed++; else results.failed++;
  
  // Test 4: Verify Hospital
  if (await testVerifyHospital()) results.passed++; else results.failed++;
  
  // Test 5: Try to verify already verified
  if (await testVerifyAlreadyVerified()) results.passed++; else results.failed++;
  
  // Test 6: Get Statistics
  if (await testGetStatistics()) results.passed++; else results.failed++;
  
  // Test 7 & 8: Register and Reject Hospital
  const rejectHospitalID = await testRegisterHospitalForRejection();
  if (rejectHospitalID) {
    results.passed++;
    if (await testRejectHospital(rejectHospitalID)) results.passed++; else results.failed++;
  } else {
    results.failed += 2;
  }
  
  // Test 9: Try to reject verified hospital
  if (await testRejectVerifiedHospital()) results.passed++; else results.failed++;
  
  // Test 10: Non-admin access
  if (await testNonAdminAccess()) results.passed++; else results.failed++;
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
  }
}

// Run tests
runTests().catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
