require('dotenv').config();
const mongoose = require('mongoose');

async function testTransfer() {
  try {
    console.log('🔄 TESTING TRANSFER NOW...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');
    const BloodUnit = require('./models/BloodUnit');

    // Get hospitals
    const hospital1 = await User.findOne({ email: 'sample.hospital1@example.com' });
    const hospital2 = await User.findOne({ email: 'sample.hospital2@example.com' });

    console.log('🏥 HOSPITAL 1:', hospital1.hospitalName, `(${hospital1._id})`);
    console.log('🏥 HOSPITAL 2:', hospital2.hospitalName, `(${hospital2._id})`);
    console.log();

    // Find a blood unit owned by Hospital 1
    const bloodUnit = await BloodUnit.findOne({
      currentHospitalID: hospital1._id,
      status: { $in: ['Collected', 'Stored'] }
    });

    if (!bloodUnit) {
      console.log('❌ No blood units available for transfer in Hospital 1');
      console.log('   Create a new donation first!');
      await mongoose.connection.close();
      return;
    }

    console.log('📦 BLOOD UNIT TO TRANSFER:');
    console.log(`   ID: ${bloodUnit.bloodUnitID}`);
    console.log(`   Blood Group: ${bloodUnit.bloodGroup}`);
    console.log(`   Current Hospital: ${bloodUnit.currentHospitalID}`);
    console.log(`   Status: ${bloodUnit.status}`);
    console.log();

    // Perform transfer
    console.log('🔄 TRANSFERRING...\n');

    const transferDate = new Date();
    bloodUnit.currentHospitalID = hospital2._id;
    bloodUnit.status = 'Transferred';
    
    bloodUnit.transferHistory.push({
      fromHospitalID: hospital1._id,
      toHospitalID: hospital2._id,
      transferDate: transferDate,
      transferredBy: hospital1._id
    });

    await bloodUnit.save();

    console.log('✅ TRANSFER COMPLETE!\n');

    // Verify the transfer
    const updatedUnit = await BloodUnit.findOne({ bloodUnitID: bloodUnit.bloodUnitID });

    console.log('📦 UPDATED BLOOD UNIT:');
    console.log(`   ID: ${updatedUnit.bloodUnitID}`);
    console.log(`   Blood Group: ${updatedUnit.bloodGroup}`);
    console.log(`   Current Hospital: ${updatedUnit.currentHospitalID}`);
    console.log(`   Status: ${updatedUnit.status}`);
    console.log(`   Transfer History: ${updatedUnit.transferHistory.length} entries`);
    console.log();

    // Check if it appears in Hospital 2's inventory
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

    // Check if it's gone from Hospital 1's inventory
    const hospital1Units = await BloodUnit.find({
      currentHospitalID: hospital1._id,
      status: { $ne: 'Used' }
    });

    console.log('📦 HOSPITAL 1 INVENTORY:');
    console.log(`   Total Units: ${hospital1Units.length}`);
    hospital1Units.forEach(unit => {
      console.log(`   - ${unit.bloodUnitID}: ${unit.bloodGroup} (${unit.status})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Test complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testTransfer();
