require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function setupTestAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check and create test hospital
    let hospital = await User.findOne({ email: 'test.hospital@example.com' });
    if (!hospital) {
      console.log('Creating test hospital account...');
      const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
      hospital = await User.create({
        email: 'test.hospital@example.com',
        password: hashedPassword,
        role: 'Hospital',
        hospitalName: 'Test City Hospital',
        city: 'Mumbai',
        pincode: '400001',
        phone: '9876543210',
        walletAddress: '0x9876543210987654321098765432109876543210',
        isVerified: false
      });
      console.log('✅ Test hospital created');
    } else {
      console.log('✅ Test hospital already exists');
    }
    console.log('   Email: test.hospital@example.com');
    console.log('   Password: TestPassword123!');
    console.log('   Verified:', hospital.isVerified);

    // Check and create admin account
    let admin = await User.findOne({ email: 'admin@lifechain.com' });
    if (!admin) {
      console.log('\nCreating admin account...');
      const hashedPassword = await bcrypt.hash('Admin@1234', 10);
      admin = await User.create({
        email: 'admin@lifechain.com',
        password: hashedPassword,
        role: 'Admin',
        name: 'System Admin',
        walletAddress: '0xADMIN1234567890123456789012345678901234'
      });
      console.log('✅ Admin account created');
    } else {
      console.log('\n✅ Admin account already exists');
    }
    console.log('   Email: admin@lifechain.com');
    console.log('   Password: Admin@1234');

    // Check test donor
    const donor = await User.findOne({ email: 'test.donor@example.com' });
    console.log('\n✅ Test donor exists');
    console.log('   Email: test.donor@example.com');
    console.log('   Password: TestPassword123!');
    console.log('   Blood Group:', donor.bloodGroup);
    console.log('   Eligible:', donor.checkEligibility());

    console.log('\n🎉 All test accounts ready!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

setupTestAccounts();
