// Test script to verify MongoDB models are working correctly
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
const EmergencyRequest = require('./models/EmergencyRequest');
const BlockchainRetry = require('./models/BlockchainRetry');

async function testModels() {
  try {
    console.log('🧪 Testing MongoDB Models...\n');

    // Test 1: User Model
    console.log('1️⃣  Testing User Model...');
    const testDonor = new User({
      email: 'test.donor@example.com',
      password: 'hashedpassword123',
      role: 'Donor',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      name: 'Test Donor',
      bloodGroup: 'O+',
      dateOfBirth: new Date('1995-05-15'),
      weight: 70,
      city: 'Mumbai',
      pincode: '400001'
    });
    
    console.log('   ✅ User model created');
    console.log(`   📊 Age: ${testDonor.age} years`);
    console.log(`   🩸 Eligibility: ${testDonor.checkEligibility()}`);

    // Test 2: BloodUnit Model
    console.log('\n2️⃣  Testing BloodUnit Model...');
    const testBloodUnit = new BloodUnit({
      donorID: new mongoose.Types.ObjectId(),
      bloodGroup: 'O+',
      collectionDate: new Date(),
      expiryDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // 42 days from now
      originalHospitalID: new mongoose.Types.ObjectId(),
      currentHospitalID: new mongoose.Types.ObjectId()
    });
    
    console.log('   ✅ BloodUnit model created');
    console.log(`   🆔 Blood Unit ID: ${testBloodUnit.bloodUnitID}`);
    console.log(`   📅 Expiry Date: ${testBloodUnit.expiryDate ? testBloodUnit.expiryDate.toLocaleDateString() : 'Not set'}`);
    console.log(`   ⏰ Days until expiry: ${testBloodUnit.daysUntilExpiry()}`);
    console.log(`   ❓ Is expired: ${testBloodUnit.isExpired()}`);

    // Test 3: EmergencyRequest Model
    console.log('\n3️⃣  Testing EmergencyRequest Model...');
    const testEmergency = new EmergencyRequest({
      hospitalID: new mongoose.Types.ObjectId(),
      bloodGroup: 'AB+',
      quantity: 3,
      city: 'Delhi',
      pincode: '110001',
      urgencyLevel: 'Critical'
    });
    
    console.log('   ✅ EmergencyRequest model created');
    console.log(`   🩸 Blood Group: ${testEmergency.bloodGroup}`);
    console.log(`   📦 Quantity: ${testEmergency.quantity} units`);
    console.log(`   🚨 Urgency: ${testEmergency.urgencyLevel}`);

    // Test 4: BlockchainRetry Model
    console.log('\n4️⃣  Testing BlockchainRetry Model...');
    const testRetry = new BlockchainRetry({
      bloodUnitID: 'BU-1234567890-abc123',
      milestoneType: 'Donation',
      metadata: {
        donorID: 'donor123',
        hospitalID: 'hospital456',
        timestamp: new Date()
      }
    });
    
    console.log('   ✅ BlockchainRetry model created');
    console.log(`   🔗 Blood Unit ID: ${testRetry.bloodUnitID}`);
    console.log(`   📝 Milestone Type: ${testRetry.milestoneType}`);
    console.log(`   🔄 Status: ${testRetry.status}`);

    console.log('\n✅ All model tests passed!');
    console.log('📝 Models are ready to use with MongoDB\n');

  } catch (error) {
    console.error('❌ Model test failed:', error.message);
  }
}

// Run tests without database connection (just testing model structure)
testModels();
