require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkDonorLocations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const donors = await User.find({
      email: {
        $in: [
          'sample.donor1@example.com',
          'sample.donor2@example.com',
          'sample.donor3@example.com'
        ]
      }
    }).select('email name bloodGroup city pincode');
    
    console.log('📋 Demo Donor Locations:\n');
    donors.forEach(donor => {
      console.log(`${donor.name} (${donor.email})`);
      console.log(`  Blood Group: ${donor.bloodGroup}`);
      console.log(`  City: ${donor.city || 'MISSING'}`);
      console.log(`  Pincode: ${donor.pincode || 'MISSING'}`);
      console.log('');
    });
    
    const missingLocation = donors.filter(d => !d.city || !d.pincode);
    if (missingLocation.length > 0) {
      console.log(`⚠️  ${missingLocation.length} donor(s) missing location data!`);
    } else {
      console.log('✅ All donors have location data');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDonorLocations();
