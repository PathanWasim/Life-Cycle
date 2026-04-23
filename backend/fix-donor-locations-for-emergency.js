require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixDonorLocations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('📍 Updating donor locations to Mumbai for emergency request testing...\n');
    
    // Update all 3 demo donors to Mumbai location
    const updates = [
      {
        email: 'sample.donor1@example.com',
        city: 'Mumbai',
        pincode: '400001'
      },
      {
        email: 'sample.donor2@example.com',
        city: 'Mumbai',
        pincode: '400001'
      },
      {
        email: 'sample.donor3@example.com',
        city: 'Mumbai',
        pincode: '400001'
      }
    ];
    
    for (const update of updates) {
      const result = await User.updateOne(
        { email: update.email },
        { 
          $set: { 
            city: update.city,
            pincode: update.pincode
          }
        }
      );
      
      const donor = await User.findOne({ email: update.email }).select('name bloodGroup city pincode');
      console.log(`✅ ${donor.name} (${donor.bloodGroup})`);
      console.log(`   Location: ${donor.city}, ${donor.pincode}`);
    }
    
    console.log('\n✅ All demo donors now in Mumbai!');
    console.log('\n📋 Emergency Request Testing:');
    console.log('   - Request B+ → Will notify Donor 2 (kingmaker0633@gmail.com)');
    console.log('   - Request B- → Will notify Donor 3 (userns3106@gmail.com)');
    console.log('   - Request A- → Will notify Donor 1 (ns7499244144@gmail.com)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDonorLocations();
