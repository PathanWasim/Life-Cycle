/**
 * Test Certificate Generation
 * Tests donation history and certificate download
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Test credentials
let donorToken = '';
let hospitalToken = '';
let bloodUnitID = '';

/**
 * Helper function to make API requests
 */
async function apiRequest(method, endpoint, data = null, token = null, responseType = 'json') {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {},
      responseType
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
 * Test 1: Register Donor
 */
async function testRegisterDonor() {
  console.log('\n📝 Test 1: Register Donor');
  
  const donorData = {
    email: `donor.cert.${Date.now()}@example.com`,
    password: 'Donor@123456',
    role: 'Donor',
    name: 'Certificate Test Donor',
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
    donorToken = result.data.token;
    console.log(`   Name: ${result.data.user.name}`);
    console.log(`   Blood Group: ${result.data.user.bloodGroup}`);
  } else {
    console.log('❌ Donor registration failed:', result.error.message);
  }
  
  return result.success;
}

/**
 * Test 2: Register and Verify Hospital
 */
async function testRegisterHospital() {
  console.log('\n📝 Test 2: Register and Verify Hospital');
  
  const hospitalData = {
    email: `hospital.cert.${Date.now()}@example.com`,
    password: 'Hospital@123456',
    role: 'Hospital',
    hospitalName: 'Certificate Test Hospital',
    city: 'Mumbai',
    pincode: '400001',
    walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
  };
  
  const result = await apiRequest('POST', '/api/auth/register', hospitalData);
  
  if (result.success) {
    console.log('✅ Hospital registered successfully');
    hospitalToken = result.data.token;
    const hospitalID = result.data.user.id;
    
    // Manually verify hospital in database
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    await mongoose.connect(process.env.MONGODB_URI);
    await User.findByIdAndUpdate(hospitalID, { isVerified: true });
    await mongoose.disconnect();
    
    console.log('✅ Hospital verified');
    return true;
  } else {
    console.log('❌ Hospital registration failed:', result.error.message);
    return false;
  }
}

/**
 * Test 3: Record Blood Donation
 */
async function testRecordDonation(donorEmail) {
  console.log('\n📝 Test 3: Record Blood Donation');
  
  const donationData = {
    donorEmail: donorEmail,
    bloodGroup: 'O+',
    collectionDate: new Date().toISOString()
  };
  
  const result = await apiRequest('POST', '/api/hospital/donate', donationData, hospitalToken);
  
  if (result.success) {
    console.log('✅ Blood donation recorded successfully');
    bloodUnitID = result.data.data.bloodUnitID;
    console.log(`   Blood Unit ID: ${bloodUnitID}`);
    console.log(`   Blockchain Status: ${result.data.data.blockchainStatus}`);
  } else {
    console.log('❌ Blood donation recording failed:', result.error.message);
  }
  
  return result.success;
}

/**
 * Test 4: Get Donation History
 */
async function testGetDonationHistory() {
  console.log('\n📝 Test 4: Get Donation History');
  
  const result = await apiRequest('GET', '/api/donor/donations', null, donorToken);
  
  if (result.success) {
    console.log('✅ Donation history retrieved successfully');
    console.log(`   Total donations: ${result.data.data.total}`);
    if (result.data.data.donations.length > 0) {
      const donation = result.data.data.donations[0];
      console.log(`   Latest donation: ${donation.bloodUnitID}`);
      console.log(`   Status: ${donation.status}`);
      console.log(`   Hospital: ${donation.originalHospital.name}`);
    }
  } else {
    console.log('❌ Failed to get donation history:', result.error.message);
  }
  
  return result.success;
}

/**
 * Test 5: Download Certificate
 */
async function testDownloadCertificate() {
  console.log('\n📝 Test 5: Download Certificate');
  
  const result = await apiRequest('GET', `/api/donor/certificate/${bloodUnitID}`, null, donorToken, 'arraybuffer');
  
  if (result.success) {
    console.log('✅ Certificate downloaded successfully');
    
    // Save PDF to file for manual inspection
    const outputPath = path.join(__dirname, `certificate-${bloodUnitID}.pdf`);
    fs.writeFileSync(outputPath, result.data);
    
    console.log(`   PDF saved to: ${outputPath}`);
    console.log(`   File size: ${(result.data.length / 1024).toFixed(2)} KB`);
    
    return true;
  } else {
    console.log('❌ Certificate download failed:', result.error.message || result.error);
    return false;
  }
}

/**
 * Test 6: Try to download certificate for non-owned blood unit
 */
async function testUnauthorizedCertificateDownload() {
  console.log('\n📝 Test 6: Try to Download Certificate for Non-Owned Blood Unit');
  
  // Register another donor
  const otherDonorData = {
    email: `other.donor.${Date.now()}@example.com`,
    password: 'Donor@123456',
    role: 'Donor',
    name: 'Other Donor',
    bloodGroup: 'A+',
    dateOfBirth: '1990-01-01',
    weight: 65,
    city: 'Delhi',
    pincode: '110001',
    walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
  };
  
  const registerResult = await apiRequest('POST', '/api/auth/register', otherDonorData);
  
  if (!registerResult.success) {
    console.log('❌ Failed to register other donor');
    return false;
  }
  
  const otherDonorToken = registerResult.data.token;
  
  // Try to download certificate with other donor's token
  try {
    const config = {
      method: 'GET',
      url: `${API_URL}/api/donor/certificate/${bloodUnitID}`,
      headers: {
        Authorization: `Bearer ${otherDonorToken}`
      },
      responseType: 'arraybuffer'
    };
    
    await axios(config);
    console.log('❌ Should have denied unauthorized certificate download');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Correctly denied unauthorized certificate download');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.message);
      return false;
    }
  }
}

/**
 * Test 7: Try to download certificate for non-existent blood unit
 */
async function testNonExistentCertificate() {
  console.log('\n📝 Test 7: Try to Download Certificate for Non-Existent Blood Unit');
  
  try {
    const config = {
      method: 'GET',
      url: `${API_URL}/api/donor/certificate/BU-NONEXISTENT`,
      headers: {
        Authorization: `Bearer ${donorToken}`
      },
      responseType: 'arraybuffer'
    };
    
    await axios(config);
    console.log('❌ Should have returned 404 for non-existent blood unit');
    return false;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Correctly returned 404 for non-existent blood unit');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.message);
      return false;
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting Certificate Generation Tests...');
  console.log('=' .repeat(50));
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test 1: Register Donor
  if (await testRegisterDonor()) {
    results.passed++;
    
    // Get donor email for donation
    const donorEmail = `donor.cert.${Date.now()}@example.com`;
    
    // Test 2: Register Hospital
    if (await testRegisterHospital()) {
      results.passed++;
      
      // Test 3: Record Donation
      // Need to use the actual donor email from Test 1
      // Extract from the registration response
      const mongoose = require('mongoose');
      const User = require('./models/User');
      
      await mongoose.connect(process.env.MONGODB_URI);
      const donor = await User.findById((await apiRequest('GET', '/api/donor/profile', null, donorToken)).data.data.id);
      await mongoose.disconnect();
      
      if (await testRecordDonation(donor.email)) {
        results.passed++;
        
        // Test 4: Get Donation History
        if (await testGetDonationHistory()) results.passed++; else results.failed++;
        
        // Test 5: Download Certificate
        if (await testDownloadCertificate()) results.passed++; else results.failed++;
        
        // Test 6: Unauthorized Download
        if (await testUnauthorizedCertificateDownload()) results.passed++; else results.failed++;
        
        // Test 7: Non-existent Certificate
        if (await testNonExistentCertificate()) results.passed++; else results.failed++;
      } else {
        results.failed += 5;
      }
    } else {
      results.failed += 6;
    }
  } else {
    results.failed += 7;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed!');
    console.log(`\n📄 Check the generated PDF: certificate-${bloodUnitID}.pdf`);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
  }
}

// Run tests
runTests().catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
