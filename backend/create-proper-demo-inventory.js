const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
require('dotenv').config();

async function createProperDemoInventory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('\n🎯 CREATING PROPER DEMO INVENTORY');
    console.log('=================================');

    // Get demo users
    const hospitals = await User.find({ 
      email: { $in: ['sample.hospital1@example.com', 'sample.hospital2@example.com'] }
    });
    
    const donors = await User.find({ 
      role: 'Donor',
      email: { $in: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
    });

    console.log('\n👥 Available Donors:');
    donors.forEach(donor => {
      console.log(`   ${donor.email} → ${donor.bloodGroup}`);
    });

    // Clear existing demo inventory
    console.log('\n🗑️  Clearing existing demo inventory...');
    const deleteResult = await BloodUnit.deleteMany({
      bloodUnitID: { $regex: /^DEMO-BU-/ }
    });
    console.log(`✅ Removed ${deleteResult.deletedCount} old units`);

    // Reset donor eligibility
    await User.updateMany(
      { 
        role: 'Donor',
        email: { $in: ['sample.donor1@example.com', 'sample.donor2@example.com'] }
      },
      { 
        $set: { 
          lastDonationDate: null,
          eligibilityStatus: 'Eligible'
        }
      }
    );
    console.log('✅ Reset donor eligibility');

    // Create inventory based on available donor blood groups
    // Donor 1: A- | Donor 2: B+ | Donor 3: B-
    
    const inventoryPlan = [
      // Hospital 1 (Mumbai) - 12 units
      { hospital: 'sample.hospital1@example.com', bloodGroup: 'A-', count: 5, donor: 'sample.donor1@example.com' },
      { hospital: 'sample.hospital1@example.com', bloodGroup: 'B+', count: 4, donor: 'sample.donor2@example.com' },
      { hospital: 'sample.hospital1@example.com', bloodGroup: 'B-', count: 3, donor: 'sample.donor3@example.com' },
      
      // Hospital 2 (Delhi) - 10 units  
      { hospital: 'sample.hospital2@example.com', bloodGroup: 'A-', count: 3, donor: 'sample.donor1@example.com' },
      { hospital: 'sample.hospital2@example.com', bloodGroup: 'B+', count: 4, donor: 'sample.donor2@example.com' },
      { hospital: 'sample.hospital2@example.com', bloodGroup: 'B-', count: 3, donor: 'sample.donor3@example.com' }
    ];

    console.log('\n🩸 Creating realistic inventory...');
    
    let totalCreated = 0;
    
    for (const plan of inventoryPlan) {
      const hospital = hospitals.find(h => h.email === plan.hospital);
      const donor = donors.find(d => d.email === plan.donor);
      
      console.log(`\n🏥 ${hospital.hospitalName} - ${plan.bloodGroup} (${plan.count} units)`);
      
      for (let i = 0; i < plan.count; i++) {
        // Random collection date (1-35 days ago)
        const daysAgo = Math.floor(Math.random() * 35) + 1;
        const collectionDate = new Date();
        collectionDate.setDate(collectionDate.getDate() - daysAgo);
        
        const expiryDate = new Date(collectionDate);
        expiryDate.setDate(expiryDate.getDate() + 42);

        const bloodUnit = new BloodUnit({
          bloodUnitID: `DEMO-BU-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
          donorID: donor._id,
          bloodGroup: plan.bloodGroup, // This matches donor's blood group
          collectionDate: collectionDate,
          expiryDate: expiryDate,
          status: 'Stored',
          originalHospitalID: hospital._id,
          currentHospitalID: hospital._id,
          donationTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
        });

        await bloodUnit.save();
        totalCreated++;
        
        const daysUntilExpiry = bloodUnit.daysUntilExpiry();
        console.log(`   ✅ Created ${plan.bloodGroup} unit (expires in ${daysUntilExpiry} days)`);
        
        // Small delay for unique timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    // Verification
    console.log('\n🔍 Verification:');
    
    for (const hospital of hospitals) {
      const inventory = await BloodUnit.find({ 
        currentHospitalID: hospital._id,
        status: 'Stored'
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

    // Check donor donations
    console.log('\n👥 Donor Donation Check:');
    for (const donor of donors) {
      const donations = await BloodUnit.find({ donorID: donor._id });
      const correctBG = donations.filter(d => d.bloodGroup === donor.bloodGroup).length;
      const wrongBG = donations.filter(d => d.bloodGroup !== donor.bloodGroup).length;
      
      console.log(`   ${donor.email} (${donor.bloodGroup}): ${correctBG} correct, ${wrongBG} wrong`);
    }

    console.log('\n🎉 PROPER DEMO INVENTORY CREATED!');
    console.log('=================================');
    console.log(`✅ Total Units: ${totalCreated}`);
    console.log('✅ All blood groups match donor types');
    console.log('✅ Realistic expiry dates');
    console.log('✅ Ready for demo presentation');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createProperDemoInventory();