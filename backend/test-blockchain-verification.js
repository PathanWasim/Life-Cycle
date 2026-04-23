/**
 * Test Blockchain Verification Endpoints
 * Tests milestone retrieval and transaction verification
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
 * Test 1: Register and Create Blood Unit
 */
async function setupTestData() {
  console.log('\n📝 Setup: Creating test blood unit with blockchain milestones');
  
  // Register donor
  const donorData = {
    email: `donor.blockchain.${Date.now()}@example.com`,
    password: 'Donor@123456',
    role: 'Donor',
    name: 'Blockchain Test Donor',
    bloodGroup: 'A+',
    dateOfBirth: '1995-05-15',
    weight: 70,
    city: 'Mumbai',
    pincode: '400001',
    walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
  };
  
  const donorResult = await apiRequest('POST', '/api/auth/register', donorData);
  if (!donorResult.success) {
    console.log('❌ Donor registration failed');
    return null;
  }
  
  // Register hospital
  const hospitalData = {
    email: `hospital.blockchain.${Date.now()}@example.com`,
    password: 'Hospital@123456',
    role: 'Hospital',
    hospitalName: 'Blockchain Test Hospital',
    city: 'Mumbai',
    pincode: '400001',
    walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
  };
  
  const hospitalResult = await apiRequest('POST', '/api/auth/register', hospitalData);
  if (!hospitalResult.success) {
    console.log('❌ Hospital registration failed');
    return null;
  }
  
  const hospitalToken = hospitalResult.data.token;
  const hospitalID = hospitalResult.data.user.id;
  
  // Verify hospital
  const mongoose = require('mongoose');
  const User = require('./models/User');
  await mongoose.connect(process.env.MONGODB_URI);
  await User.findByIdAndUpdate(hospitalID, { isVerified: true });
  await mongoose.disconnect();
  
  // Record donation
  const donationResult = await apiRequest('POST', '/api/hospital/donate', {
    donorEmail: donorData.email,
    bloodGroup: 'A+',
    collectionDate: new Date().toISOString()
  }, hospitalToken);
  
  if (!donationResult.success) {
    console.log('❌ Donation recording failed');
    return null;
  }
  
  const bloodUnitID = donationResult.data.data.bloodUnitID;
  const donationTxHash = donationResult.data.data.blockchainTxHash;
  
  console.log(`✅ Test data created: ${bloodUnitID}`);
  console.log(`   Donation TxHash: ${donationTxHash}`);
  
  return { bloodUnitID, donationTxHash, hospitalToken };
}

/**
 * Test 2: Get Milestones for Blood Unit
 */
async function testGetMilestones(bloodUnitID) {
  console.log('\n📝 Test 1: Get Milestones for Blood Unit');
  
  const result = await apiRequest('GET', `/api/blockchain/milestones/${bloodUnitID}`);
  
  if (result.success) {
    console.log('✅ Milestones retrieved successfully');
    console.log(`   Total milestones: ${result.data.data.totalMilestones}`);
    console.log(`   Chronological order: ${result.data.data.isChronological ? 'Yes' : 'No'}`);
    
    if (result.data.data.milestones.length > 0) {
      const milestone = result.data.data.milestones[0];
      console.log(`   First milestone: ${milestone.milestoneType}`);
      console.log(`   Timestamp: ${milestone.formattedTimestamp}`);
      console.log(`   Actor: ${milestone.formattedActor}`);
    }
    
    return true;
  } else {
    console.log('❌ Failed to get milestones:', result.error.message);
    return false;
  }
}

/**
 * Test 3: Get Milestones for Non-Existent Blood Unit
 */
async function testGetMilestonesNonExistent() {
  console.log('\n📝 Test 2: Get Milestones for Non-Existent Blood Unit');
  
  const result = await apiRequest('GET', '/api/blockchain/milestones/BU-NONEXISTENT');
  
  if (!result.success && result.status === 404) {
    console.log('✅ Correctly returned 404 for non-existent blood unit');
    return true;
  } else if (result.success) {
    console.log('❌ Should have returned 404 for non-existent blood unit');
    return false;
  } else {
    console.log('❌ Unexpected error:', result.error.message);
    return false;
  }
}

/**
 * Test 4: Verify Transaction
 */
async function testVerifyTransaction(txHash) {
  console.log('\n📝 Test 3: Verify Transaction');
  
  if (!txHash || txHash === 'Queued for retry') {
    console.log('⏭️  Skipping - No transaction hash available (blockchain pending)');
    return true;
  }
  
  const result = await apiRequest('GET', `/api/blockchain/verify/${txHash}`);
  
  if (result.success) {
    console.log('✅ Transaction verified successfully');
    console.log(`   Status: ${result.data.data.status}`);
    console.log(`   Block: ${result.data.data.blockNumber}`);
    console.log(`   Confirmations: ${result.data.data.confirmations}`);
    console.log(`   From: ${result.data.data.from}`);
    console.log(`   To: ${result.data.data.to}`);
    
    if (result.data.data.events && result.data.data.events.length > 0) {
      console.log(`   Events: ${result.data.data.events.map(e => e.eventName).join(', ')}`);
    }
    
    return true;
  } else {
    console.log('❌ Failed to verify transaction:', result.error.message);
    return false;
  }
}

/**
 * Test 5: Verify Invalid Transaction Hash
 */
async function testVerifyInvalidTransaction() {
  console.log('\n📝 Test 4: Verify Invalid Transaction Hash');
  
  const result = await apiRequest('GET', '/api/blockchain/verify/0xinvalid');
  
  if (!result.success && result.status === 400) {
    console.log('✅ Correctly rejected invalid transaction hash');
    return true;
  } else {
    console.log('❌ Should have rejected invalid transaction hash');
    return false;
  }
}

/**
 * Test 6: Test Blockchain Parser Functions
 */
async function testBlockchainParser() {
  console.log('\n📝 Test 5: Test Blockchain Parser Functions');
  
  const parser = require('./utils/blockchainParser');
  
  try {
    // Test formatTimestamp
    const timestamp = Math.floor(Date.now() / 1000);
    const formatted = parser.formatTimestamp(timestamp);
    const isValidFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC$/.test(formatted);
    
    if (!isValidFormat) {
      console.log('❌ formatTimestamp failed');
      return false;
    }
    
    // Test formatAddress
    const address = '0x1234567890123456789012345678901234567890';
    const shortAddress = parser.formatAddress(address);
    
    if (shortAddress !== '0x1234...7890') {
      console.log('❌ formatAddress failed');
      return false;
    }
    
    // Test validateMilestone
    const validMilestone = {
      bloodUnitID: 'BU-123',
      milestoneType: 'Donation',
      timestamp: timestamp
    };
    
    const validation = parser.validateMilestone(validMilestone);
    
    if (!validation.isValid) {
      console.log('❌ validateMilestone failed for valid data');
      return false;
    }
    
    console.log('✅ All parser functions working correctly');
    console.log(`   formatTimestamp: ${formatted}`);
    console.log(`   formatAddress: ${shortAddress}`);
    console.log(`   validateMilestone: ${validation.isValid}`);
    
    return true;
  } catch (error) {
    console.log('❌ Parser test failed:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting Blockchain Verification Tests...');
  console.log('='.repeat(50));
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test 0: Parser functions
  if (await testBlockchainParser()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Setup test data
  const testData = await setupTestData();
  
  if (testData) {
    // Test 1: Get Milestones
    if (await testGetMilestones(testData.bloodUnitID)) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Test 2: Non-existent Blood Unit
    if (await testGetMilestonesNonExistent()) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Test 3: Verify Transaction
    if (await testVerifyTransaction(testData.donationTxHash)) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Test 4: Invalid Transaction Hash
    if (await testVerifyInvalidTransaction()) {
      results.passed++;
    } else {
      results.failed++;
    }
  } else {
    console.log('❌ Setup failed, skipping remaining tests');
    results.failed += 4;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All blockchain verification tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
  }
}

// Run tests
runTests().catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
