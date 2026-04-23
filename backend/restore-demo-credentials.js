require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

console.log('🔄 Restoring original demo credentials...\n');

async function restoreDemoCredentials() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Restore Admin
    console.log('═══════════════════════════════════════════════════════════');
    console.log('RESTORING ADMIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════════');
    
    const adminResult = await User.updateOne(
      { email: 'sabalen666@gmail.com' },
      { email: 'admin@lifechain.com' }
    );
    console.log(`✅ Admin email restored: admin@lifechain.com (${adminResult.modifiedCount} records)`);
    
    // Restore Hospitals
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('RESTORING HOSPITAL CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════════');
    
    const hospital1Result = await User.updateOne(
      { email: 'nileshsabale8869@gmail.com' },
      { email: 'sample.hospital1@example.com' }
    );
    console.log(`✅ Hospital 1 email restored: sample.hospital1@example.com (${hospital1Result.modifiedCount} records)`);
    
    const hospital2Result = await User.updateOne(
      { email: 'nilesh.sabale.dev@gmail.com' },
      { email: 'sample.hospital2@example.com' }
    );
    console.log(`✅ Hospital 2 email restored: sample.hospital2@example.com (${hospital2Result.modifiedCount} records)`);
    
    // Restore Donors
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('RESTORING DONOR CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════════');
    
    const donor1Result = await User.updateOne(
      { email: 'ns7499244144@gmail.com' },
      { email: 'sample.donor1@example.com' }
    );
    console.log(`✅ Donor 1 email restored: sample.donor1@example.com (${donor1Result.modifiedCount} records)`);
    
    const donor2Result = await User.updateOne(
      { email: 'kingmaker0633@gmail.com' },
      { email: 'sample.donor2@example.com' }
    );
    console.log(`✅ Donor 2 email restored: sample.donor2@example.com (${donor2Result.modifiedCount} records)`);
    
    const donor3Result = await User.updateOne(
      { email: 'userns3106@gmail.com' },
      { email: 'sample.donor3@example.com' }
    );
    console.log(`✅ Donor 3 email restored: sample.donor3@example.com (${donor3Result.modifiedCount} records)`);
    
    // Verify restoration
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('VERIFICATION - RESTORED DEMO CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════════');
    
    const restoredUsers = await User.find({
      email: {
        $in: [
          'admin@lifechain.com',
          'sample.hospital1@example.com',
          'sample.hospital2@example.com',
          'sample.donor1@example.com',
          'sample.donor2@example.com',
          'sample.donor3@example.com'
        ]
      }
    }).select('email role hospitalName name');
    
    restoredUsers.forEach(user => {
      const displayName = user.hospitalName || user.name || 'Unknown';
      console.log(`✅ ${user.role}: ${displayName} (${user.email})`);
    });
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('DEMO CREDENTIALS RESTORED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Admin: admin@lifechain.com / Admin@123456');
    console.log('✅ Hospital 1: sample.hospital1@example.com / HospitalPass123!');
    console.log('✅ Hospital 2: sample.hospital2@example.com / HospitalPass123!');
    console.log('✅ Donor 1: sample.donor1@example.com / SamplePass123!');
    console.log('✅ Donor 2: sample.donor2@example.com / SamplePass123!');
    console.log('✅ Donor 3: sample.donor3@example.com / SamplePass123!');
    console.log('\n🎉 Original demo credentials restored successfully!');
    console.log('📧 SMTP still configured to send emails to your real addresses');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Close connection
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error restoring credentials:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

restoreDemoCredentials();