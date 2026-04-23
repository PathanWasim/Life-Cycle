// Test script for authentication endpoints
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints...\n');

  try {
    // Test 1: Register a donor
    console.log('1️⃣  Testing Donor Registration...');
    const donorData = {
      email: 'test.donor@example.com',
      password: 'TestPassword123!',
      role: 'Donor',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      name: 'Test Donor',
      bloodGroup: 'O+',
      dateOfBirth: '1995-05-15',
      weight: 70,
      city: 'Mumbai',
      pincode: '400001'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, donorData);
    console.log('   ✅ Registration successful');
    console.log('   📧 Email:', registerResponse.data.user.email);
    console.log('   👤 Role:', registerResponse.data.user.role);
    console.log('   🔑 Token received:', registerResponse.data.token ? 'Yes' : 'No');

    const token = registerResponse.data.token;

    // Test 2: Login with the same credentials
    console.log('\n2️⃣  Testing Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test.donor@example.com',
      password: 'TestPassword123!'
    });
    console.log('   ✅ Login successful');
    console.log('   🩸 Blood Group:', loginResponse.data.user.bloodGroup);
    console.log('   ✔️  Eligibility:', loginResponse.data.user.eligibilityStatus);

    // Test 3: Test invalid login
    console.log('\n3️⃣  Testing Invalid Login...');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'test.donor@example.com',
        password: 'WrongPassword'
      });
      console.log('   ❌ Should have failed!');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('   ✅ Correctly rejected invalid password');
      }
    }

    // Test 4: Register a hospital
    console.log('\n4️⃣  Testing Hospital Registration...');
    const hospitalData = {
      email: 'test.hospital@example.com',
      password: 'HospitalPass123!',
      role: 'Hospital',
      walletAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      hospitalName: 'Test City Hospital',
      city: 'Delhi',
      pincode: '110001'
    };

    const hospitalResponse = await axios.post(`${API_URL}/auth/register`, hospitalData);
    console.log('   ✅ Hospital registration successful');
    console.log('   🏥 Hospital:', hospitalResponse.data.user.hospitalName);
    console.log('   ✔️  Verified:', hospitalResponse.data.user.isVerified);

    console.log('\n✅ All authentication tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Run tests
testAuth();
