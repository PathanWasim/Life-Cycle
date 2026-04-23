require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkHospitalLocations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const hospitals = await User.find({
      role: 'Hospital',
      isVerified: true
    }).select('email hospitalName city pincode');
    
    console.log('📋 Verified Hospital Locations:\n');
    hospitals.forEach(hospital => {
      console.log(`${hospital.hospitalName} (${hospital.email})`);
      console.log(`  City: ${hospital.city || 'MISSING'}`);
      console.log(`  Pincode: ${hospital.pincode || 'MISSING'}`);
      console.log('');
    });
    
    const missingLocation = hospitals.filter(h => !h.city || !h.pincode);
    if (missingLocation.length > 0) {
      console.log(`⚠️  ${missingLocation.length} hospital(s) missing location data!`);
    } else {
      console.log('✅ All hospitals have location data');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkHospitalLocations();
