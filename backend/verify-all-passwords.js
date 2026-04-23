require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function verifyPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const accounts = [
      { email: 'test.donor@example.com', role: 'Donor' },
      { email: 'test.hospital@example.com', role: 'Hospital' },
      { email: 'admin@lifechain.com', role: 'Admin' }
    ];

    const passwordsToTest = [
      'TestPassword123!',
      'Test@1234',
      'Admin@1234',
      'Admin@123456',
      'HospitalPass123!',
      'password123',
      'Password@123'
    ];

    for (const account of accounts) {
      console.log(`\n🔍 Testing ${account.role}: ${account.email}`);
      
      const user = await User.findOne({ email: account.email });
      
      if (!user) {
        console.log('   ❌ Account not found');
        continue;
      }

      console.log('   ✅ Account exists');
      console.log('   Password hash:', user.password.substring(0, 30) + '...');
      
      let foundPassword = false;
      for (const password of passwordsToTest) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          console.log(`   ✅ CORRECT PASSWORD: ${password}`);
          foundPassword = true;
          break;
        }
      }
      
      if (!foundPassword) {
        console.log('   ❌ None of the test passwords match');
        console.log('   💡 This account may have been created with a different password');
      }
    }

    console.log('\n\n📋 SUMMARY OF WORKING CREDENTIALS:\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

verifyPasswords();
