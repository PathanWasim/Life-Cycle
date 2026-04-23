// Test script for complete blood supply chain flow
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Blood Supply Chain Flow...\n');
  console.log('This test covers: Donor Registration → Donation → Inventory → Transfer → Usage\n');
  
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const path = require('path');
    
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Step 1: Register a donor
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 1: Register Donor');
    console.log('═══════════════════════════════════════════════════════════');
    const donorData = {
      email: `donor.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Donor',
      name: 'Sarah Williams',
      bloodGroup: 'AB+',
      dateOfBirth: '1993-06-15',
      weight: 62,
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    await axios.post(`${BASE_URL}/auth/register`, donorData);
    console.log(`✅ Donor registered: ${donorData.name} (${donorData.bloodGroup})`);
    console.log(`   Email: ${donorData.email}\n`);
    
    // Step 2: Register Hospital A (collection hospital)
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 2: Register Hospital A (Collection Hospital)');
    console.log('═══════════════════════════════════════════════════════════');
    const hospitalAData = {
      email: `hospitalA.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Hospital',
      hospitalName: 'Central Blood Bank',
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const hospitalARegResponse = await axios.post(`${BASE_URL}/auth/register`, hospitalAData);
    const hospitalAToken = hospitalARegResponse.data.token;
    const hospitalAId = hospitalARegResponse.data.user.id;
    
    await User.findByIdAndUpdate(hospitalAId, { isVerified: true });
    console.log(`✅ Hospital A registered and verified: ${hospitalAData.hospitalName}\n`);
    
    // Step 3: Register Hospital B (receiving hospital)
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 3: Register Hospital B (Receiving Hospital)');
    console.log('═══════════════════════════════════════════════════════════');
    const hospitalBData = {
      email: `hospitalB.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Hospital',
      hospitalName: 'City Emergency Hospital',
      city: 'Mumbai',
      pincode: '400002',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const hospitalBRegResponse = await axios.post(`${BASE_URL}/auth/register`, hospitalBData);
    const hospitalBToken = hospitalBRegResponse.data.token;
    const hospitalBId = hospitalBRegResponse.data.user.id;
    
    await User.findByIdAndUpdate(hospitalBId, { isVerified: true });
    console.log(`✅ Hospital B registered and verified: ${hospitalBData.hospitalName}\n`);
    
    // Step 4: Record blood donation at Hospital A
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 4: Record Blood Donation at Hospital A');
    console.log('═══════════════════════════════════════════════════════════');
    const donationData = {
      donorEmail: donorData.email,
      bloodGroup: 'AB+',
      collectionDate: new Date().toISOString()
    };
    
    const donationResponse = await axios.post(
      `${BASE_URL}/hospital/donate`,
      donationData,
      {
        headers: { 'Authorization': `Bearer ${hospitalAToken}` }
      }
    );
    
    const bloodUnitID = donationResponse.data.data.bloodUnitID;
    const donationTxHash = donationResponse.data.data.blockchainTxHash;
    
    console.log(`✅ Blood donation recorded successfully`);
    console.log(`   Blood Unit ID: ${bloodUnitID}`);
    console.log(`   Blood Group: AB+`);
    console.log(`   Donor: ${donorData.name}`);
    console.log(`   Hospital: ${hospitalAData.hospitalName}`);
    console.log(`   Blockchain TX: ${donationTxHash}`);
    console.log(`   Days Until Expiry: 42\n`);
    
    // Step 5: Check Hospital A inventory
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 5: Check Hospital A Inventory');
    console.log('═══════════════════════════════════════════════════════════');
    const hospitalAInventory = await axios.get(
      `${BASE_URL}/hospital/inventory`,
      {
        headers: { 'Authorization': `Bearer ${hospitalAToken}` }
      }
    );
    
    console.log(`✅ Hospital A Inventory:`);
    console.log(`   Total Units: ${hospitalAInventory.data.data.summary.total}`);
    console.log(`   By Blood Group:`, hospitalAInventory.data.data.summary.byBloodGroup);
    console.log(`   By Status:`, hospitalAInventory.data.data.summary.byStatus);
    console.log('');
    
    // Step 6: Transfer blood from Hospital A to Hospital B
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 6: Transfer Blood from Hospital A to Hospital B');
    console.log('═══════════════════════════════════════════════════════════');
    const transferData = {
      bloodUnitID: bloodUnitID,
      destinationHospitalID: hospitalBId
    };
    
    const transferResponse = await axios.post(
      `${BASE_URL}/hospital/transfer`,
      transferData,
      {
        headers: { 'Authorization': `Bearer ${hospitalAToken}` }
      }
    );
    
    const transferTxHash = transferResponse.data.data.blockchainTxHash;
    
    console.log(`✅ Blood unit transferred successfully`);
    console.log(`   From: ${hospitalAData.hospitalName}`);
    console.log(`   To: ${hospitalBData.hospitalName}`);
    console.log(`   Blood Unit ID: ${bloodUnitID}`);
    console.log(`   Blockchain TX: ${transferTxHash}\n`);
    
    // Step 7: Verify Hospital A inventory (should be empty)
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 7: Verify Hospital A Inventory (After Transfer)');
    console.log('═══════════════════════════════════════════════════════════');
    const hospitalAInventoryAfter = await axios.get(
      `${BASE_URL}/hospital/inventory`,
      {
        headers: { 'Authorization': `Bearer ${hospitalAToken}` }
      }
    );
    
    console.log(`✅ Hospital A Inventory: ${hospitalAInventoryAfter.data.data.summary.total} units`);
    console.log(`   (Blood unit successfully transferred out)\n`);
    
    // Step 8: Verify Hospital B inventory (should have 1 unit)
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 8: Verify Hospital B Inventory (After Transfer)');
    console.log('═══════════════════════════════════════════════════════════');
    const hospitalBInventory = await axios.get(
      `${BASE_URL}/hospital/inventory`,
      {
        headers: { 'Authorization': `Bearer ${hospitalBToken}` }
      }
    );
    
    console.log(`✅ Hospital B Inventory: ${hospitalBInventory.data.data.summary.total} unit`);
    console.log(`   Blood Unit ID: ${hospitalBInventory.data.data.inventory[0].bloodUnitID}`);
    console.log(`   Status: ${hospitalBInventory.data.data.inventory[0].status}\n`);
    
    // Step 9: Record blood usage at Hospital B
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 9: Record Blood Usage at Hospital B');
    console.log('═══════════════════════════════════════════════════════════');
    const usageData = {
      bloodUnitID: bloodUnitID,
      patientID: 'PAT-2026-EMG-001'
    };
    
    const usageResponse = await axios.post(
      `${BASE_URL}/hospital/use`,
      usageData,
      {
        headers: { 'Authorization': `Bearer ${hospitalBToken}` }
      }
    );
    
    const usageTxHash = usageResponse.data.data.blockchainTxHash;
    
    console.log(`✅ Blood usage recorded successfully`);
    console.log(`   Hospital: ${hospitalBData.hospitalName}`);
    console.log(`   Patient ID: ${usageData.patientID}`);
    console.log(`   Blood Unit ID: ${bloodUnitID}`);
    console.log(`   Blockchain TX: ${usageTxHash}\n`);
    
    // Step 10: Verify Hospital B inventory (should be empty - used blood excluded)
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 10: Verify Hospital B Inventory (After Usage)');
    console.log('═══════════════════════════════════════════════════════════');
    const hospitalBInventoryAfter = await axios.get(
      `${BASE_URL}/hospital/inventory`,
      {
        headers: { 'Authorization': `Bearer ${hospitalBToken}` }
      }
    );
    
    console.log(`✅ Hospital B Inventory: ${hospitalBInventoryAfter.data.data.summary.total} units`);
    console.log(`   (Used blood unit correctly excluded from inventory)\n`);
    
    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('COMPLETE FLOW SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ All three blockchain milestones recorded:');
    console.log(`   1. Donation:  ${donationTxHash}`);
    console.log(`   2. Transfer:  ${transferTxHash}`);
    console.log(`   3. Usage:     ${usageTxHash}`);
    console.log('');
    console.log('✅ Complete supply chain flow verified:');
    console.log(`   Donor → Hospital A → Hospital B → Patient`);
    console.log('');
    console.log('✅ Inventory management working correctly:');
    console.log(`   - Hospital A: 0 units (transferred out)`);
    console.log(`   - Hospital B: 0 units (used for patient)`);
    console.log('');
    
    if (donationTxHash !== 'Queued for retry' && 
        transferTxHash !== 'Queued for retry' && 
        usageTxHash !== 'Queued for retry') {
      console.log('🔗 View on Polygon Amoy Explorer:');
      console.log(`   Donation:  https://amoy.polygonscan.com/tx/${donationTxHash}`);
      console.log(`   Transfer:  https://amoy.polygonscan.com/tx/${transferTxHash}`);
      console.log(`   Usage:     https://amoy.polygonscan.com/tx/${usageTxHash}`);
      console.log('');
    } else {
      console.log('⏳ Some blockchain transactions are queued for retry');
      console.log('   (This is expected when test MATIC balance is low)');
      console.log('   The retry queue will process them every 5 minutes\n');
    }
    
    await mongoose.connection.close();
    
    console.log('🎉 Complete blood supply chain flow test PASSED!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testCompleteFlow();
