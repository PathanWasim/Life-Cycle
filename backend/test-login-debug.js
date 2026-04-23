require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find the test donor
    const donor = await User.findOne({ email: 'test.donor@example.com' });
    
    if (!donor) {
      console.log('❌ Donor not found');
      return;
    }

    console.log('✅ Donor found:');
    console.log('  Email:', donor.email);
    console.log('  Name:', donor.name);
    console.log('  Blood Group:', donor.bloodGroup);
    console.log('  Password Hash:', donor.password.substring(0, 20) + '...');
    
    // Test different passwords
    const passwordsToTest = [
      'Test@1234',
      'test@1234',
      'password123',
      'Password@123',
      'TestPassword123',
      'TestPassword123!'
    ];

    console.log('\n🔐 Testing passwords:');
    for (const password of passwordsToTest) {
      const isMatch = await bcrypt.compare(password, donor.password);
      console.log(`  ${password}: ${isMatch ? '✅ MATCH' : '❌ No match'}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testLogin();
