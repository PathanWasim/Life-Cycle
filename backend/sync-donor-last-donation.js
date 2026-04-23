require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');

async function syncDonorLastDonation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('🔄 Syncing donor lastDonationDate with blood units...\n');
    
    // Get all donors
    const donors = await User.find({ role: 'Donor' });
    
    let updated = 0;
    let skipped = 0;
    
    for (const donor of donors) {
      // Find the most recent blood unit for this donor
      const latestUnit = await BloodUnit.findOne({ 
        donorID: donor._id 
      }).sort({ collectionDate: -1 });
      
      if (latestUnit) {
        const unitDate = latestUnit.collectionDate;
        const currentDate = donor.lastDonationDate;
        
        // Check if we need to update
        if (!currentDate || unitDate.getTime() !== currentDate.getTime()) {
          console.log(`👤 ${donor.name} (${donor.email})`);
          console.log(`   Current lastDonationDate: ${currentDate ? currentDate.toLocaleDateString() : 'null'}`);
          console.log(`   Latest blood unit date: ${unitDate.toLocaleDateString()}`);
          
          // Update the donor's lastDonationDate
          donor.lastDonationDate = unitDate;
          await donor.save();
          
          // Check new eligibility
          const eligibility = donor.checkEligibility();
          console.log(`   ✅ Updated! New eligibility: ${eligibility}\n`);
          updated++;
        } else {
          skipped++;
        }
      } else {
        // No blood units for this donor
        if (donor.lastDonationDate) {
          console.log(`👤 ${donor.name} (${donor.email})`);
          console.log(`   Has lastDonationDate but no blood units`);
          console.log(`   🔧 Clearing lastDonationDate`);
          
          donor.lastDonationDate = null;
          await donor.save();
          
          console.log(`   ✅ Cleared! Now eligible\n`);
          updated++;
        } else {
          skipped++;
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated} donors`);
    console.log(`   Skipped: ${skipped} donors (already in sync)`);
    console.log(`   Total: ${donors.length} donors`);
    
    console.log('\n✅ Sync complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

syncDonorLastDonation();
