require('dotenv').config();
const mongoose = require('mongoose');

async function checkDropdown() {
  try {
    console.log('🔍 CHECKING HOSPITAL DROPDOWN DATA...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');

    // Get Hospital 1 (the one doing the transfer)
    const hospital1 = await User.findOne({ email: 'sample.hospital1@example.com' });
    
    console.log('🏥 LOGGED IN AS:');
    console.log(`   Hospital: ${hospital1.hospitalName}`);
    console.log(`   Email: ${hospital1.email}`);
    console.log(`   ID: ${hospital1._id}`);
    console.log();

    // Simulate the API call (same as backend/routes/hospital.js)
    const hospitals = await User.find({
      role: 'Hospital',
      isVerified: true,
      _id: { $ne: hospital1._id } // Exclude current hospital
    }).select('_id hospitalName city pincode email');

    console.log('📋 DROPDOWN OPTIONS (what frontend receives):');
    console.log(`   Total: ${hospitals.length} hospitals\n`);

    hospitals.forEach((h, index) => {
      console.log(`   ${index + 1}. ${h.hospitalName}`);
      console.log(`      ID: ${h._id}`);
      console.log(`      Email: ${h.email}`);
      console.log(`      City: ${h.city}`);
      console.log();
    });

    // Find duplicates
    const nameCount = {};
    hospitals.forEach(h => {
      nameCount[h.hospitalName] = (nameCount[h.hospitalName] || 0) + 1;
    });

    console.log('⚠️  DUPLICATE HOSPITAL NAMES:');
    Object.keys(nameCount).forEach(name => {
      if (nameCount[name] > 1) {
        console.log(`   ${name}: ${nameCount[name]} hospitals with same name`);
        const dupes = hospitals.filter(h => h.hospitalName === name);
        dupes.forEach(d => {
          console.log(`      - ${d.email} (${d._id})`);
        });
      }
    });

    await mongoose.connection.close();
    console.log('\n✅ Check complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkDropdown();
