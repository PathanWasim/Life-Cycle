// Test script for blood transfer between hospitals
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testBloodTransfer() {
  console.log('🧪 Testing Blood Transfer Between Hospitals...\n');
  
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const BloodUnit = require('./models/BloodUnit');
    const path = require('path');
    
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Step 1: Register a donor
    console.log('Step 1: Registering a donor...');
    const donorData = {
      email: `donor.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Donor',
      name: 'Alice Johnson',
      bloodGroup: 'B+',
      dateOfBirth: '1992-08-10',
      weight: 60,
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    await axios.post(`${BASE_URL}/auth/register`, donorData);
    console.log(`✅ Donor registered: ${donorData.email}\n`);
    
    // Step 2: Register Hospital A (source)
    console.log('Step 2: Registering Hospital A (source)...');
    const hospitalAData = {
      email: `hospitalA.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Hospital',
      hospitalName: 'City General Hospital',
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const hospitalARegResponse = await axios.post(`${BASE_URL}/auth/register`, hospitalAData);
    const hospitalAToken = hospitalARegResponse.data.token;
    const hospitalAId = hospitalARegResponse.data.user.id;
    
    await User.findByIdAndUpdate(hospitalAId, { isVerified: true });
    console.log(`✅ Hospital A registered and verified: ${hospitalAData.hospitalName}\n`);
    
    // Step 3: Register Hospital B (destination)
    console.log('Step 3: Registering Hospital B (destination)...');
    const hospitalBData = {
      email: `hospitalB.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Hospital',
      hospitalName: 'Metro Medical Center',
      city: 'Mumbai',
      pincode: '400002',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const hospitalBRegResponse = await axios.post(`${BASE_URL}/auth/register`, hospitalBData);
    const hospitalBToken = hospitalBRegResponse.data.token;
    const hospitalBId = hospitalBRegResponse.data.user.id;
    
    await User.findByIdAndUpdate(hospitalBId, { isVerified: true });
    console.log(`✅ Hospital B registered and verified: ${hospitalBData.hospitalName}\n`);
    
    // Step 4: Hospital A records blood donation
    console.log('Step 4: Hospital A recording blood donation...');
    const donationData = {
      donorEmail: donorData.email,
      bloodGroup: 'B+',
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
    console.log(`✅ Blood donation recorded: ${bloodUnitID}\n`);
    
    // Step 5: Transfer blood unit from Hospital A to Hospital B
    console.log('Step 5: Transferring blood unit from Hospital A to Hospital B...');
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
    
    console.log('✅ Blood unit transferred successfully!\n');
    
    const transfer = transferResponse.data.data;
    console.log('📋 Transfer Details:');
    console.log(`   Blood Unit ID: ${transfer.bloodUnitID}`);
    console.log(`   Blood Group: ${transfer.bloodGroup}`);
    console.log(`   From Hospital: ${transfer.fromHospital}`);
    console.log(`   To Hospital: ${transfer.toHospital}`);
    console.log(`   Transfer Date: ${new Date(transfer.transferDate).toLocaleString()}`);
    console.log(`   Status: ${transfer.status}`);
    console.log(`   Days Until Expiry: ${transfer.daysUntilExpiry}`);
    console.log('');
    
    console.log('⛓️  Blockchain Information:');
    console.log(`   Transaction Hash: ${transfer.blockchainTxHash}`);
    console.log(`   Blockchain Status: ${transfer.blockchainStatus}`);
    console.log('');
    
    // Step 6: Verify Hospital A no longer has the blood unit
    console.log('Step 6: Verifying Hospital A inventory (should be empty)...');
    const hospitalAInventory = await axios.get(
      `${BASE_URL}/hospital/inventory`,
      {
        headers: { 'Authorization': `Bearer ${hospitalAToken}` }
      }
    );
    
    if (hospitalAInventory.data.data.summary.total === 0) {
      console.log('✅ PASS: Hospital A inventory is empty\n');
    } else {
      console.log('❌ FAIL: Hospital A still has blood units\n');
    }
    
    // Step 7: Verify Hospital B now has the blood unit
    console.log('Step 7: Verifying Hospital B inventory (should have 1 unit)...');
    const hospitalBInventory = await axios.get(
      `${BASE_URL}/hospital/inventory`,
      {
        headers: { 'Authorization': `Bearer ${hospitalBToken}` }
      }
    );
    
    if (hospitalBInventory.data.data.summary.total === 1) {
      console.log('✅ PASS: Hospital B has 1 blood unit');
      const unit = hospitalBInventory.data.data.inventory[0];
      console.log(`   Blood Unit ID: ${unit.bloodUnitID}`);
      console.log(`   Status: ${unit.status}\n`);
    } else {
      console.log('❌ FAIL: Hospital B does not have the blood unit\n');
    }
    
    // Step 8: Test transfer of expired blood unit
    console.log('Step 8: Testing transfer of expired blood unit...');
    
    // Create an expired blood unit
    const expiredBloodUnit = new BloodUnit({
      bloodUnitID: `BU-EXPIRED-${Date.now()}`,
      donorID: (await User.findOne({ email: donorData.email }))._id,
      bloodGroup: 'B+',
      collectionDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), // 50 days ago
      expiryDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // Expired 8 days ago
      status: 'Stored',
      originalHospitalID: hospitalAId,
      currentHospitalID: hospitalAId
    });
    await expiredBloodUnit.save();
    
    try {
      await axios.post(
        `${BASE_URL}/hospital/transfer`,
        {
          bloodUnitID: expiredBloodUnit.bloodUnitID,
          destinationHospitalID: hospitalBId
        },
        {
          headers: { 'Authorization': `Bearer ${hospitalAToken}` }
        }
      );
      console.log('❌ FAIL: Should have rejected expired blood unit transfer');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('expired')) {
        console.log('✅ PASS: Correctly rejected expired blood unit transfer');
        console.log(`   Reason: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }
    
    // Step 9: Test transfer by non-owner hospital
    console.log('Step 9: Testing transfer by non-owner hospital...');
    try {
      await axios.post(
        `${BASE_URL}/hospital/transfer`,
        {
          bloodUnitID: bloodUnitID,
          destinationHospitalID: hospitalAId
        },
        {
          headers: { 'Authorization': `Bearer ${hospitalAToken}` }
        }
      );
      console.log('❌ FAIL: Should have rejected transfer by non-owner');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ PASS: Correctly rejected transfer by non-owner');
        console.log(`   Reason: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }
    
    // Step 10: Test transfer to unverified hospital
    console.log('Step 10: Testing transfer to unverified hospital...');
    const unverifiedHospitalData = {
      email: `unverified.hospital.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Hospital',
      hospitalName: 'Unverified Hospital',
      city: 'Mumbai',
      pincode: '400003',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const unverifiedRegResponse = await axios.post(`${BASE_URL}/auth/register`, unverifiedHospitalData);
    const unverifiedHospitalId = unverifiedRegResponse.data.user.id;
    
    try {
      await axios.post(
        `${BASE_URL}/hospital/transfer`,
        {
          bloodUnitID: bloodUnitID,
          destinationHospitalID: unverifiedHospitalId
        },
        {
          headers: { 'Authorization': `Bearer ${hospitalBToken}` }
        }
      );
      console.log('❌ FAIL: Should have rejected transfer to unverified hospital');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('not verified')) {
        console.log('✅ PASS: Correctly rejected transfer to unverified hospital');
        console.log(`   Reason: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }
    
    await mongoose.connection.close();
    
    console.log('🎉 All blood transfer tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testBloodTransfer();
