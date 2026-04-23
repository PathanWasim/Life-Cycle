require('dotenv').config();
const mongoose = require('mongoose');

async function checkTransferIssue() {
  try {
    console.log('🔍 CHECKING TRANSFER ISSUE...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');
    const BloodUnit = require('./models/BloodUnit');

    // Get Hospital 1 and Hospital 2
    const hospital1 = await User.findOne({ email: 'sample.hospital1@example.com' });
    const hospital2 = await User.findOne({ email: 'sample.hospital2@example.com' });

    if (!hospital1 || !hospital2) {
      console.log('❌ Hospitals not found!');
      process.exit(1);
    }

    console.log('🏥 HOSPITAL 1 (City General Hospital)');
    console.log(`   ID: ${hospital1._id}`);
    console.log(`   Name: ${hospital1.hospitalName}`);
    console.log(`   City: ${hospital1.city}`);
    console.log();

    console.log('🏥 HOSPITAL 2 (Metro Medical Center)');
    console.log(`   ID: ${hospital2._id}`);
    console.log(`   Name: ${hospital2.hospitalName}`);
    console.log(`   City: ${hospital2.city}`);
    console.log();

    // Check blood units for Hospital 1
    const hospital1Units = await BloodUnit.find({
      currentHospitalID: hospital1._id,
      status: { $ne: 'Used' }
    });

    console.log('📦 HOSPITAL 1 INVENTORY:');
    console.log(`   Total Units: ${hospital1Units.length}`);
    hospital1Units.forEach(unit => {
      console.log(`   - ${unit.bloodUnitID}: ${unit.bloodGroup} (${unit.status})`);
    });
    console.log();

    // Check blood units for Hospital 2
    const hospital2Units = await BloodUnit.find({
      currentHospitalID: hospital2._id,
      status: { $ne: 'Used' }
    });

    console.log('📦 HOSPITAL 2 INVENTORY:');
    console.log(`   Total Units: ${hospital2Units.length}`);
    hospital2Units.forEach(unit => {
      console.log(`   - ${unit.bloodUnitID}: ${unit.bloodGroup} (${unit.status})`);
    });
    console.log();

    // Check transferred units
    const transferredUnits = await BloodUnit.find({
      status: 'Transferred'
    }).populate('currentHospitalID', 'hospitalName');

    console.log('🔄 ALL TRANSFERRED UNITS:');
    console.log(`   Total: ${transferredUnits.length}`);
    transferredUnits.forEach(unit => {
      console.log(`   - ${unit.bloodUnitID}: ${unit.bloodGroup}`);
      console.log(`     Current Hospital: ${unit.currentHospitalID?.hospitalName || 'Unknown'} (${unit.currentHospitalID?._id})`);
      if (unit.transferHistory.length > 0) {
        const lastTransfer = unit.transferHistory[unit.transferHistory.length - 1];
        console.log(`     Last Transfer: ${lastTransfer.transferDate}`);
      }
    });
    console.log();

    // Check if any units were transferred TO Hospital 2
    const unitsTransferredToHospital2 = await BloodUnit.find({
      'transferHistory.toHospitalID': hospital2._id
    });

    console.log('📥 UNITS TRANSFERRED TO HOSPITAL 2:');
    console.log(`   Total: ${unitsTransferredToHospital2.length}`);
    unitsTransferredToHospital2.forEach(unit => {
      console.log(`   - ${unit.bloodUnitID}: ${unit.bloodGroup} (Status: ${unit.status})`);
      console.log(`     Current Hospital ID: ${unit.currentHospitalID}`);
      console.log(`     Should be Hospital 2 ID: ${hospital2._id}`);
      console.log(`     Match: ${unit.currentHospitalID.toString() === hospital2._id.toString() ? '✅' : '❌'}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Diagnostic complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTransferIssue();
