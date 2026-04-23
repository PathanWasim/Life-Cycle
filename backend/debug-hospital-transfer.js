require('dotenv').config();
const mongoose = require('mongoose');

async function debugTransfer() {
  try {
    console.log('🔍 DEBUGGING HOSPITAL TRANSFER...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');
    const BloodUnit = require('./models/BloodUnit');

    // Get Hospital 2 details
    const hospital2 = await User.findOne({ email: 'sample.hospital2@example.com' });
    
    if (!hospital2) {
      console.log('❌ Hospital 2 not found!');
      process.exit(1);
    }

    console.log('🏥 HOSPITAL 2 DETAILS:');
    console.log(`   Email: ${hospital2.email}`);
    console.log(`   Name: ${hospital2.hospitalName}`);
    console.log(`   ID: ${hospital2._id}`);
    console.log(`   ID Type: ${typeof hospital2._id}`);
    console.log(`   ID String: ${hospital2._id.toString()}`);
    console.log();

    // Query blood units for Hospital 2 using different methods
    console.log('📦 QUERYING HOSPITAL 2 INVENTORY...\n');

    // Method 1: Direct ID match
    const units1 = await BloodUnit.find({
      currentHospitalID: hospital2._id
    });
    console.log(`Method 1 (Direct ID): ${units1.length} units`);

    // Method 2: String ID match
    const units2 = await BloodUnit.find({
      currentHospitalID: hospital2._id.toString()
    });
    console.log(`Method 2 (String ID): ${units2.length} units`);

    // Method 3: With status filter (like the API)
    const units3 = await BloodUnit.find({
      currentHospitalID: hospital2._id,
      status: { $ne: 'Used' }
    });
    console.log(`Method 3 (With status filter): ${units3.length} units`);
    console.log();

    // Show all units for Hospital 2
    console.log('📦 ALL UNITS FOR HOSPITAL 2:');
    if (units3.length === 0) {
      console.log('   No units found!');
    } else {
      units3.forEach(unit => {
        console.log(`   - ${unit.bloodUnitID}: ${unit.bloodGroup} (${unit.status})`);
        console.log(`     Current Hospital ID: ${unit.currentHospitalID}`);
        console.log(`     Match: ${unit.currentHospitalID.toString() === hospital2._id.toString()}`);
      });
    }
    console.log();

    // Check all transferred units
    const allTransferred = await BloodUnit.find({
      status: 'Transferred'
    });

    console.log('🔄 ALL TRANSFERRED UNITS IN DATABASE:');
    console.log(`   Total: ${allTransferred.length}`);
    allTransferred.forEach(unit => {
      console.log(`   - ${unit.bloodUnitID}: ${unit.bloodGroup}`);
      console.log(`     Current Hospital ID: ${unit.currentHospitalID}`);
      console.log(`     Is Hospital 2: ${unit.currentHospitalID.toString() === hospital2._id.toString()}`);
      console.log(`     Transfer History: ${unit.transferHistory.length} entries`);
      if (unit.transferHistory.length > 0) {
        const last = unit.transferHistory[unit.transferHistory.length - 1];
        console.log(`     Last Transfer To: ${last.toHospitalID}`);
        console.log(`     Matches Hospital 2: ${last.toHospitalID.toString() === hospital2._id.toString()}`);
      }
    });

    await mongoose.connection.close();
    console.log('\n✅ Debug complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

debugTransfer();
