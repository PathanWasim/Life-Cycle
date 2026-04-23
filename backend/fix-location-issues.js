const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixLocationIssues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define proper locations for demo users
    const locationUpdates = [
      // Donors
      {
        email: 'sample.donor1@example.com',
        city: 'Mumbai',
        pincode: '400001'
      },
      {
        email: 'sample.donor2@example.com', 
        city: 'Delhi',
        pincode: '110001'
      },
      {
        email: 'sample.donor3@example.com',
        city: 'Bangalore', 
        pincode: '560001'
      },
      // Hospitals
      {
        email: 'sample.hospital1@example.com',
        city: 'Mumbai',
        pincode: '400001'
      },
      {
        email: 'sample.hospital2@example.com',
        city: 'Delhi', 
        pincode: '110001'
      }
    ];

    console.log('\n=== FIXING LOCATION DATA ===');
    
    let updatedCount = 0;
    
    for (const update of locationUpdates) {
      const user = await User.findOne({ email: update.email });
      
      if (user) {
        let needsUpdate = false;
        
        if (!user.city || user.city !== update.city) {
          user.city = update.city;
          needsUpdate = true;
        }
        
        if (!user.pincode || user.pincode !== update.pincode) {
          user.pincode = update.pincode;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await user.save();
          updatedCount++;
          console.log(`✓ Updated ${user.role}: ${user.email}`);
          console.log(`  City: ${user.city}, Pincode: ${user.pincode}`);
        } else {
          console.log(`✓ Already correct: ${user.email}`);
        }
      } else {
        console.log(`⚠️  User not found: ${update.email}`);
      }
    }

    // Check for any users with missing location data
    console.log('\n=== CHECKING FOR MISSING LOCATIONS ===');
    
    const usersWithMissingCity = await User.find({
      role: { $in: ['Donor', 'Hospital'] },
      $or: [
        { city: { $exists: false } },
        { city: null },
        { city: '' }
      ]
    });
    
    const usersWithMissingPincode = await User.find({
      role: { $in: ['Donor', 'Hospital'] },
      $or: [
        { pincode: { $exists: false } },
        { pincode: null },
        { pincode: '' }
      ]
    });

    if (usersWithMissingCity.length > 0) {
      console.log('\n⚠️  Users with missing city:');
      usersWithMissingCity.forEach(user => {
        console.log(`   - ${user.role}: ${user.email}`);
      });
    }
    
    if (usersWithMissingPincode.length > 0) {
      console.log('\n⚠️  Users with missing pincode:');
      usersWithMissingPincode.forEach(user => {
        console.log(`   - ${user.role}: ${user.email}`);
      });
    }

    if (usersWithMissingCity.length === 0 && usersWithMissingPincode.length === 0) {
      console.log('✅ All users have complete location data');
    }

    console.log(`\n✅ SUMMARY: Updated ${updatedCount} users`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixLocationIssues();