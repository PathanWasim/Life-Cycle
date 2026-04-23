// Test script for blood inventory management
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testInventoryManagement() {
  console.log('🧪 Testing Blood Inventory Management...\n');
  
  try {
    // Step 1: Register a donor
    console.log('Step 1: Registering a donor...');
    const donorData = {
      email: `donor.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Donor',
      name: 'John Doe',
      bloodGroup: 'O+',
      dateOfBirth: '1995-05-15',
      weight: 70,
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
      hospitalName: 'City General Hospital',
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const hospitalRegResponse = await axios.post(`${BASE_URL}/auth/register`, hospitalData);
    const hospitalToken = hospitalRegResponse.data.token;
    const hospitalId = hospitalRegResponse.data.user.id;
    
    console.log(`✅ Hospital registered: ${hospitalData.hospitalName}\n`);
    
    // Step 3: Verify hospital
    console.log('Step 3: Verifying hospital...');
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const path = require('path');
    
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    
    await mongoose.connect(process.env.MONGODB_URI);
    await User.findByIdAndUpdate(hospitalId, { isVerified: true });
    
    console.log(`✅ Hospital verified\n`);
    
    // Step 4: Record blood donation
    console.log('Step 4: Recording blood donation...');
    const donationData = {
      donorEmail: donorData.email,
      bloodGroup: 'O+',
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
    
    // Step 5: Get inventory (should show 1 unit)
    console.log('Step 5: Getting hospital inventory...');
    const inventoryResponse = await axios.get(
      `${BASE_URL}/hospital/inventory`,
      {
        headers: { 'Authorization': `Bearer ${hospitalToken}` }
      }
    );
    
    const inventory = inventoryResponse.data.data;
    console.log(`✅ Inventory retrieved successfully`);
    console.log(`   Total units: ${inventory.summary.total}`);
    console.log(`   By blood group:`, inventory.summary.byBloodGroup);
    console.log(`   By status:`, inventory.summary.byStatus);
    console.log('');
    
    if (inventory.inventory.length > 0) {
      const unit = inventory.inventory[0];
      console.log('📋 First Blood Unit:');
      console.log(`   Blood Unit ID: ${unit.bloodUnitID}`);
      console.log(`   Blood Group: ${unit.bloodGroup}`);
      console.log(`   Donor: ${unit.donorName}`);
      console.log(`   Status: ${unit.status}`);
      console.log(`   Days Until Expiry: ${unit.daysUntilExpiry}`);
      console.log(`   Is Expired: ${unit.isExpired}`);
      console.log('');
    }
    
    // Step 6: Filter inventory by blood group
    console.log('Step 6: Filtering inventory by blood group (O+)...');
    const filteredResponse = await axios.get(
      `${BASE_URL}/hospital/inventory?bloodGroup=O%2B`,
      {
        headers: { 'Authorization': `Bearer ${hospitalToken}` }
      }
    );
    
    console.log(`✅ Filtered inventory: ${filteredResponse.data.data.summary.total} units\n`);
    
    // Step 7: Update blood unit status (Collected → Stored)
    console.log('Step 7: Updating blood unit status to "Stored"...');
    const statusUpdateResponse = await axios.patch(
      `${BASE_URL}/hospital/blood-unit/${bloodUnitID}/status`,
      { status: 'Stored' },
      {
        headers: { 'Authorization': `Bearer ${hospitalToken}` }
      }
    );
    
    console.log(`✅ Status updated successfully`);
    console.log(`   Blood Unit ID: ${statusUpdateResponse.data.data.bloodUnitID}`);
    console.log(`   New Status: ${statusUpdateResponse.data.data.status}\n`);
    
    // Step 8: Verify status change in inventory
    console.log('Step 8: Verifying status change in inventory...');
    const updatedInventoryResponse = await axios.get(
      `${BASE_URL}/hospital/inventory`,
      {
        headers: { 'Authorization': `Bearer ${hospitalToken}` }
      }
    );
    
    const updatedUnit = updatedInventoryResponse.data.data.inventory.find(u => u.bloodUnitID === bloodUnitID);
    if (updatedUnit && updatedUnit.status === 'Stored') {
      console.log(`✅ PASS: Status correctly updated to "Stored"\n`);
    } else {
      console.log(`❌ FAIL: Status not updated correctly\n`);
    }
    
    // Step 9: Test invalid status update
    console.log('Step 9: Testing invalid status update (Stored → Collected)...');
    try {
      await axios.patch(
        `${BASE_URL}/hospital/blood-unit/${bloodUnitID}/status`,
        { status: 'Collected' },
        {
          headers: { 'Authorization': `Bearer ${hospitalToken}` }
      }
      );
      console.log('❌ FAIL: Should have rejected invalid status change');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ PASS: Correctly rejected invalid status change');
        console.log(`   Reason: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }
    
    // Step 10: Test unauthorized access
    console.log('Step 10: Testing unauthorized access to inventory...');
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
    
    try {
      await axios.patch(
        `${BASE_URL}/hospital/blood-unit/${bloodUnitID}/status`,
        { status: 'Stored' },
        {
          headers: { 'Authorization': `Bearer ${otherHospitalToken}` }
        }
      );
      console.log('❌ FAIL: Should have rejected unauthorized access');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ PASS: Correctly rejected unauthorized access');
        console.log(`   Reason: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }
    
    await mongoose.connection.close();
    
    console.log('🎉 All inventory management tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testInventoryManagement();
