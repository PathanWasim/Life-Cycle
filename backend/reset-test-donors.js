require('dotenv').config();
const mongoose = require('mongoose');

async function resetTestDonors() {
  try {
    console.log('🔄 RESETTING TEST DONORS...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');
    const BloodUnit = require('./models/BloodUnit');

    // Test donor emails
    const testDonorEmails = [
      'sample.donor1@example.com',
      'sample.donor2@example.com'
    ];

    console.log('📋 Finding test donors...\n');

    for (const email of testDonorEmails) {
      const donor = await User.findOne({ email, role: 'Donor' });
      
      if (!donor) {
        console.log(`❌ Donor not found: ${email}`);
        continue;
      }

      console.log(`👤 Processing: ${donor.name || email}`);
      console.log(`   Blood Group: ${donor.bloodGroup}`);
      console.log(`   Current Status: ${donor.checkEligibility()}`);
      
      // Find all blood units for this donor
      const bloodUnits = await BloodUnit.find({ donorID: donor._id });
      console.log(`   Blood Units Found: ${bloodUnits.length}`);

      if (bloodUnits.length > 0) {
        // Delete all blood units for this donor
        const deleteResult = await BloodUnit.deleteMany({ donorID: donor._id });
        console.log(`   ✅ Deleted ${deleteResult.deletedCount} blood units`);
      }

      // Reset donor's last donation date
      donor.lastDonationDate = null;
      await donor.save();
      console.log(`   ✅ Reset lastDonationDate to null`);
      console.log(`   ✅ New Status: ${donor.checkEligibility()}`);
      console.log();
    }

    console.log('📊 SUMMARY:\n');
    
    // Count remaining blood units
    const totalBloodUnits = await BloodUnit.countDocuments();
    console.log(`Total Blood Units Remaining: ${totalBloodUnits}`);
    
    // Check donor eligibility
    for (const email of testDonorEmails) {
      const donor = await User.findOne({ email, role: 'Donor' });
      if (donor) {
        console.log(`${donor.name || email}: ${donor.checkEligibility()}`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Reset complete! Donors are now eligible for testing.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetTestDonors();
