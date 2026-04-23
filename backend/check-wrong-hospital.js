require('dotenv').config();
const mongoose = require('mongoose');

async function checkWrongHospital() {
  try {
    console.log('🔍 CHECKING WRONG HOSPITAL ID...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');

    // Find the hospital with the wrong ID
    const wrongHospitalID = '69b185ca96881832c3948c29';
    const wrongHospital = await User.findById(wrongHospitalID);

    if (!wrongHospital) {
      console.log(`❌ Hospital with ID ${wrongHospitalID} NOT FOUND!`);
      console.log('   This is a MAJOR BUG - unit was transferred to non-existent hospital!');
    } else {
      console.log('🏥 WRONG HOSPITAL DETAILS:');
      console.log(`   ID: ${wrongHospital._id}`);
      console.log(`   Name: ${wrongHospital.hospitalName}`);
      console.log(`   Email: ${wrongHospital.email}`);
      console.log(`   Role: ${wrongHospital.role}`);
      console.log(`   Verified: ${wrongHospital.isVerified}`);
    }
    console.log();

    // Get all hospitals
    const allHospitals = await User.find({ role: 'Hospital' });
    console.log('📋 ALL HOSPITALS IN DATABASE:');
    allHospitals.forEach((h, index) => {
      console.log(`   ${index + 1}. ${h.hospitalName}`);
      console.log(`      ID: ${h._id}`);
      console.log(`      Email: ${h.email}`);
      console.log(`      Verified: ${h.isVerified}`);
      console.log();
    });

    await mongoose.connection.close();
    console.log('✅ Check complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkWrongHospital();
