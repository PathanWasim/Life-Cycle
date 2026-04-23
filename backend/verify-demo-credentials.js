require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function verifyDemoCredentials() {
  try {
    console.log('🔍 VERIFYING DEMO CREDENTIALS...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');

    // Test credentials
    const credentials = [
      { email: 'sample.donor1@example.com', password: 'SamplePass123!', role: 'Donor', name: 'Donor 1' },
      { email: 'sample.donor2@example.com', password: 'SamplePass123!', role: 'Donor', name: 'Donor 2' },
      { email: 'sample.donor3@example.com', password: 'SamplePass123!', role: 'Donor', name: 'Donor 3' },
      { email: 'sample.hospital1@example.com', password: 'HospitalPass123!', role: 'Hospital', name: 'Hospital 1' },
      { email: 'sample.hospital2@example.com', password: 'HospitalPass123!', role: 'Hospital', name: 'Hospital 2' },
      { email: 'admin@lifechain.com', password: 'Admin@123456', role: 'Admin', name: 'Admin' }
    ];

    console.log('📋 TESTING CREDENTIALS:\n');

    for (const cred of credentials) {
      const user = await User.findOne({ email: cred.email });
      
      if (!user) {
        console.log(`❌ ${cred.name} (${cred.email}): NOT FOUND`);
        continue;
      }

      const isMatch = await bcrypt.compare(cred.password, user.password);
      
      if (isMatch) {
        console.log(`✅ ${cred.name} (${cred.email}): WORKING`);
        if (cred.role === 'Donor') {
          console.log(`   Blood Group: ${user.bloodGroup}, Age: ${user.age}, Eligible: ${user.checkEligibility()}`);
        } else if (cred.role === 'Hospital') {
          console.log(`   Hospital: ${user.hospitalName || 'N/A'}, City: ${user.city}, Verified: ${user.isVerified}`);
        }
      } else {
        console.log(`❌ ${cred.name} (${cred.email}): PASSWORD MISMATCH`);
      }
    }

    console.log('\n📊 SUMMARY:\n');

    const donors = await User.countDocuments({ role: 'Donor' });
    const hospitals = await User.countDocuments({ role: 'Hospital', isVerified: true });
    const admins = await User.countDocuments({ role: 'Admin' });

    console.log(`Total Donors: ${donors}`);
    console.log(`Verified Hospitals: ${hospitals}`);
    console.log(`Admins: ${admins}`);

    await mongoose.connection.close();
    console.log('\n✅ Verification complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyDemoCredentials();
