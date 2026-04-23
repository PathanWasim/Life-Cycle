/**
 * Verify Sample Account Credentials
 * 
 * This script tests login credentials for all sample accounts
 * to ensure they work correctly.
 * 
 * Run: node backend/verify-sample-credentials.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

async function verifyCredentials() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('='.repeat(70));
    console.log('🔐 VERIFYING SAMPLE ACCOUNT CREDENTIALS');
    console.log('='.repeat(70));
    
    // Test credentials
    const testAccounts = [
      // Sample Donors
      { email: 'sample.donor1@example.com', password: 'SamplePass123!', role: 'Donor' },
      { email: 'sample.donor2@example.com', password: 'SamplePass123!', role: 'Donor' },
      { email: 'sample.donor3@example.com', password: 'SamplePass123!', role: 'Donor' },
      { email: 'sample.donor4@example.com', password: 'SamplePass123!', role: 'Donor' },
      { email: 'sample.donor5@example.com', password: 'SamplePass123!', role: 'Donor' },
      
      // Sample Hospitals
      { email: 'sample.hospital1@example.com', password: 'HospitalPass123!', role: 'Hospital' },
      { email: 'sample.hospital2@example.com', password: 'HospitalPass123!', role: 'Hospital' },
      { email: 'sample.hospital3@example.com', password: 'HospitalPass123!', role: 'Hospital' },
      
      // Existing test accounts
      { email: 'test.donor@example.com', password: 'TestPassword123!', role: 'Donor' },
      { email: 'donor.1772299902464@example.com', password: 'password123', role: 'Donor' },
      { email: 'test.hospital@example.com', password: 'HospitalPass123!', role: 'Hospital' },
      { email: 'admin@lifechain.com', password: 'Admin@123456', role: 'Admin' }
    ];
    
    let successCount = 0;
    let failCount = 0;
    
    console.log('\n📋 Testing Credentials:\n');
    
    for (const account of testAccounts) {
      const user = await User.findOne({ email: account.email });
      
      if (!user) {
        console.log(`❌ ${account.role.toUpperCase()}: ${account.email}`);
        console.log(`   Status: Account not found in database`);
        console.log('');
        failCount++;
        continue;
      }
      
      // Test password
      const isMatch = await bcrypt.compare(account.password, user.password);
      
      if (isMatch) {
        console.log(`✅ ${account.role.toUpperCase()}: ${account.email}`);
        console.log(`   Password: ${account.password}`);
        console.log(`   Status: Credentials valid ✓`);
        if (user.role === 'Hospital') {
          console.log(`   Verified: ${user.isVerified ? 'Yes ✓' : 'No ✗'}`);
        }
        console.log('');
        successCount++;
      } else {
        console.log(`❌ ${account.role.toUpperCase()}: ${account.email}`);
        console.log(`   Password: ${account.password}`);
        console.log(`   Status: Invalid password ✗`);
        console.log('');
        failCount++;
      }
    }
    
    console.log('='.repeat(70));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Valid Credentials: ${successCount}`);
    console.log(`❌ Invalid Credentials: ${failCount}`);
    console.log(`📝 Total Tested: ${testAccounts.length}`);
    
    if (failCount > 0) {
      console.log('\n⚠️  ISSUES FOUND:');
      console.log('   Some accounts have invalid credentials or do not exist.');
      console.log('   Run: node backend/populate-sample-data.js');
      console.log('   This will create/update sample accounts with correct passwords.');
    } else {
      console.log('\n✅ ALL CREDENTIALS VALID!');
      console.log('   You can use these credentials to login to the frontend.');
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error verifying credentials:', error);
    process.exit(1);
  }
}

// Run the script
verifyCredentials();
