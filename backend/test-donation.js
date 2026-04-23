// Test script for blood donation recording with blockchain
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testBloodDonation() {
  console.log('🧪 Testing Blood Donation Recording with Blockchain...\n');
  
  try {
    // Step 1: Register a donor
    console.log('Step 1: Registering a donor...');
    const donorData = {
      email: `donor.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Donor',
      name: 'Jane Smith',
      bloodGroup: 'A+',
      dateOfBirth: '1990-03-20',
      weight: 65,
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
    
    console.log(`✅ Hospital registered: ${hospitalData.hospitalName}`);
    console.log(`   Hospital ID: ${hospitalId}\n`);
    
    // Step 3: Verify hospital (simulate admin verification)
    console.log('Step 3: Verifying hospital...');
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const path = require('path');
    
    // Load .env from backend directory
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    
    await mongoose.connect(process.env.MONGODB_URI);
    await User.findByIdAndUpdate(hospitalId, { isVerified: true });
    await mongoose.connection.close();
    
    console.log(`✅ Hospital verified\n`);
    
    // Step 4: Record blood donation
    console.log('Step 4: Recording blood donation...');
    const donationData = {
      donorEmail: donorData.email,
      bloodGroup: 'A+',
      collectionDate: new Date().toISOString()
    };
    
    const donationResponse = await axios.post(
      `${BASE_URL}/hospital/donate`,
      donationData,
      {
        headers: { 'Authorization': `Bearer ${hospitalToken}` }
      }
    );
    
    console.log('✅ Blood donation recorded successfully!\n');
    
    const donation = donationResponse.data.data;
    console.log('📋 Donation Details:');
    console.log(`   Blood Unit ID: ${donation.bloodUnitID}`);
    console.log(`   Donor Name: ${donation.donorName}`);
    console.log(`   Blood Group: ${donation.bloodGroup}`);
    console.log(`   Collection Date: ${new Date(donation.collectionDate).toLocaleDateString()}`);
    console.log(`   Expiry Date: ${new Date(donation.expiryDate).toLocaleDateString()}`);
    console.log(`   Days Until Expiry: ${donation.daysUntilExpiry}`);
    console.log(`   Status: ${donation.status}`);
    console.log('');
    
    console.log('⛓️  Blockchain Information:');
    console.log(`   Transaction Hash: ${donation.blockchainTxHash}`);
    console.log(`   Blockchain Status: ${donation.blockchainStatus}`);
    
    if (donation.blockchainStatus === 'Recorded') {
      console.log(`   View on Explorer: https://amoy.polygonscan.com/tx/${donation.blockchainTxHash}`);
    }
    console.log('');
    
    // Step 5: Test ineligible donor
    console.log('Step 5: Testing ineligible donor (under 18)...');
    const youngDonorData = {
      email: `young.donor.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Donor',
      name: 'Young Donor',
      bloodGroup: 'B+',
      dateOfBirth: new Date(Date.now() - 15 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weight: 60,
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    await axios.post(`${BASE_URL}/auth/register`, youngDonorData);
    
    try {
      await axios.post(
        `${BASE_URL}/hospital/donate`,
        {
          donorEmail: youngDonorData.email,
          bloodGroup: 'B+',
          collectionDate: new Date().toISOString()
        },
        {
          headers: { 'Authorization': `Bearer ${hospitalToken}` }
        }
      );
      console.log('❌ FAIL: Should have rejected ineligible donor');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('not eligible')) {
        console.log('✅ PASS: Correctly rejected ineligible donor');
        console.log(`   Reason: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }
    
    // Step 6: Test unverified hospital
    console.log('Step 6: Testing unverified hospital...');
    const unverifiedHospitalData = {
      email: `unverified.hospital.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Hospital',
      hospitalName: 'Unverified Hospital',
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const unverifiedRegResponse = await axios.post(`${BASE_URL}/auth/register`, unverifiedHospitalData);
    const unverifiedToken = unverifiedRegResponse.data.token;
    
    try {
      await axios.post(
        `${BASE_URL}/hospital/donate`,
        donationData,
        {
          headers: { 'Authorization': `Bearer ${unverifiedToken}` }
        }
      );
      console.log('❌ FAIL: Should have rejected unverified hospital');
    } catch (error) {
      if (error.response?.status === 403 && error.response.data.message.includes('not verified')) {
        console.log('✅ PASS: Correctly rejected unverified hospital');
        console.log(`   Reason: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }
    
    console.log('🎉 All blood donation tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testBloodDonation();
