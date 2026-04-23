const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
require('dotenv').config({ path: './.env' });

async function setupDemoWithEligibleDonors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB\n');

    console.log('🎯 SETTING UP DEMO WITH ELIGIBLE DONORS');
    console.log('========================================\n');

    // Step 1: Fix locations
    console.log('📍 Step 1: Ensuring proper location data...');
    
    const locationUpdates = [
      { email: 'sample.donor1@example.com', city: 'Mumbai', pincode: '400001' },
      { email: 'sample.donor2@example.com', city: 'Delhi', pincode: '110001' },
      { email: 'sample.donor3@example.com', city: 'Bangalore', pincode: '560001' },
      { email: 'sample.hospital1@example.com', city: 'Mumbai', pincode: '400001' },
      { email: 'sample.hospital2@example.com', city: 'Delhi', pincode: '110001' }
    ];

    for (const update of locationUpdates) {
      await User.updateOne(
        { email: update.email },
        { $set: { city: update.city, pincode: update.pincode } }
      );
    }
    console.log('✅ Location data updated\n');

    // Step 2: Delete ALL blood units from sample donors 1, 2, 3
    console.log('🗑️  Step 2: Clearing blood units from sample donors 1, 2, 3...');
    
    const sampleDonors = await User.find({
      email: { $in: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
    });
    
    const sampleDonorIDs = sampleDonors.map(d => d._id);
    
    const deleteResult = await BloodUnit.deleteMany({
      donorID: { $in: sampleDonorIDs }
    });
    
    console.log(`✅ Deleted ${deleteResult.deletedCount} blood units from sample donors\n`);

    // Step 3: Reset donor eligibility (clear lastDonationDate)
    console.log('👥 Step 3: Resetting donor eligibility...');
    
    await User.updateMany(
      { 
        email: { $in: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
      },
      { 
        $set: { 
          lastDonationDate: null,
          eligibilityStatus: 'Eligible'
        }
      }
    );
    console.log('✅ Sample donors 1, 2, 3 are now eligible for donation\n');

    // Step 4: Verify eligibility
    console.log('🔍 Step 4: Verifying donor eligibility...\n');
    
    for (const donor of sampleDonors) {
      // Reload donor to get updated data
      const updatedDonor = await User.findById(donor._id);
      const eligibility = updatedDonor.checkEligibility();
      
      console.log(`   ${updatedDonor.name} (${updatedDonor.email})`);
      console.log(`      Blood Group: ${updatedDonor.bloodGroup}`);
      console.log(`      City: ${updatedDonor.city}`);
      console.log(`      Last Donation: ${updatedDonor.lastDonationDate || 'Never'}`);
      console.log(`      Status: ${eligibility}`);
      console.log('');
    }

    // Step 5: Create inventory from OTHER donors (not sample donors 1, 2, 3)
    console.log('🩸 Step 5: Creating realistic inventory from other donors...\n');
    
    const hospitals = await User.find({ 
      email: { $in: ['sample.hospital1@example.com', 'sample.hospital2@example.com'] }
    });
    
    // Get all donors EXCEPT sample donors 1, 2, 3
    const otherDonors = await User.find({ 
      role: 'Donor',
      email: { $nin: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
    });

    console.log(`   Using ${otherDonors.length} other donors for inventory\n`);

    // Hospital 1 (Mumbai) - 10 units
    const hospital1Inventory = [
      { bloodGroup: 'O+', count: 3 },
      { bloodGroup: 'A+', count: 2 },
      { bloodGroup: 'B+', count: 2 },
      { bloodGroup: 'O-', count: 1 },
      { bloodGroup: 'AB+', count: 1 },
      { bloodGroup: 'A-', count: 1 }
    ];

    // Hospital 2 (Delhi) - 10 units
    const hospital2Inventory = [
      { bloodGroup: 'O+', count: 3 },
      { bloodGroup: 'A+', count: 2 },
      { bloodGroup: 'B+', count: 2 },
      { bloodGroup: 'O-', count: 1 },
      { bloodGroup: 'AB-', count: 1 },
      { bloodGroup: 'B-', count: 1 }
    ];

    let totalCreated = 0;

    // Create Hospital 1 inventory
    const hospital1 = hospitals.find(h => h.email === 'sample.hospital1@example.com');
    for (const item of hospital1Inventory) {
      for (let i = 0; i < item.count; i++) {
        // Find a donor with matching blood group from OTHER donors
        const donor = otherDonors.find(d => d.bloodGroup === item.bloodGroup);
        if (!donor) {
          console.log(`   ⚠️  Skipping ${item.bloodGroup} unit - no matching donor found`);
          continue;
        }
        
        // Random collection date (60-120 days ago to ensure donor is eligible)
        const daysAgo = Math.floor(Math.random() * 60) + 60;
        const collectionDate = new Date();
        collectionDate.setDate(collectionDate.getDate() - daysAgo);
        
        const expiryDate = new Date(collectionDate);
        expiryDate.setDate(expiryDate.getDate() + 42);

        const bloodUnit = new BloodUnit({
          bloodUnitID: `DEMO-BU-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
          donorID: donor._id,
          bloodGroup: item.bloodGroup,
          collectionDate: collectionDate,
          expiryDate: expiryDate,
          status: 'Stored',
          originalHospitalID: hospital1._id,
          currentHospitalID: hospital1._id,
          donationTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
        });

        await bloodUnit.save();
        totalCreated++;
        
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }

    // Create Hospital 2 inventory
    const hospital2 = hospitals.find(h => h.email === 'sample.hospital2@example.com');
    for (const item of hospital2Inventory) {
      for (let i = 0; i < item.count; i++) {
        const donor = otherDonors.find(d => d.bloodGroup === item.bloodGroup);
        if (!donor) {
          console.log(`   ⚠️  Skipping ${item.bloodGroup} unit - no matching donor found`);
          continue;
        }
        
        const daysAgo = Math.floor(Math.random() * 60) + 60;
        const collectionDate = new Date();
        collectionDate.setDate(collectionDate.getDate() - daysAgo);
        
        const expiryDate = new Date(collectionDate);
        expiryDate.setDate(expiryDate.getDate() + 42);

        const bloodUnit = new BloodUnit({
          bloodUnitID: `DEMO-BU-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
          donorID: donor._id,
          bloodGroup: item.bloodGroup,
          collectionDate: collectionDate,
          expiryDate: expiryDate,
          status: 'Stored',
          originalHospitalID: hospital2._id,
          currentHospitalID: hospital2._id,
          donationTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
        });

        await bloodUnit.save();
        totalCreated++;
        
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }

    console.log(`✅ Created ${totalCreated} blood units from other donors\n`);

    // Step 6: Sync all donor lastDonationDate fields
    console.log('🔄 Step 6: Syncing donor lastDonationDate fields...\n');
    
    const allDonors = await User.find({ role: 'Donor' });
    let synced = 0;
    
    for (const donor of allDonors) {
      const latestUnit = await BloodUnit.findOne({ 
        donorID: donor._id 
      }).sort({ collectionDate: -1 });
      
      if (latestUnit) {
        donor.lastDonationDate = latestUnit.collectionDate;
        await donor.save();
        synced++;
      } else if (donor.lastDonationDate) {
        donor.lastDonationDate = null;
        await donor.save();
        synced++;
      }
    }
    
    console.log(`✅ Synced ${synced} donors\n`);

    // Step 7: Final verification
    console.log('🔍 Step 7: Final verification...\n');
    
    const hospital1Units = await BloodUnit.countDocuments({ 
      currentHospitalID: hospital1._id,
      status: 'Stored'
    });
    
    const hospital2Units = await BloodUnit.countDocuments({ 
      currentHospitalID: hospital2._id,
      status: 'Stored'
    });

    console.log(`   Hospital 1 (Mumbai): ${hospital1Units} units`);
    console.log(`   Hospital 2 (Delhi): ${hospital2Units} units\n`);

    // Verify sample donors are eligible
    console.log('   Sample Donor Eligibility:');
    for (const email of ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com']) {
      const donor = await User.findOne({ email });
      const eligibility = donor.checkEligibility();
      console.log(`      ${donor.name}: ${eligibility}`);
    }

    console.log('\n🎉 DEMO SETUP COMPLETE!');
    console.log('======================');
    console.log('✅ Sample donors 1, 2, 3 are ELIGIBLE for donation');
    console.log('✅ No blood units from sample donors 1, 2, 3');
    console.log('✅ Realistic inventory from other donors');
    console.log('✅ All donor eligibility synced');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupDemoWithEligibleDonors();
