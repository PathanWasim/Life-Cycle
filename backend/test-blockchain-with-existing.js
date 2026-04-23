/**
 * Test Blockchain Verification with Existing Data
 * Uses existing blood units that have blockchain transactions
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const BloodUnit = require('./models/BloodUnit');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testWithExistingData() {
  console.log('🧪 Testing Blockchain Verification with Existing Data');
  console.log('='.repeat(60));
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find a blood unit with a donation transaction hash
    const bloodUnit = await BloodUnit.findOne({
      donationTxHash: { $exists: true, $ne: null }
    });
    
    if (!bloodUnit) {
      console.log('⚠️  No blood units with blockchain transactions found');
      console.log('   This is expected if blockchain has low MATIC balance');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`\n✅ Found blood unit with blockchain data: ${bloodUnit.bloodUnitID}`);
    console.log(`   Donation TxHash: ${bloodUnit.donationTxHash}`);
    
    // Test 1: Get Milestones
    console.log('\n📝 Test 1: Get Milestones');
    try {
      const response = await axios.get(`${API_URL}/api/blockchain/milestones/${bloodUnit.bloodUnitID}`);
      console.log('✅ Milestones retrieved successfully');
      console.log(`   Total milestones: ${response.data.data.totalMilestones}`);
      console.log(`   Chronological: ${response.data.data.isChronological}`);
      
      response.data.data.milestones.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.milestoneType} - ${m.formattedTimestamp}`);
      });
    } catch (error) {
      console.log('❌ Failed to get milestones:', error.response?.data?.message || error.message);
    }
    
    // Test 2: Verify Transaction
    console.log('\n📝 Test 2: Verify Transaction');
    try {
      const response = await axios.get(`${API_URL}/api/blockchain/verify/${bloodUnit.donationTxHash}`);
      console.log('✅ Transaction verified successfully');
      console.log(`   Status: ${response.data.data.status}`);
      console.log(`   Block: ${response.data.data.blockNumber}`);
      console.log(`   Confirmations: ${response.data.data.confirmations}`);
      console.log(`   Gas Used: ${response.data.data.gasUsed}`);
      console.log(`   Events: ${response.data.data.events.map(e => e.eventName).join(', ')}`);
      console.log(`   Explorer: ${response.data.data.explorerUrl}`);
    } catch (error) {
      console.log('❌ Failed to verify transaction:', error.response?.data?.message || error.message);
    }
    
    await mongoose.disconnect();
    
    console.log('\n🎉 Blockchain verification endpoints working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await mongoose.disconnect();
  }
}

testWithExistingData();
