require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');

async function verifySampleDonorHistory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('📊 SAMPLE DONOR HISTORY VERIFICATION');
    console.log('====================================\n');
    
    const donors = await User.find({
      email: { $in: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
    }).sort({ email: 1 });
    
    for (const donor of donors) {
      const units = await BloodUnit.find({ donorID: donor._id }).sort({ collectionDate: -1 });
      
      console.log(`👤 ${donor.name} (${donor.bloodGroup}, ${donor.city})`);
      console.log(`   Email: ${donor.email}`);
      console.log(`   Last Donation: ${donor.lastDonationDate ? donor.lastDonationDate.toLocaleDateString() : 'Never'}`);
      console.log(`   Total Donations: ${units.length}`);
      console.log(`   Eligibility: ${donor.checkEligibility()}`);
      
      if (units.length > 0) {
        console.log(`\n   Donation History:`);
        units.forEach((unit, i) => {
          const daysAgo = Math.floor((new Date() - unit.collectionDate) / (1000 * 60 * 60 * 24));
          console.log(`      ${i + 1}. ${unit.collectionDate.toLocaleDateString()} (${daysAgo} days ago) - ${unit.status}`);
        });
      }
      
      console.log('\n');
    }
    
    console.log('✅ Verification complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifySampleDonorHistory();
