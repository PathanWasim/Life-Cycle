require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');

async function testDonor3Donations() {
  console.log('🔍 Testing Donor3 Donations\n');
  console.log('='.repeat(70));

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find donor3
    const donor3 = await User.findOne({ email: 'sample.donor3@example.com' });
    
    if (!donor3) {
      console.log('❌ Donor3 not found!');
      console.log('   Email: sample.donor3@example.com');
      process.exit(1);
    }

    console.log('👤 DONOR3 INFORMATION:');
    console.log(`   Name: ${donor3.name}`);
    console.log(`   Email: ${donor3.email}`);
    console.log(`   Blood Group: ${donor3.bloodGroup}`);
    console.log(`   Donor ID: ${donor3._id}`);
    console.log(`   Last Donation: ${donor3.lastDonationDate || 'Never'}`);
    console.log('');

    // Find all blood units for donor3
    const donations = await BloodUnit.find({ donorID: donor3._id })
      .populate('originalHospitalID', 'hospitalName city')
      .populate('currentHospitalID', 'hospitalName city')
      .sort({ collectionDate: -1 });

    console.log('🩸 BLOOD UNITS FOR DONOR3:');
    console.log(`   Total Donations: ${donations.length}\n`);

    if (donations.length === 0) {
      console.log('   ⚠️  NO DONATIONS FOUND!');
      console.log('   This means no hospital has recorded a donation for donor3 yet.');
      console.log('');
      console.log('   To test:');
      console.log('   1. Login as hospital: sample.hospital1@example.com / HospitalPass123!');
      console.log('   2. Go to "Record Donation" tab');
      console.log('   3. Search donor: sample.donor3@example.com');
      console.log('   4. Record donation');
      console.log('   5. Then login as donor3 to see the donation');
    } else {
      donations.forEach((unit, index) => {
        console.log(`   ${index + 1}. Blood Unit ID: ${unit.bloodUnitID}`);
        console.log(`      Blood Group: ${unit.bloodGroup}`);
        console.log(`      Collection Date: ${unit.collectionDate.toISOString().split('T')[0]}`);
        console.log(`      Status: ${unit.status}`);
        console.log(`      Hospital: ${unit.originalHospitalID?.hospitalName || 'Unknown'}`);
        console.log(`      Blockchain TX: ${unit.donationTxHash || 'Pending'}`);
        console.log('');
      });
    }

    // Check if donor3 has lastDonationDate set
    console.log('📅 LAST DONATION DATE CHECK:');
    if (donor3.lastDonationDate) {
      const daysSince = Math.floor((new Date() - new Date(donor3.lastDonationDate)) / (1000 * 60 * 60 * 24));
      console.log(`   Last Donation: ${donor3.lastDonationDate.toISOString().split('T')[0]}`);
      console.log(`   Days Since: ${daysSince} days ago`);
      console.log(`   Eligibility: ${donor3.checkEligibility()}`);
    } else {
      console.log('   Last Donation: Never donated');
      console.log(`   Eligibility: ${donor3.checkEligibility()}`);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('✅ Test Complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testDonor3Donations();
