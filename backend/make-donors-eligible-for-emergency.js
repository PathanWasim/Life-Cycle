require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function makeDonorsEligible() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('🔄 Making all 3 demo donors eligible for emergency requests...\n');
    
    const donorEmails = [
      'sample.donor1@example.com',
      'sample.donor2@example.com',
      'sample.donor3@example.com'
    ];
    
    for (const email of donorEmails) {
      // Set last donation date to 60 days ago (more than 56-day rule)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      await User.updateOne(
        { email },
        { $set: { lastDonationDate: sixtyDaysAgo } }
      );
      
      const donor = await User.findOne({ email });
      const eligibility = donor.checkEligibility();
      const daysSince = donor.daysSinceLastDonation();
      
      console.log(`✅ ${donor.name} (${donor.bloodGroup})`);
      console.log(`   Last Donation: ${daysSince} days ago`);
      console.log(`   Eligibility: ${eligibility}`);
      console.log('');
    }
    
    console.log('✅ All donors are now eligible!\n');
    console.log('📋 Test Emergency Requests:');
    console.log('   - A- → Will notify Donor 1 (ns7499244144@gmail.com)');
    console.log('   - B+ → Will notify Donor 2 (kingmaker0633@gmail.com)');
    console.log('   - B- → Will notify Donor 3 (userns3106@gmail.com)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

makeDonorsEligible();
