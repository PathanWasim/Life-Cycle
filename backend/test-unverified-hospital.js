/**
 * Test Unverified Hospital Restrictions
 * Verifies that unverified hospitals cannot create blood units
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

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
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

/**
 * Test 1: Register Unverified Hospital
 */
async function testRegisterUnverifiedHospital() {
  console.log('\n📝 Test 1: Register Unverified Hospital');
  
  const hospitalData = {
    email: `unverified.hospital.${Date.now()}@example.com`,
    password: 'Hospital@123456',
    role: 'Hospital',
    hospitalName: 'Unverified Test Hospital',
    city: 'Mumbai',
    pincode: '400001',
    walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
  };
  
  const result = await apiRequest('POST', '/api/auth/register', hospitalData);
  
  if (result.success) {
    console.log('✅ Hospital registered successfully (unverified by default)');
    console.log(`   Hospital: ${result.data.user.hospitalName}`);
    console.log(`   Verified: ${result.data.user.isVerified}`);
    return { token: result.data.token, email: hospitalData.email };
  } else {
    console.log('❌ Hospital registration failed:', result.error.message);
    return null;
  }
}

/**
 * Test 2: Register Donor
 */
async function testRegisterDonor() {
  console.log('\n📝 Test 2: Register Donor');
  
  const donorData = {
    email: `donor.unverified.${Date.now()}@example.com`,
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
  
  const result = await apiRequest('POST', '/api/auth/register', donorData);
  
  if (result.success) {
    console.log('✅ Donor registered successfully');
    console.log(`   Name: ${result.data.user.name}`);
    return donorData.email;
  } else {
    console.log('❌ Donor registration failed:', result.error.message);
    return null;
  }
}

/**
 * Test 3: Try to Record Donation with Unverified Hospital
 */
async function testDonationWithUnverifiedHospital(hospitalToken, donorEmail) {
  console.log('\n📝 Test 3: Try to Record Donation with Unverified Hospital');
  
  const donationData = {
    donorEmail: donorEmail,
    bloodGroup: 'O+',
    collectionDate: new Date().toISOString()
  };
  
  const result = await apiRequest('POST', '/api/hospital/donate', donationData, hospitalToken);
  
  if (!result.success && result.status === 403) {
    console.log('✅ Correctly denied donation recording for unverified hospital');
    console.log(`   Error message: ${result.error.message}`);
    return true;
  } else if (result.success) {
    console.log('❌ Should have denied donation recording for unverified hospital');
    console.log('   Unverified hospital was able to record donation!');
    return false;
  } else {
    console.log('❌ Unexpected error:', result.error.message);
    return false;
  }
}

/**
 * Test 4: Verify Hospital and Try Again
 */
async function testDonationWithVerifiedHospital(hospitalToken, donorEmail) {
  console.log('\n📝 Test 4: Verify Hospital and Try Donation Again');
  
  // Manually verify hospital in database
  const mongoose = require('mongoose');
  const User = require('./models/User');
  
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find hospital by token
  const jwt = require('jsonwebtoken');
  const decoded = jwt.verify(hospitalToken, process.env.JWT_SECRET);
  
  await User.findByIdAndUpdate(decoded.id, { isVerified: true });
  console.log('✅ Hospital verified in database');
  
  await mongoose.disconnect();
  
  // Try donation again
  const donationData = {
    donorEmail: donorEmail,
    bloodGroup: 'O+',
    collectionDate: new Date().toISOString()
  };
  
  const result = await apiRequest('POST', '/api/hospital/donate', donationData, hospitalToken);
  
  if (result.success) {
    console.log('✅ Donation recorded successfully with verified hospital');
    console.log(`   Blood Unit ID: ${result.data.data.bloodUnitID}`);
    return true;
  } else {
    console.log('❌ Donation recording failed:', result.error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting Unverified Hospital Restriction Tests...');
  console.log('=' .repeat(50));
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test 1: Register Unverified Hospital
  const hospitalData = await testRegisterUnverifiedHospital();
  if (hospitalData) {
    results.passed++;
    
    // Test 2: Register Donor
    const donorEmail = await testRegisterDonor();
    if (donorEmail) {
      results.passed++;
      
      // Test 3: Try Donation with Unverified Hospital
      if (await testDonationWithUnverifiedHospital(hospitalData.token, donorEmail)) {
        results.passed++;
      } else {
        results.failed++;
      }
      
      // Test 4: Verify Hospital and Try Again
      if (await testDonationWithVerifiedHospital(hospitalData.token, donorEmail)) {
        results.passed++;
      } else {
        results.failed++;
      }
    } else {
      results.failed += 3;
    }
  } else {
    results.failed += 4;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed!');
    console.log('✅ Unverified hospital restrictions are working correctly');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
  }
}

// Run tests
runTests().catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
