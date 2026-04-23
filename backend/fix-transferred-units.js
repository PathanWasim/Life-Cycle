require('dotenv').config();
const mongoose = require('mongoose');

async function fixTransferredUnits() {
  try {
    console.log('🔧 FIXING TRANSFERRED UNITS...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const BloodUnit = require('./models/BloodUnit');

    // Find all units with status "Transferred"
    const transferredUnits = await BloodUnit.find({
      status: 'Transferred'
    });

    console.log(`📦 Found ${transferredUnits.length} transferred units\n`);

    let fixed = 0;
    let alreadyCorrect = 0;

    for (const unit of transferredUnits) {
      if (unit.transferHistory.length === 0) {
        console.log(`⚠️  ${unit.bloodUnitID}: No transfer history, skipping`);
        continue;
      }

      // Get the last transfer
      const lastTransfer = unit.transferHistory[unit.transferHistory.length - 1];
      const destinationHospitalID = lastTransfer.toHospitalID;

      // Check if currentHospitalID matches the destination
      if (unit.currentHospitalID.toString() === destinationHospitalID.toString()) {
        console.log(`✅ ${unit.bloodUnitID}: Already correct (Hospital ID: ${destinationHospitalID})`);
        alreadyCorrect++;
      } else {
        console.log(`🔧 ${unit.bloodUnitID}: Fixing...`);
        console.log(`   Current: ${unit.currentHospitalID}`);
        console.log(`   Should be: ${destinationHospitalID}`);
        
        // Fix the currentHospitalID
        unit.currentHospitalID = destinationHospitalID;
        await unit.save();
        
        console.log(`   ✅ Fixed!`);
        fixed++;
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log(`   Total Transferred Units: ${transferredUnits.length}`);
    console.log(`   Already Correct: ${alreadyCorrect}`);
    console.log(`   Fixed: ${fixed}`);

    await mongoose.connection.close();
    console.log('\n✅ Fix complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixTransferredUnits();
