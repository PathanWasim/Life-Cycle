const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
require('dotenv').config();

async function checkDonorDonations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check sample.donor1@example.com specifically
    const donor1 = await User.findOne({ email: 'sample.donor1@example.com' });
    
    if (!donor1) {
      console.log('Donor 1 not found!');
      return;
    }

    console.log('\n=== DONOR 1 PROFILE ===');
    console.log(`Name: ${donor1.name}`);
    console.log(`Email: ${donor1.email}`);
    console.log(`Blood Group: ${donor1.bloodGroup}`);
    console.log(`Location: ${donor1.city}, ${donor1.pincode}`);

    // Find all blood units donated by this donor
    const donations = await BloodUnit.find({ donorID: donor1._id })
      .populate('originalHospitalID', 'hospitalName')
      .populate('currentHospitalID', 'hospitalName')
      .sort({ collectionDate: -1 });

    console.log(`\n=== DONATION HISTORY (${donations.length} total) ===`);
    
    let correctBloodGroup = 0;
    let wrongBloodGroup = 0;
    
    donations.forEach((donation, index) => {
      const isCorrect = donation.bloodGroup === donor1.bloodGroup;
      const status = isCorrect ? '✅' : '❌';
      
      if (isCorrect) correctBloodGroup++;
      else wrongBloodGroup++;
      
      console.log(`${index + 1}. ${status} ${donation.bloodUnitID}`);
      console.log(`   Blood Group: ${donation.bloodGroup} (Donor: ${donor1.bloodGroup})`);
      console.log(`   Collection Date: ${donation.collectionDate.toDateString()}`);
      console.log(`   Status: ${donation.status}`);
      console.log(`   Hospital: ${donation.originalHospitalID?.hospitalName || 'Unknown'}`);
      console.log('');
    });

    console.log('=== SUMMARY ===');
    console.log(`Correct Blood Group (${donor1.bloodGroup}): ${correctBloodGroup}`);
    console.log(`Wrong Blood Group: ${wrongBloodGroup}`);
    
    if (wrongBloodGroup > 0) {
      console.log('\n❌ PROBLEM DETECTED: Donor has donations with wrong blood groups!');
      console.log('This should not happen - each donor should only donate their own blood type.');
    } else {
      console.log('\n✅ All donations have correct blood group');
    }

    // Check other demo donors too
    const otherDonors = await User.find({ 
      role: 'Donor',
      email: { $in: ['sample.donor2@example.com', 'sample.donor3@example.com'] }
    });

    for (const donor of otherDonors) {
      const donorDonations = await BloodUnit.find({ donorID: donor._id });
      const wrongBG = donorDonations.filter(d => d.bloodGroup !== donor.bloodGroup);
      
      console.log(`\n${donor.email} (${donor.bloodGroup}): ${donorDonations.length} donations, ${wrongBG.length} wrong blood group`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDonorDonations();