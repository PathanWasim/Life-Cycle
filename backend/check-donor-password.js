require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function checkDonorPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const email = 'donor.1772299902464@example.com';
    const donor = await User.findOne({ email });
    
    if (!donor) {
      console.log('❌ Donor not found');
      return;
    }

    console.log('✅ Donor found:');
    console.log('   Email:', donor.email);
    console.log('   Name:', donor.name);
    console.log('   Blood Group:', donor.bloodGroup);
    
    const passwordsToTest = [
      'TestPassword123!',
      'Test@1234',
      'password123',
      'Password@123',
      'DonorPass123!',
      'Donor@1234'
    ];

    console.log('\n🔐 Testing passwords:');
    let found = false;
    for (const password of passwordsToTest) {
      const isMatch = await bcrypt.compare(password, donor.password);
      if (isMatch) {
        console.log(`   ✅ CORRECT PASSWORD: ${password}`);
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.log('   ❌ None of the test passwords match');
      console.log('\n💡 This donor was likely created by a test script with a different password.');
      console.log('   Recommendation: Use test.donor@example.com instead (verified working)');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkDonorPassword();
