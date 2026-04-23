require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testLogin() {
  try {
    console.log('🔐 TESTING LOGIN...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');

    // Test credentials
    const testEmail = 'sample.donor1@example.com';
    const testPassword = 'SamplePass123!';

    console.log(`Testing: ${testEmail}`);
    console.log(`Password: ${testPassword}\n`);

    // Find user
    const user = await User.findOne({ email: testEmail });

    if (!user) {
      console.log('❌ User not found in database!');
      process.exit(1);
    }

    console.log('✅ User found in database');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Blood Group: ${user.bloodGroup}`);
    console.log();

    // Test password
    console.log('🔑 Testing password...');
    const isMatch = await bcrypt.compare(testPassword, user.password);

    if (isMatch) {
      console.log('✅ Password matches!\n');

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ JWT Token generated successfully');
      console.log(`   Token: ${token.substring(0, 50)}...`);
      console.log();

      console.log('✅ LOGIN WOULD SUCCEED');
      console.log();
      console.log('📋 Response that backend would send:');
      console.log(JSON.stringify({
        success: true,
        message: 'Login successful',
        data: {
          token: token.substring(0, 30) + '...',
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            bloodGroup: user.bloodGroup
          }
        }
      }, null, 2));

    } else {
      console.log('❌ Password does NOT match!');
      console.log();
      console.log('🔍 Debugging info:');
      console.log(`   Stored hash: ${user.password.substring(0, 30)}...`);
      console.log(`   Test password: ${testPassword}`);
    }

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testLogin();
