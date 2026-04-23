require('dotenv').config();
const mongoose = require('mongoose');

async function checkErrors() {
  try {
    console.log('🔍 CHECKING CURRENT ERRORS...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');
    const BloodUnit = require('./models/BloodUnit');

    // Check if hospital exists
    const hospital = await User.findOne({ 
      email: 'sample.hospital1@example.com',
      role: 'Hospital' 
    });

    if (!hospital) {
      console.log('❌ Hospital not found!');
      process.exit(1);
    }

    console.log('✅ Hospital found:', hospital.name);
    console.log('   Hospital ID:', hospital._id);
    console.log('   Verified:', hospital.isVerified);
    console.log('   City:', hospital.city);
    console.log('   Pincode:', hospital.pincode);
    console.log();

    // Check blood units for this hospital
    const bloodUnits = await BloodUnit.find({
      currentHospitalID: hospital._id
    });

    console.log('📦 Blood Units for this hospital:', bloodUnits.length);
    console.log();

    // Check transferred units
    const transferredUnits = await BloodUnit.find({
      status: 'Transferred'
    }).limit(5);

    console.log('🔄 Recently Transferred Units:', transferredUnits.length);
    transferredUnits.forEach(unit => {
      console.log(`   - ${unit.bloodUnitID}: ${unit.bloodGroup} (Current Hospital: ${unit.currentHospitalID})`);
    });
    console.log();

    // Check all hospitals
    const hospitals = await User.find({ 
      role: 'Hospital',
      isVerified: true 
    }).select('name email city');

    console.log('🏥 Verified Hospitals:', hospitals.length);
    hospitals.forEach(h => {
      console.log(`   - ${h.name} (${h.email}) - ${h.city}`);
    });
    console.log();

    // Check admin
    const admin = await User.findOne({ role: 'Admin' });
    console.log('👨‍💼 Admin exists:', admin ? 'Yes' : 'No');
    if (admin) {
      console.log('   Email:', admin.email);
    }

    await mongoose.connection.close();
    console.log('\n✅ Diagnostic complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkErrors();
