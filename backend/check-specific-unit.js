require('dotenv').config();
const mongoose = require('mongoose');

async function checkUnit() {
  try {
    console.log('🔍 CHECKING SPECIFIC BLOOD UNIT...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');
    const BloodUnit = require('./models/BloodUnit');

    // Get hospitals
    const hospital1 = await User.findOne({ email: 'sample.hospital1@example.com' });
    const hospital2 = await User.findOne({ email: 'sample.hospital2@example.com' });

    console.log('🏥 HOSPITALS:');
    console.log(`   Hospital 1: ${hospital1.hospitalName} (${hospital1._id})`);
    console.log(`   Hospital 2: ${hospital2.hospitalName} (${hospital2._id})`);
    console.log();

    // Find the specific blood unit
    const bloodUnitID = 'BU-1773254525408-c30533a8';
    const unit = await BloodUnit.findOne({ bloodUnitID })
      .populate('donorID', 'name email bloodGroup')
      .populate('currentHospitalID', 'hospitalName')
      .populate('originalHospitalID', 'hospitalName');

    if (!unit) {
      console.log(`❌ Blood unit ${bloodUnitID} NOT FOUND in database!`);
      process.exit(1);
    }

    console.log('📦 BLOOD UNIT DETAILS:');
    console.log(`   Blood Unit ID: ${unit.bloodUnitID}`);
    console.log(`   Blood Group: ${unit.bloodGroup}`);
    console.log(`   Status: ${unit.status}`);
    console.log(`   Donor: ${unit.donorID?.name} (${unit.donorID?.email})`);
    console.log(`   Original Hospital: ${unit.originalHospitalID?.hospitalName}`);
    console.log(`   Current Hospital: ${unit.currentHospitalID?.hospitalName}`);
    console.log(`   Current Hospital ID: ${unit.currentHospitalID?._id}`);
    console.log(`   Collection Date: ${unit.collectionDate}`);
    console.log(`   Expiry Date: ${unit.expiryDate}`);
    console.log(`   Days Until Expiry: ${unit.daysUntilExpiry()}`);
    console.log(`   Is Expired: ${unit.isExpired()}`);
    console.log();

    console.log('🔄 TRANSFER HISTORY:');
    if (unit.transferHistory.length === 0) {
      console.log('   No transfers recorded');
    } else {
      unit.transferHistory.forEach((transfer, index) => {
        console.log(`   Transfer ${index + 1}:`);
        console.log(`     From: ${transfer.fromHospitalID}`);
        console.log(`     To: ${transfer.toHospitalID}`);
        console.log(`     Date: ${transfer.transferDate}`);
        console.log(`     Transferred By: ${transfer.transferredBy}`);
      });
    }
    console.log();

    // Check if it belongs to Hospital 2
    const belongsToH2 = unit.currentHospitalID._id.toString() === hospital2._id.toString();
    console.log('🎯 OWNERSHIP CHECK:');
    console.log(`   Belongs to Hospital 2: ${belongsToH2 ? '✅ YES' : '❌ NO'}`);
    console.log(`   Current Hospital ID: ${unit.currentHospitalID._id.toString()}`);
    console.log(`   Hospital 2 ID: ${hospital2._id.toString()}`);
    console.log(`   Match: ${belongsToH2}`);
    console.log();

    // Query Hospital 2's inventory (same as API)
    const h2Inventory = await BloodUnit.find({
      currentHospitalID: hospital2._id,
      status: { $ne: 'Used' }
    });

    console.log('📋 HOSPITAL 2 INVENTORY QUERY RESULT:');
    console.log(`   Total units: ${h2Inventory.length}`);
    const unitInInventory = h2Inventory.find(u => u.bloodUnitID === bloodUnitID);
    console.log(`   Contains ${bloodUnitID}: ${unitInInventory ? '✅ YES' : '❌ NO'}`);
    console.log();

    if (!unitInInventory) {
      console.log('❌ PROBLEM IDENTIFIED:');
      console.log('   The blood unit is NOT in Hospital 2\'s inventory query result');
      console.log('   This means the transfer did not update currentHospitalID correctly');
      console.log();
      console.log('🔧 POSSIBLE CAUSES:');
      console.log('   1. Transfer endpoint did not save the unit after updating');
      console.log('   2. currentHospitalID was not updated');
      console.log('   3. Status was set to "Used" instead of "Transferred"');
    } else {
      console.log('✅ UNIT IS IN HOSPITAL 2 INVENTORY');
      console.log('   The backend query returns it correctly');
      console.log('   Frontend should display it');
    }

    await mongoose.connection.close();
    console.log('\n✅ Check complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkUnit();
