const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
require('dotenv').config();

async function createRealisticDonationHistory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('\n🩸 CREATING REALISTIC DONATION HISTORY');
    console.log('====================================');
    console.log('📋 Medical Rule: Minimum 56 days between donations');

    // Get demo users
    const hospitals = await User.find({ 
      email: { $in: ['sample.hospital1@example.com', 'sample.hospital2@example.com'] }
    });
    
    const donors = await User.find({ 
      role: 'Donor',
      email: { $in: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
    });

    console.log('\n👥 Demo Donors:');
    donors.forEach(donor => {
      console.log(`   ${donor.email} → ${donor.bloodGroup}`);
    });

    // Clear ALL existing blood units for demo donors
    console.log('\n🗑️  Clearing all existing donations...');
    
    let totalDeleted = 0;
    for (const donor of donors) {
      const deleted = await BloodUnit.deleteMany({ donorID: donor._id });
      totalDeleted += deleted.deletedCount;
      console.log(`   ✅ Deleted ${deleted.deletedCount} donations for ${donor.email}`);
    }
    console.log(`   Total deleted: ${totalDeleted} units`);

    // Reset donor eligibility and last donation date
    await User.updateMany(
      { 
        role: 'Donor',
        email: { $in: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
      },
      { 
        $set: { 
          lastDonationDate: null,
          eligibilityStatus: 'Eligible'
        }
      }
    );
    console.log('✅ Reset all donor eligibility');

    // Create realistic donation history with proper gaps
    console.log('\n📅 Creating realistic donation timeline...');
    
    const today = new Date();
    
    // Realistic donation plan (respecting 56-day rule)
    const donationPlan = [
      // Donor 1 (A-): 3 donations with proper gaps
      {
        donor: 'sample.donor1@example.com',
        bloodGroup: 'A-',
        donations: [
          { daysAgo: 180, hospital: 'sample.hospital1@example.com', status: 'Used' },      // 6 months ago
          { daysAgo: 90, hospital: 'sample.hospital2@example.com', status: 'Transferred' }, // 3 months ago  
          { daysAgo: 30, hospital: 'sample.hospital1@example.com', status: 'Stored' }       // 1 month ago
        ]
      },
      
      // Donor 2 (B+): 2 donations with proper gaps
      {
        donor: 'sample.donor2@example.com',
        bloodGroup: 'B+',
        donations: [
          { daysAgo: 150, hospital: 'sample.hospital1@example.com', status: 'Used' },      // 5 months ago
          { daysAgo: 60, hospital: 'sample.hospital2@example.com', status: 'Stored' }      // 2 months ago
        ]
      },
      
      // Donor 3 (B-): 2 donations with proper gaps  
      {
        donor: 'sample.donor3@example.com',
        bloodGroup: 'B-',
        donations: [
          { daysAgo: 200, hospital: 'sample.hospital2@example.com', status: 'Used' },      // 6.5 months ago
          { daysAgo: 120, hospital: 'sample.hospital1@example.com', status: 'Transferred' } // 4 months ago
        ]
      }
    ];

    let totalCreated = 0;
    
    for (const donorPlan of donationPlan) {
      const donor = donors.find(d => d.email === donorPlan.donor);
      
      console.log(`\n👤 ${donor.email} (${donor.bloodGroup}):`);
      
      let lastDonationDate = null;
      
      // Sort donations by daysAgo (oldest first) to set lastDonationDate correctly
      const sortedDonations = donorPlan.donations.sort((a, b) => b.daysAgo - a.daysAgo);
      
      for (let i = 0; i < sortedDonations.length; i++) {
        const donation = sortedDonations[i];
        const hospital = hospitals.find(h => h.email === donation.hospital);
        
        // Calculate collection date
        const collectionDate = new Date(today);
        collectionDate.setDate(collectionDate.getDate() - donation.daysAgo);
        
        // Calculate expiry date (42 days from collection)
        const expiryDate = new Date(collectionDate);
        expiryDate.setDate(expiryDate.getDate() + 42);
        
        // Determine current hospital based on status
        let currentHospitalID = hospital._id;
        if (donation.status === 'Transferred') {
          // If transferred, put in the other hospital
          currentHospitalID = hospitals.find(h => h._id.toString() !== hospital._id.toString())._id;
        }

        const bloodUnit = new BloodUnit({
          bloodUnitID: `REALISTIC-BU-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
          donorID: donor._id,
          bloodGroup: donorPlan.bloodGroup,
          collectionDate: collectionDate,
          expiryDate: expiryDate,
          status: donation.status,
          originalHospitalID: hospital._id,
          currentHospitalID: currentHospitalID,
          donationTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
        });

        // Add transfer history if transferred
        if (donation.status === 'Transferred') {
          bloodUnit.transferHistory = [{
            fromHospitalID: hospital._id,
            toHospitalID: currentHospitalID,
            transferDate: new Date(collectionDate.getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random date within 7 days
            blockchainTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
          }];
        }

        // Add usage info if used
        if (donation.status === 'Used') {
          bloodUnit.usageDate = new Date(collectionDate.getTime() + (Math.random() * 30 * 24 * 60 * 60 * 1000)); // Used within 30 days
          bloodUnit.patientID = `PAT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
          bloodUnit.usageTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        }

        await bloodUnit.save();
        totalCreated++;
        
        // Update last donation date (most recent donation)
        if (i === 0) { // First in sorted array is most recent
          lastDonationDate = collectionDate;
        }
        
        const daysSinceToday = Math.floor((today - collectionDate) / (1000 * 60 * 60 * 24));
        console.log(`   ✅ ${collectionDate.toDateString()} (${daysSinceToday} days ago) - ${donation.status}`);
        
        // Small delay for unique timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Update donor's last donation date
      if (lastDonationDate) {
        donor.lastDonationDate = lastDonationDate;
        
        // Calculate eligibility based on 56-day rule
        const daysSinceLastDonation = Math.floor((today - lastDonationDate) / (1000 * 60 * 60 * 24));
        if (daysSinceLastDonation >= 56) {
          donor.eligibilityStatus = 'Eligible';
        } else {
          const daysRemaining = 56 - daysSinceLastDonation;
          donor.eligibilityStatus = `Ineligible - Must wait ${daysRemaining} more days (56-day rule)`;
        }
        
        await donor.save();
        console.log(`   📅 Last donation: ${lastDonationDate.toDateString()}`);
        console.log(`   ✅ Status: ${donor.eligibilityStatus}`);
      }
    }

    // Create some additional hospital inventory (not from demo donors)
    console.log('\n🏥 Adding additional hospital inventory...');
    
    // Add some units from non-demo donors to make inventory realistic
    const additionalInventory = [
      { hospital: 'sample.hospital1@example.com', bloodGroup: 'O+', count: 3 },
      { hospital: 'sample.hospital1@example.com', bloodGroup: 'A+', count: 2 },
      { hospital: 'sample.hospital2@example.com', bloodGroup: 'O+', count: 2 },
      { hospital: 'sample.hospital2@example.com', bloodGroup: 'A+', count: 2 },
      { hospital: 'sample.hospital2@example.com', bloodGroup: 'AB+', count: 1 }
    ];

    // Find some non-demo donors for additional inventory
    const otherDonors = await User.find({ 
      role: 'Donor',
      email: { $nin: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
    }).limit(10);

    for (const item of additionalInventory) {
      const hospital = hospitals.find(h => h.email === item.hospital);
      
      for (let i = 0; i < item.count; i++) {
        // Find a donor with matching blood group or create a generic one
        let donor = otherDonors.find(d => d.bloodGroup === item.bloodGroup);
        if (!donor && otherDonors.length > 0) {
          donor = otherDonors[0]; // Use any available donor
        }
        
        if (donor) {
          const daysAgo = Math.floor(Math.random() * 30) + 5; // 5-35 days ago
          const collectionDate = new Date(today);
          collectionDate.setDate(collectionDate.getDate() - daysAgo);
          
          const expiryDate = new Date(collectionDate);
          expiryDate.setDate(expiryDate.getDate() + 42);

          const bloodUnit = new BloodUnit({
            bloodUnitID: `INV-BU-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
            donorID: donor._id,
            bloodGroup: item.bloodGroup,
            collectionDate: collectionDate,
            expiryDate: expiryDate,
            status: 'Stored',
            originalHospitalID: hospital._id,
            currentHospitalID: hospital._id,
            donationTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
          });

          await bloodUnit.save();
          totalCreated++;
          
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      }
    }

    // Final verification
    console.log('\n🔍 Final Verification:');
    
    for (const donor of donors) {
      const donations = await BloodUnit.find({ donorID: donor._id }).sort({ collectionDate: -1 });
      
      console.log(`\n👤 ${donor.email} (${donor.bloodGroup}):`);
      console.log(`   Total Donations: ${donations.length}`);
      console.log(`   Eligibility: ${donor.eligibilityStatus}`);
      
      if (donations.length > 0) {
        console.log(`   Donation Timeline:`);
        donations.forEach((donation, index) => {
          const daysSince = Math.floor((today - donation.collectionDate) / (1000 * 60 * 60 * 24));
          console.log(`     ${index + 1}. ${donation.collectionDate.toDateString()} (${daysSince} days ago) - ${donation.status}`);
        });
        
        // Check gaps between donations
        for (let i = 0; i < donations.length - 1; i++) {
          const gap = Math.floor((donations[i].collectionDate - donations[i + 1].collectionDate) / (1000 * 60 * 60 * 24));
          const isValid = gap >= 56;
          console.log(`     Gap ${i + 1}-${i + 2}: ${gap} days ${isValid ? '✅' : '❌'}`);
        }
      }
    }

    // Hospital inventory summary
    console.log('\n🏥 Hospital Inventory Summary:');
    
    for (const hospital of hospitals) {
      const inventory = await BloodUnit.find({ 
        currentHospitalID: hospital._id,
        status: { $in: ['Stored', 'Collected'] }
      });
      
      console.log(`\n🏥 ${hospital.hospitalName}: ${inventory.length} units`);
      
      const bloodGroups = {};
      inventory.forEach(unit => {
        if (!bloodGroups[unit.bloodGroup]) {
          bloodGroups[unit.bloodGroup] = 0;
        }
        bloodGroups[unit.bloodGroup]++;
      });
      
      Object.keys(bloodGroups).sort().forEach(bg => {
        console.log(`   ${bg}: ${bloodGroups[bg]} units`);
      });
    }

    console.log('\n🎉 REALISTIC DONATION HISTORY CREATED!');
    console.log('====================================');
    console.log(`✅ Total Units Created: ${totalCreated}`);
    console.log('✅ All donations respect 56-day rule');
    console.log('✅ Realistic donation frequency (2-3 per donor)');
    console.log('✅ Proper eligibility status calculated');
    console.log('✅ Demo ready with medically accurate data');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createRealisticDonationHistory();