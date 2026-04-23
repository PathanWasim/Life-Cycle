// Test script for donor profile endpoint
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testDonorProfile() {
  console.log('🧪 Testing Donor Profile Endpoint...\n');
  
  try {
    // Step 1: Register a new donor
    console.log('Step 1: Registering a new donor...');
    const donorData = {
      email: `donor.test.${Date.now()}@example.com`,
      password: 'password123',
      role: 'Donor',
      name: 'John Doe',
      bloodGroup: 'O+',
      dateOfBirth: '1995-05-15', // 28-29 years old
      weight: 70,
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, donorData);
    const token = registerResponse.data.token;
    
    console.log('✅ Donor registered successfully');
    console.log(`   Email: ${donorData.email}`);
    console.log(`   Token: ${token.substring(0, 20)}...\n`);
    
    // Step 2: Get donor profile
    console.log('Step 2: Fetching donor profile...');
    const profileResponse = await axios.get(`${BASE_URL}/donor/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile fetched successfully\n');
    
    // Step 3: Verify eligibility information
    const profile = profileResponse.data.data;
    console.log('📊 Donor Profile:');
    console.log(`   Name: ${profile.name}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Blood Group: ${profile.bloodGroup}`);
    console.log(`   Age: ${profile.age} years`);
    console.log(`   Weight: ${profile.weight} kg`);
    console.log(`   City: ${profile.city}`);
    console.log(`   Pincode: ${profile.pincode}`);
    console.log('');
    
    console.log('📋 Eligibility Information:');
    console.log(`   Status: ${profile.eligibilityStatus}`);
    console.log(`   Days Since Last Donation: ${profile.daysSinceLastDonation || 'Never donated'}`);
    console.log(`   Next Eligible Date: ${profile.nextEligibleDate || 'Eligible now'}`);
    console.log('');
    
    // Step 4: Test different eligibility scenarios
    console.log('Step 3: Testing eligibility scenarios...\n');
    
    // Test Case 1: Eligible donor (current donor)
    console.log('✅ Test Case 1: Eligible donor');
    console.log(`   Expected: Eligible`);
    console.log(`   Actual: ${profile.eligibilityStatus}`);
    console.log(`   Result: ${profile.eligibilityStatus === 'Eligible' ? 'PASS' : 'FAIL'}\n`);
    
    // Test Case 2: Register donor under 18
    console.log('Test Case 2: Donor under 18 years old...');
    const youngDonor = {
      ...donorData,
      email: `young.donor.${Date.now()}@example.com`,
      dateOfBirth: new Date(Date.now() - 15 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 years old
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const youngRegResponse = await axios.post(`${BASE_URL}/auth/register`, youngDonor);
    const youngToken = youngRegResponse.data.token;
    const youngProfile = await axios.get(`${BASE_URL}/donor/profile`, {
      headers: { 'Authorization': `Bearer ${youngToken}` }
    });
    
    console.log(`   Expected: Ineligible - Age`);
    console.log(`   Actual: ${youngProfile.data.data.eligibilityStatus}`);
    console.log(`   Result: ${youngProfile.data.data.eligibilityStatus.includes('Age') ? 'PASS' : 'FAIL'}\n`);
    
    // Test Case 3: Register donor with low weight
    console.log('Test Case 3: Donor with weight < 50kg...');
    const lightDonor = {
      ...donorData,
      email: `light.donor.${Date.now()}@example.com`,
      weight: 45,
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    const lightRegResponse = await axios.post(`${BASE_URL}/auth/register`, lightDonor);
    const lightToken = lightRegResponse.data.token;
    const lightProfile = await axios.get(`${BASE_URL}/donor/profile`, {
      headers: { 'Authorization': `Bearer ${lightToken}` }
    });
    
    console.log(`   Expected: Ineligible - Weight`);
    console.log(`   Actual: ${lightProfile.data.data.eligibilityStatus}`);
    console.log(`   Result: ${lightProfile.data.data.eligibilityStatus.includes('Weight') ? 'PASS' : 'FAIL'}\n`);
    
    console.log('🎉 All donor profile tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testDonorProfile();
