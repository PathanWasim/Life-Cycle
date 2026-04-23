require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

console.log('🔄 Updating demo users with real email addresses...\n');

async function updateRealEmails() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Update Admin
    console.log('═══════════════════════════════════════════════════════════');
    console.log('UPDATING ADMIN EMAIL');
    console.log('═══════════════════════════════════════════════════════════');
    
    const adminResult = await User.updateOne(
      { email: 'admin@lifechain.com' },
      { email: 'sabalen666@gmail.com' }
    );
    console.log(`✅ Admin email updated: sabalen666@gmail.com (${adminResult.modifiedCount} records)`);
    
    // Update Hospitals
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('UPDATING HOSPITAL EMAILS');
    console.log('═══════════════════════════════════════════════════════════');
    
    const hospital1Result = await User.updateOne(
      { email: 'sample.hospital1@example.com' },
      { email: 'nileshsabale8869@gmail.com' }
    );
    console.log(`✅ Hospital 1 email updated: nileshsabale8869@gmail.com (${hospital1Result.modifiedCount} records)`);
    
    const hospital2Result = await User.updateOne(
      { email: 'sample.hospital2@example.com' },
      { email: 'nilesh.sabale.dev@gmail.com' }
    );
    console.log(`✅ Hospital 2 email updated: nilesh.sabale.dev@gmail.com (${hospital2Result.modifiedCount} records)`);
    
    // Update Donors
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('UPDATING DONOR EMAILS');
    console.log('═══════════════════════════════════════════════════════════');
    
    const donor1Result = await User.updateOne(
      { email: 'sample.donor1@example.com' },
      { email: 'ns7499244144@gmail.com' }
    );
    console.log(`✅ Donor 1 email updated: ns7499244144@gmail.com (${donor1Result.modifiedCount} records)`);
    
    const donor2Result = await User.updateOne(
      { email: 'sample.donor2@example.com' },
      { email: 'kingmaker0633@gmail.com' }
    );
    console.log(`✅ Donor 2 email updated: kingmaker0633@gmail.com (${donor2Result.modifiedCount} records)`);
    
    const donor3Result = await User.updateOne(
      { email: 'sample.donor3@example.com' },
      { email: 'userns3106@gmail.com' }
    );
    console.log(`✅ Donor 3 email updated: userns3106@gmail.com (${donor3Result.modifiedCount} records)`);
    
    // Verify updates
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('VERIFICATION - UPDATED USER EMAILS');
    console.log('═══════════════════════════════════════════════════════════');
    
    const updatedUsers = await User.find({
      email: {
        $in: [
          'sabalen666@gmail.com',
          'nileshsabale8869@gmail.com',
          'nilesh.sabale.dev@gmail.com',
          'ns7499244144@gmail.com',
          'kingmaker0633@gmail.com',
          'userns3106@gmail.com'
        ]
      }
    }).select('email role hospitalName name');
    
    updatedUsers.forEach(user => {
      const displayName = user.hospitalName || user.name || 'Unknown';
      console.log(`✅ ${user.role}: ${displayName} (${user.email})`);
    });
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('EMAIL UPDATE SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Admin email: sabalen666@gmail.com');
    console.log('✅ Hospital 1 email: nileshsabale8869@gmail.com');
    console.log('✅ Hospital 2 email: nilesh.sabale.dev@gmail.com');
    console.log('✅ Donor 1 email: ns7499244144@gmail.com');
    console.log('✅ Donor 2 email: kingmaker0633@gmail.com');
    console.log('✅ Donor 3 email: userns3106@gmail.com');
    console.log('\n🎉 All email addresses updated successfully!');
    console.log('📧 SMTP configured with: sabalen666@gmail.com');
    console.log('\n⚠️  IMPORTANT: Restart the backend server to apply email configuration!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Close connection
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error updating emails:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

updateRealEmails();