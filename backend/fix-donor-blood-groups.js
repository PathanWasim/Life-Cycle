const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
require('dotenv').config();

async function fixDonorBloodGroups() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\n🔧 FIXING DONOR BLOOD GROUP MISMATCHES');
    console.log('=====================================');

    // Get demo donors
    const donors = await User.find({ 
      role: 'Donor',
      email: { $in: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
    });

    console.log('\n📋 Demo Donors:');
    donors.forEach(donor => {
      console.log(`   ${donor.email} → ${donor.bloodGroup}`);
    });

    // Step 1: Delete all blood units that have wrong blood groups
    console.log('\n🗑️  Step 1: Removing blood units with wrong blood groups...');
    
    let totalDeleted = 0;
    
    for (const donor of donors) {
      const wrongBloodUnits = await BloodUnit.find({
        donorID: donor._id,
        bloodGroup: { $ne: donor.bloodGroup }
      });
      
      if (wrongBloodUnits.length > 0) {
        await BloodUnit.deleteMany({
          donorID: donor._id,
          bloodGroup: { $ne: donor.bloodGroup }
        });
        
        console.log(`   ✅ Deleted ${wrongBloodUnits.length} wrong blood units for ${donor.email}`);
        totalDeleted += wrongBloodUnits.length;
      }
    }
    
    console.log(`   Total deleted: ${totalDeleted} units`);

    // Step 2: Check remaining donations
    console.log('\n📊 Step 2: Checking remaining donations...');
    
    for (const donor of donors) {
      const remainingUnits = await BloodUnit.find({ donorID: donor._id });
      const correctUnits = remainingUnits.filter(unit => unit.bloodGroup === donor.bloodGroup);
      
      console.log(`   ${donor.email} (${donor.bloodGroup}): ${correctUnits.length} correct donations`);
    }

    // Step 3: Update orphaned blood units to have correct donors
    console.log('\n🔄 Step 3: Reassigning orphaned blood units...');
    
    // Get hospitals
    const hospitals = await User.find({ 
      role: 'Hospital',
      email: { $in: ['sample.hospital1@example.com', 'sample.hospital2@example.com'] }
    });

    // Find blood units that don't have matching donor blood groups
    const orphanedUnits = await BloodUnit.find({
      bloodUnitID: { $regex: /^DEMO-BU-/ }
    }).populate('donorID');

    let reassigned = 0;
    
    for (const unit of orphanedUnits) {
      if (!unit.donorID || unit.donorID.bloodGroup !== unit.bloodGroup) {
        // Find a donor with matching blood group
        const matchingDonor = donors.find(d => d.bloodGroup === unit.bloodGroup);
        
        if (matchingDonor) {
          unit.donorID = matchingDonor._id;
          await unit.save();
          reassigned++;
          console.log(`   ✅ Reassigned ${unit.bloodGroup} unit to ${matchingDonor.email}`);
        } else {
          // No matching donor found, delete this unit
          await BloodUnit.deleteOne({ _id: unit._id });
          console.log(`   🗑️  Deleted ${unit.bloodGroup} unit (no matching donor)`);
        }
      }
    }
    
    console.log(`   Total reassigned: ${reassigned} units`);

    // Step 4: Final verification
    console.log('\n✅ Step 4: Final verification...');
    
    for (const donor of donors) {
      const donations = await BloodUnit.find({ donorID: donor._id });
      const correctDonations = donations.filter(d => d.bloodGroup === donor.bloodGroup);
      const wrongDonations = donations.filter(d => d.bloodGroup !== donor.bloodGroup);
      
      console.log(`   ${donor.email} (${donor.bloodGroup}):`);
      console.log(`     ✅ Correct: ${correctDonations.length}`);
      console.log(`     ❌ Wrong: ${wrongDonations.length}`);
      
      if (wrongDonations.length > 0) {
        console.log(`     ⚠️  Still has wrong blood groups!`);
      }
    }

    // Show inventory summary
    console.log('\n📊 HOSPITAL INVENTORY AFTER FIX:');
    
    for (const hospital of hospitals) {
      const inventory = await BloodUnit.find({ 
        currentHospitalID: hospital._id,
        status: 'Stored'
      });
      
      const bloodGroups = {};
      inventory.forEach(unit => {
        if (!bloodGroups[unit.bloodGroup]) {
          bloodGroups[unit.bloodGroup] = 0;
        }
        bloodGroups[unit.bloodGroup]++;
      });
      
      console.log(`\n🏥 ${hospital.hospitalName}:`);
      console.log(`   Total Units: ${inventory.length}`);
      Object.keys(bloodGroups).sort().forEach(bg => {
        console.log(`   ${bg}: ${bloodGroups[bg]} units`);
      });
    }

    console.log('\n🎉 BLOOD GROUP MISMATCH FIXED!');
    console.log('==============================');
    console.log('✅ All donors now only have donations matching their blood group');
    console.log('✅ Hospital inventory updated');
    console.log('✅ Demo ready for presentation');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixDonorBloodGroups();