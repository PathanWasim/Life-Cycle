// Test script for blockchain service
require('dotenv').config();
const blockchainService = require('./services/blockchainService');

async function testBlockchainService() {
  console.log('🧪 Testing Blockchain Service...\n');
  
  try {
    // Test 1: Initialize service
    console.log('Test 1: Initializing blockchain service...');
    await blockchainService.initialize();
    console.log('✅ Initialization successful\n');
    
    // Test 2: Record a test donation milestone
    console.log('Test 2: Recording test donation milestone...');
    const testBloodUnitID = `TEST-UNIT-${Date.now()}`;
    const donationMetadata = {
      donorID: 'test-donor-123',
      hospitalID: 'test-hospital-456',
      bloodGroup: 'O+',
      timestamp: new Date().toISOString()
    };
    
    const donationResult = await blockchainService.recordDonationMilestone(
      testBloodUnitID,
      donationMetadata
    );
    
    console.log('✅ Donation milestone recorded:');
    console.log(`   Transaction Hash: ${donationResult.transactionHash}`);
    console.log(`   Block Number: ${donationResult.blockNumber}`);
    console.log(`   Gas Used: ${donationResult.gasUsed}\n`);
    
    // Test 3: Retrieve milestones
    console.log('Test 3: Retrieving milestones...');
    const milestones = await blockchainService.getMilestones(testBloodUnitID);
    console.log('✅ Milestones retrieved:');
    console.log(JSON.stringify(milestones, null, 2));
    console.log('');
    
    // Test 4: Record a test transfer milestone
    console.log('Test 4: Recording test transfer milestone...');
    const transferMetadata = {
      fromHospitalID: 'test-hospital-456',
      toHospitalID: 'test-hospital-789',
      timestamp: new Date().toISOString()
    };
    
    const transferResult = await blockchainService.recordTransferMilestone(
      testBloodUnitID,
      transferMetadata
    );
    
    console.log('✅ Transfer milestone recorded:');
    console.log(`   Transaction Hash: ${transferResult.transactionHash}`);
    console.log(`   Block Number: ${transferResult.blockNumber}\n`);
    
    // Test 5: Record a test usage milestone
    console.log('Test 5: Recording test usage milestone...');
    const usageMetadata = {
      hospitalID: 'test-hospital-789',
      patientID: 'test-patient-999',
      timestamp: new Date().toISOString()
    };
    
    const usageResult = await blockchainService.recordUsageMilestone(
      testBloodUnitID,
      usageMetadata
    );
    
    console.log('✅ Usage milestone recorded:');
    console.log(`   Transaction Hash: ${usageResult.transactionHash}`);
    console.log(`   Block Number: ${usageResult.blockNumber}\n`);
    
    // Test 6: Retrieve all milestones again
    console.log('Test 6: Retrieving all milestones (should have 3)...');
    const allMilestones = await blockchainService.getMilestones(testBloodUnitID);
    console.log('✅ All milestones retrieved:');
    console.log(`   Total milestones: ${allMilestones.length}`);
    allMilestones.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.milestoneType} - ${m.date}`);
    });
    console.log('');
    
    console.log('🎉 All blockchain service tests passed!');
    console.log(`\n📍 View transactions on Polygon Amoy Explorer:`);
    console.log(`   https://amoy.polygonscan.com/address/${process.env.CONTRACT_ADDRESS}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testBlockchainService();
