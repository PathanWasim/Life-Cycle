const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
require('dotenv').config();

async function checkCurrentInventory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get demo hospitals
    const hospitals = await User.find({ 
      role: 'Hospital',
      email: { $in: ['sample.hospital1@example.com', 'sample.hospital2@example.com'] }
    });

    console.log('\n=== CURRENT BLOOD INVENTORY ===');
    
    for (const hospital of hospitals) {
      console.log(`\n🏥 ${hospital.hospitalName} (${hospital.email})`);
      console.log(`   Location: ${hospital.city}, ${hospital.pincode}`);
      
      // Get blood units for this hospital
      const bloodUnits = await BloodUnit.find({ 
        currentHospitalID: hospital._id,
        status: { $in: ['Collected', 'Stored'] }
      }).populate('donorID', 'name bloodGroup');
      
      console.log(`   Total Units: ${bloodUnits.length}`);
      
      if (bloodUnits.length > 0) {
        // Group by blood group
        const groupedUnits = {};
        bloodUnits.forEach(unit => {
          if (!groupedUnits[unit.bloodGroup]) {
            groupedUnits[unit.bloodGroup] = [];
          }
          groupedUnits[unit.bloodGroup].push(unit);
        });
        
        // Display by blood group
        Object.keys(groupedUnits).sort().forEach(bloodGroup => {
          const units = groupedUnits[bloodGroup];
          console.log(`   ${bloodGroup}: ${units.length} units`);
          units.forEach(unit => {
            const daysUntilExpiry = unit.daysUntilExpiry();
            console.log(`     - ${unit.bloodUnitID} (expires in ${daysUntilExpiry} days)`);
          });
        });
      } else {
        console.log('   No blood units found');
      }
    }

    // Overall summary
    const totalUnits = await BloodUnit.countDocuments({ 
      status: { $in: ['Collected', 'Stored'] }
    });
    
    console.log(`\n=== OVERALL SUMMARY ===`);
    console.log(`Total Active Blood Units: ${totalUnits}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkCurrentInventory();