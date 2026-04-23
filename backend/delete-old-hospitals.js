require('dotenv').config();
const mongoose = require('mongoose');

async function deleteOldHospitals() {
  try {
    console.log('🗑️  DELETING OLD DUPLICATE HOSPITALS...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');
    const BloodUnit = require('./models/BloodUnit');

    // Find old hospitals (the ones with @example.com emails, not sample.*)
    const oldHospitals = await User.find({
      role: 'Hospital',
      email: { $regex: '^hospital[0-9]+@example\\.com$' }
    });

    console.log('🏥 OLD HOSPITALS TO DELETE:');
    oldHospitals.forEach((h, index) => {
      console.log(`   ${index + 1}. ${h.hospitalName} (${h.email}) - ID: ${h._id}`);
    });
    console.log();

    if (oldHospitals.length === 0) {
      console.log('✅ No old hospitals to delete');
      await mongoose.connection.close();
      return;
    }

    // Check if any blood units belong to these hospitals
    const oldHospitalIDs = oldHospitals.map(h => h._id);
    const unitsCount = await BloodUnit.countDocuments({
      currentHospitalID: { $in: oldHospitalIDs }
    });

    console.log(`📦 Blood units belonging to old hospitals: ${unitsCount}`);
    console.log();

    if (unitsCount > 0) {
      console.log('⚠️  WARNING: Some blood units belong to old hospitals');
      console.log('   These units will need to be reassigned or deleted');
      console.log();
      
      // Show which units
      const units = await BloodUnit.find({
        currentHospitalID: { $in: oldHospitalIDs }
      }).populate('currentHospitalID', 'hospitalName email');

      console.log('📋 AFFECTED BLOOD UNITS:');
      units.forEach(unit => {
        console.log(`   - ${unit.bloodUnitID}: ${unit.bloodGroup} (${unit.status})`);
        console.log(`     Current Hospital: ${unit.currentHospitalID.hospitalName} (${unit.currentHospitalID.email})`);
      });
      console.log();
    }

    // Delete old hospitals
    const result = await User.deleteMany({
      role: 'Hospital',
      email: { $regex: '^hospital[0-9]+@example\\.com$' }
    });

    console.log(`✅ DELETED: ${result.deletedCount} old hospitals`);
    console.log();

    // Verify remaining hospitals
    const remainingHospitals = await User.find({ role: 'Hospital' });
    console.log('🏥 REMAINING HOSPITALS:');
    remainingHospitals.forEach((h, index) => {
      console.log(`   ${index + 1}. ${h.hospitalName} (${h.email})`);
    });
    console.log();

    console.log('🎯 NEXT STEPS:');
    console.log('   1. Refresh the frontend (hard refresh: Ctrl+Shift+R)');
    console.log('   2. Login as Hospital 1 (sample.hospital1@example.com)');
    console.log('   3. Go to Transfer Blood tab');
    console.log('   4. You should now see only ONE "Metro Medical Center" in dropdown');
    console.log('   5. Transfer a blood unit to Metro Medical Center');
    console.log('   6. Login as Hospital 2 (sample.hospital2@example.com)');
    console.log('   7. You should see the transferred unit!');

    await mongoose.connection.close();
    console.log('\n✅ Cleanup complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

deleteOldHospitals();
