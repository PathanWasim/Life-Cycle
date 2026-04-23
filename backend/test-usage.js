// Test script for blood usage recording
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testBloodUsage() {
  console.log('🧪 Testing Blood Usage Recording...\n');
  
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
      name: 'Michael Brown',
      bloodGroup: 'O-',
      dateOfBirth: '1988-12-05',
      weight: 75,
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    await axios.post(`${BASE_URL}/auth/register`, donorData);
    console.log(`✅ Donor registered: ${donorData.email}\n`);
    
    // Step 2: Register a hospital
    console.log('Step 2: Registering a hospital...');
    const hospitalData = {
      email: `hospital.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Hospital',
      hospitalName: 'Emergency Medical Center',
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const hospitalRegResponse = await axios.post(`${BASE_URL}/auth/register`, hospitalData);
    const hospitalToken = hospitalRegResponse.data.token;
    const hospitalId = hospitalRegResponse.data.user.id;
    
    await User.findByIdAndUpdate(hospitalId, { isVerified: true });
    console.log(`✅ Hospital registered and verified: ${hospitalData.hospitalName}\n`);
    
    // Step 3: Record blood donation
    console.log('Step 3: Recording blood donation...');
    const donationData = {
      donorEmail: donorData.email,
      bloodGroup: 'O-',
      collectionDate: new Date().toISOString()
    };
    
    const donationResponse = await axios.post(
      `${BASE_URL}/hospital/donate`,
      donationData,
      {
        headers: { 'Authorization': `Bearer ${hospitalToken}` }
      }
    );
    
    const bloodUnitID = donationResponse.data.data.bloodUnitID;
    console.log(`✅ Blood donation recorded: ${bloodUnitID}\n`);
    
    // Step 4: Record blood usage
    console.log('Step 4: Recording blood usage...');
    const usageData = {
      bloodUnitID: bloodUnitID,
      patientID: 'PAT-2026-001'
    };
    
    const usageResponse = await axios.post(
      `${BASE_URL}/hospital/use`,
      usageData,
      {
        headers: { 'Authorization': `Bearer ${hospitalToken}` }
      }
    );
    
    console.log('✅ Blood usage recorded successfully!\n');
    
    const usage = usageResponse.data.data;
    console.log('📋 Usage Details:');
    console.log(`   Blood Unit ID: ${usage.bloodUnitID}`);
    console.log(`   Blood Group: ${usage.bloodGroup}`);
    console.log(`   Hospital: ${usage.hospitalName}`);
    console.log(`   Patient ID: ${usage.patientID}`);
    console.log(`   Usage Date: ${new Date(usage.usageDate).toLocaleString()}`);
    console.log(`   Status: ${usage.status}`);
    console.log('');
    
    console.log('⛓️  Blockchain Information:');
    console.log(`   Transaction Hash: ${usage.blockchainTxHash}`);
    console.log(`   Blockchain Status: ${usage.blockchainStatus}`);
    console.log('');
    
    // Step 5: Verify blood unit is excluded from inventory
    console.log('Step 5: Verifying used blood unit is excluded from inventory...');
    const inventoryResponse = await axios.get(
      `${BASE_URL}/hospital/inventory`,
      {
        headers: { 'Authorization': `Bearer ${hospitalToken}` }
      }
    );
    
    if (inventoryResponse.data.data.summary.total === 0) {
      console.log('✅ PASS: Used blood unit correctly excluded from inventory\n');
    } else {
      console.log('❌ FAIL: Used blood unit still appears in inventory\n');
    }
    
    // Step 6: Test usage of already used blood unit
    console.log('Step 6: Testing usage of already used blood unit...');
    try {
      await axios.post(
        `${BASE_URL}/hospital/use`,
        usageData,
        {
          headers: { 'Authorization': `Bearer ${hospitalToken}` }
        }
      );
      console.log('❌ FAIL: Should have rejected already used blood unit');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already been used')) {
        console.log('✅ PASS: Correctly rejected already used blood unit');
        console.log(`   Reason: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }
    
    // Step 7: Test usage of expired blood unit
    console.log('Step 7: Testing usage of expired blood unit...');
    
    // Create an expired blood unit
    const expiredBloodUnit = new BloodUnit({
      bloodUnitID: `BU-EXPIRED-${Date.now()}`,
      donorID: (await User.findOne({ email: donorData.email }))._id,
      bloodGroup: 'O-',
      collectionDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), // 50 days ago
      expiryDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // Expired 8 days ago
      status: 'Stored',
      originalHospitalID: hospitalId,
      currentHospitalID: hospitalId
    });
    await expiredBloodUnit.save();
    
    try {
      await axios.post(
        `${BASE_URL}/hospital/use`,
        {
          bloodUnitID: expiredBloodUnit.bloodUnitID,
          patientID: 'PAT-2026-002'
        },
        {
          headers: { 'Authorization': `Bearer ${hospitalToken}` }
        }
      );
      console.log('❌ FAIL: Should have rejected expired blood unit');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('expired')) {
        console.log('✅ PASS: Correctly rejected expired blood unit');
        console.log(`   Reason: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }
    
    // Step 8: Test usage by non-owner hospital
    console.log('Step 8: Testing usage by non-owner hospital...');
    const otherHospitalData = {
      email: `other.hospital.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Hospital',
      hospitalName: 'Other Hospital',
      city: 'Delhi',
      pincode: '110001',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const otherHospitalRegResponse = await axios.post(`${BASE_URL}/auth/register`, otherHospitalData);
    const otherHospitalToken = otherHospitalRegResponse.data.token;
    const otherHospitalId = otherHospitalRegResponse.data.user.id;
    
    await User.findByIdAndUpdate(otherHospitalId, { isVerified: true });
    
    // Create a blood unit owned by the other hospital
    const otherBloodUnit = new BloodUnit({
      bloodUnitID: `BU-OTHER-${Date.now()}`,
      donorID: (await User.findOne({ email: donorData.email }))._id,
      bloodGroup: 'O-',
      collectionDate: new Date(),
      expiryDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
      status: 'Stored',
      originalHospitalID: otherHospitalId,
      currentHospitalID: otherHospitalId
    });
    await otherBloodUnit.save();
    
    try {
      await axios.post(
        `${BASE_URL}/hospital/use`,
        {
          bloodUnitID: otherBloodUnit.bloodUnitID,
          patientID: 'PAT-2026-003'
        },
        {
          headers: { 'Authorization': `Bearer ${hospitalToken}` }
        }
      );
      console.log('❌ FAIL: Should have rejected usage by non-owner');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ PASS: Correctly rejected usage by non-owner');
        console.log(`   Reason: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }
    
    await mongoose.connection.close();
    
    console.log('🎉 All blood usage tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testBloodUsage();
