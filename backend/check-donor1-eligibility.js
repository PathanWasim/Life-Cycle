require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkDonor1Eligibility() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const donor = await User.findOne({ email: 'sample.donor1@example.com' });
    
    if (!donor) {
      console.log('❌ Donor not found!');
      process.exit(1);
    }
    
    console.log('📋 Donor 1 Details:\n');
    console.log(`Name: ${donor.name}`);
    console.log(`Email: ${donor.email}`);
    console.log(`Blood Group: ${donor.bloodGroup}`);
    console.log(`Age: ${donor.age} years`);
    console.log(`Weight: ${donor.weight} kg`);
    console.log(`City: ${donor.city}`);
    console.log(`Pincode: ${donor.pincode}`);
    console.log(`Last Donation: ${donor.lastDonationDate || 'Never'}`);
    
    if (donor.lastDonationDate) {
      const daysSince = donor.daysSinceLastDonation();
      console.log(`Days Since Last Donation: ${daysSince}`);
    }
    
    console.log(`\n🔍 Eligibility Check:`);
    const eligibility = donor.checkEligibility();
    console.log(`Status: ${eligibility}`);
    
    if (eligibility === 'Eligible') {
      console.log('\n✅ Donor is ELIGIBLE for emergency request!');
    } else {
      console.log('\n❌ Donor is INELIGIBLE!');
      console.log(`Reason: ${eligibility}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDonor1Eligibility();
