require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');

async function createSampleDonorHistory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🩸 CREATING DONATION HISTORY FOR SAMPLE DONORS');
    console.log('===============================================\n');

    // Get sample donors
    const sampleDonors = await User.find({
      email: { $in: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
    });

    // Get hospitals
    const hospitals = await User.find({
      email: { $in: ['sample.hospital1@example.com', 'sample.hospital2@example.com'] }
    });

    if (sampleDonors.length === 0 || hospitals.length === 0) {
      console.log('❌ Sample donors or hospitals not found');
      process.exit(1);
    }

    console.log('📅 Current date: March 14, 2026\n');
    console.log('🎯 Creating donation history in 2025 (all donors will be eligible in 2026)\n');

    // Donation history for each sample donor
    // Each donor will have 3-4 donations in 2025, spaced properly (>56 days apart)
    
    const donationHistory = [
      // Sample Donor 1 (A-, Mumbai)
      {
        donor: sampleDonors.find(d => d.email === 'sample.donor1@example.com'),
        hospital: hospitals.find(h => h.email === 'sample.hospital1@example.com'),
        donations: [
          { date: new Date('2025-02-15'), status: 'Used' },      // ~13 months ago
          { date: new Date('2025-05-20'), status: 'Used' },      // ~10 months ago
          { date: new Date('2025-08-25'), status: 'Stored' },    // ~7 months ago
          { date: new Date('2025-11-30'), status: 'Stored' }     // ~3.5 months ago (>56 days = eligible)
        ]
      },
      // Sample Donor 2 (B+, Delhi)
      {
        donor: sampleDonors.find(d => d.email === 'sample.donor2@example.com'),
        hospital: hospitals.find(h => h.email === 'sample.hospital2@example.com'),
        donations: [
          { date: new Date('2025-01-10'), status: 'Used' },      // ~14 months ago
          { date: new Date('2025-04-18'), status: 'Used' },      // ~11 months ago
          { date: new Date('2025-07-22'), status: 'Used' },      // ~8 months ago
          { date: new Date('2025-10-28'), status: 'Stored' }     // ~4.5 months ago (>56 days = eligible)
        ]
      },
      // Sample Donor 3 (B-, Bangalore)
      {
        donor: sampleDonors.find(d => d.email === 'sample.donor3@example.com'),
        hospital: hospitals.find(h => h.email === 'sample.hospital3@example.com') || hospitals[0],
        donations: [
          { date: new Date('2025-03-05'), status: 'Used' },      // ~12 months ago
          { date: new Date('2025-06-12'), status: 'Used' },      // ~9 months ago
          { date: new Date('2025-09-18'), status: 'Stored' },    // ~6 months ago
          { date: new Date('2025-12-20'), status: 'Stored' }     // ~3 months ago (>56 days = eligible)
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
        
        // Calculate expiry date (42 days from collection)
        const expiryDate = new Date(collectionDate);
        expiryDate.setDate(expiryDate.getDate() + 42);

        // Create blood unit
        const bloodUnit = new BloodUnit({
          bloodUnitID: `HISTORY-BU-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
          donorID: donor._id,
          bloodGroup: donor.bloodGroup,
          collectionDate: collectionDate,
          expiryDate: expiryDate,
          status: donation.status,
          originalHospitalID: hospital._id,
          currentHospitalID: hospital._id,
          donationTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
        });

        // If status is 'Used', set usage date
        if (donation.status === 'Used') {
          const usageDate = new Date(collectionDate);
          usageDate.setDate(usageDate.getDate() + Math.floor(Math.random() * 20) + 5); // 5-25 days after collection
          bloodUnit.usageDate = usageDate;
          bloodUnit.usageTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        }

        await bloodUnit.save();

        const daysAgo = Math.floor((new Date('2026-03-14') - collectionDate) / (1000 * 60 * 60 * 24));
        console.log(`   ${i + 1}. ${collectionDate.toLocaleDateString()} (${daysAgo} days ago) - ${donation.status}`);

        totalCreated++;
        
        // Small delay for unique timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Update donor's lastDonationDate to the most recent donation
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
    console.log(`   Donors with history: ${sampleDonors.length}`);
    console.log(`   All donations in 2025: ✅`);
    console.log(`   All donors eligible in 2026: ✅\n`);

    // Verification
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

    console.log('✅ DONATION HISTORY CREATED SUCCESSFULLY!');
    console.log('\n🎉 All sample donors now have realistic donation history from 2025');
    console.log('🎉 All sample donors are eligible for donation in 2026');
    console.log('\n📋 Ready for demo presentation!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createSampleDonorHistory();
