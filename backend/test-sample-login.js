/**
 * Test Sample Account Login
 * 
 * This script simulates a login attempt to verify credentials work
 * 
 * Run: node backend/test-sample-login.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

async function testLogin(email, password) {
  try {
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        email
      };
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return {
        success: false,
        message: 'Invalid password',
        email,
        user: {
          name: user.name,
          role: user.role,
          passwordHash: user.password.substring(0, 20) + '...'
        }
      };
    }
    
    return {
      success: true,
      message: 'Login successful',
      email,
      user: {
        name: user.name,
        role: user.role,
        bloodGroup: user.bloodGroup,
        isVerified: user.isVerified
      }
    };
    
  } catch (error) {
    return {
      success: false,
      message: error.message,
      email
    };
  }
}

async function main() {
  try {
    console.log('🚀 Testing Sample Account Login...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Test sample donor
    console.log('Testing: sample.donor1@example.com / SamplePass123!');
    const result = await testLogin('sample.donor1@example.com', 'SamplePass123!');
    
    if (result.success) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('   Name:', result.user.name);
      console.log('   Role:', result.user.role);
      console.log('   Blood Group:', result.user.bloodGroup);
    } else {
      console.log('❌ LOGIN FAILED!');
      console.log('   Reason:', result.message);
      if (result.user) {
        console.log('   User found:', result.user.name);
        console.log('   Role:', result.user.role);
        console.log('   Password hash:', result.user.passwordHash);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
    // If login failed, let's check what's in the database
    if (!result.success) {
      console.log('\n🔍 Checking database for sample accounts...\n');
      
      const sampleUsers = await User.find({ 
        email: { $regex: /^sample\./ } 
      }).limit(5);
      
      if (sampleUsers.length === 0) {
        console.log('❌ No sample accounts found in database!');
        console.log('\n💡 Solution: Run the populate script:');
        console.log('   node backend/populate-sample-data.js');
      } else {
        console.log(`✅ Found ${sampleUsers.length} sample accounts:`);
        sampleUsers.forEach(user => {
          console.log(`   • ${user.email} (${user.role})`);
        });
        
        console.log('\n⚠️  Accounts exist but password is incorrect!');
        console.log('\n💡 Solution: Re-run the populate script to reset passwords:');
        console.log('   node backend/populate-sample-data.js');
      }
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
