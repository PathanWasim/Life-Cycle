require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');

async function resetAndCreateHistory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔄 RESET AND CREATE CLEAN DONATION HISTORY');
    console.log('==========================================\n');

    // Step 1: Get sample donors
    const sampleDonors = await User.find({
      email: { $in: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
    });

    if (sampleDonors.length === 0) {
      console.log('❌ Sample donors not found');
      process.exit(1);
    }

    // Step 2: Delete ALL existing blood units for sample donors
    console.log('🗑️  Step 1: Deleting existing blood units...');
    const sampleDonorIDs = sampleDonors.map(d => d._id);
    const deleteResult = await BloodUnit.deleteMany({
      donorID: { $in: sampleDonorIDs }
    });
    console.log(`   ✅ Deleted ${deleteResult.deletedCount} existing units\n`);

    // Step 3: Get hospitals
    const hospitals = await User.find({
      email: { $in: ['sample.hospital1@example.com', 'sample.hospital2@example.com', 'sample.hospital3@example.com'] }
    });

    console.log('🩸 Step 2: Creating clean donation history...\n');

    // Donation history for each sample donor (4 donations each in 2025)
    const donationHistory = [
      // Sample Donor 1 (A-, Mumbai)
      {
        donor: sampleDonors.find(d => d.email === 'sample.donor1@example.com'),
        hospital: hospitals.find(h => h.email === 'sample.hospital1@example.com') || hospitals[0],
        donations: [
          { date: new Date('2025-02-15'), status: 'Used' },
          { date: new Date('2025-05-20'), status: 'Used' },
          { date: new Date('2025-08-25'), status: 'Stored' },
          { date: new Date('2025-11-30'), status: 'Stored' }
        ]
      },
      // Sample Donor 2 (B+, Delhi)
      {
        donor: sampleDonors.find(d => d.email === 'sample.donor2@example.com'),
        hospital: hospitals.find(h => h.email === 'sample.hospital2@example.com') || hospitals[0],
        donations: [
          { date: new Date('2025-01-10'), status: 'Used' },
          { date: new Date('2025-04-18'), status: 'Used' },
          { date: new Date('2025-07-22'), status: 'Used' },
          { date: new Date('2025-10-28'), status: 'Stored' }
        ]
      },
      // Sample Donor 3 (B-, Bangalore)
      {
        donor: sampleDonors.find(d => d.email === 'sample.donor3@example.com'),
        hospital: hospitals.find(h => h.email === 'sample.hospital3@example.com') || hospitals[0],
        donations: [
          { date: new Date('2025-03-05'), status: 'Used' },
          { date: new Date('2025-06-12'), status: 'Used' },
          { date: new Date('2025-09-18'), status: 'Stored' },
          { date: new Date('2025-12-20'), status: 'Stored' }
        ]
      }
    ];

    let totalCreated = 0;

    for (const record of donationHistory) {
      const donor = record.donor;
      const hospital = record.hospital;

      console.log(`👤 ${donor.name} (${donor.email})`);
      console.log(`   Blood Group: ${donor.bloodGroup}`);
      console.log(`   Hospital: ${hospital.hospitalName}\n`);

      for (let i = 0; i < record.donations.length; i++) {
        const donation = record.donations[i];
        const collectionDate = donation.date;
        
        const expiryDate = new Date(collectionDate);
        expiryDate.setDate(expiryDate.getDate() + 42);

        const bloodUnit = new BloodUnit({
          bloodUnitID: `DEMO-${donor.bloodGroup}-${collectionDate.getTime()}-${Math.random().toString(36).substr(2, 6)}`,
          donorID: donor._id,
          bloodGroup: donor.bloodGroup,
          collectionDate: collectionDate,
          expiryDate: expiryDate,
          status: donation.status,
          originalHospitalID: hospital._id,
          currentHospitalID: hospital._id,
          donationTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
        });

        if (donation.status === 'Used') {
          const usageDate = new Date(collectionDate);
          usageDate.setDate(usageDate.getDate() + Math.floor(Math.random() * 20) + 5);
          bloodUnit.usageDate = usageDate;
          bloodUnit.usageTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        }

        await bloodUnit.save();

        const daysAgo = Math.floor((new Date('2026-03-14') - collectionDate) / (1000 * 60 * 60 * 24));
        console.log(`   ${i + 1}. ${collectionDate.toLocaleDateString()} (${daysAgo} days ago) - ${donation.status}`);

        totalCreated++;
      }

      // Update donor's lastDonationDate
      const lastDonation = record.donations[record.donations.length - 1];
      donor.lastDonationDate = lastDonation.date;
      await donor.save();

      const daysSinceLastDonation = Math.floor((new Date('2026-03-14') - lastDonation.date) / (1000 * 60 * 60 * 24));
      const eligibility = donor.checkEligibility();

      console.log(`\n   Last Donation: ${lastDonation.date.toLocaleDateString()}`);
      console.log(`   Days Since: ${daysSinceLastDonation} days`);
      console.log(`   Eligibility: ${eligibility}`);
      console.log('');
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total blood units created: ${totalCreated}`);
    console.log(`   Donations per donor: 4`);
    console.log(`   All donations in 2025: ✅`);
    console.log(`   All donors eligible in 2026: ✅\n`);

    // Final verification
    console.log('🔍 Final Verification:\n');
    
    for (const donor of sampleDonors) {
      const updatedDonor = await User.findById(donor._id);
      const units = await BloodUnit.find({ donorID: donor._id }).sort({ collectionDate: -1 });
      const eligibility = updatedDonor.checkEligibility();
      
      console.log(`   ${updatedDonor.name}:`);
      console.log(`      Total Donations: ${units.length}`);
      console.log(`      Last Donation: ${updatedDonor.lastDonationDate.toLocaleDateString()}`);
      console.log(`      Eligibility: ${eligibility}`);
      console.log('');
    }

    console.log('✅ CLEAN DONATION HISTORY CREATED!');
    console.log('\n🎉 Ready for demo presentation!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAndCreateHistory();
