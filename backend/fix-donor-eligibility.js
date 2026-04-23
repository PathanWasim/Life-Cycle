require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');

async function fixDonorEligibility() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('🔍 Checking donor eligibility issues...\n');
    
    // Get all donors
    const donors = await User.find({ role: 'Donor' });
    
    const today = new Date();
    console.log(`📅 Today's date: ${today.toLocaleDateString()}\n`);
    
    for (const donor of donors) {
      console.log(`👤 ${donor.name} (${donor.email})`);
      console.log(`   Blood Group: ${donor.bloodGroup}`);
      console.log(`   Last Donation: ${donor.lastDonationDate ? donor.lastDonationDate.toLocaleDateString() : 'Never'}`);
      
      // Check if last donation date is in the future
      if (donor.lastDonationDate && donor.lastDonationDate > today) {
        console.log(`   ⚠️  ISSUE: Last donation date is in the FUTURE!`);
        console.log(`   🔧 Fixing: Setting last donation to 90 days ago (eligible)`);
        
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        donor.lastDonationDate = ninetyDaysAgo;
        await donor.save();
        
        console.log(`   ✅ Fixed: Last donation now ${ninetyDaysAgo.toLocaleDateString()}`);
      }
      
      // Check eligibility
      const eligibility = donor.checkEligibility();
      console.log(`   Status: ${eligibility}`);
      
      if (donor.lastDonationDate) {
        const daysSince = donor.daysSinceLastDonation();
        console.log(`   Days since last donation: ${daysSince}`);
      }
      
      console.log('');
    }
    
    // Also check for blood units with future collection dates
    console.log('\n🩸 Checking blood units for future dates...\n');
    
    const futureUnits = await BloodUnit.find({
      collectionDate: { $gt: today }
    }).populate('donorID', 'name email');
    
    if (futureUnits.length > 0) {
      console.log(`⚠️  Found ${futureUnits.length} blood units with future collection dates:\n`);
      
      for (const unit of futureUnits) {
        console.log(`   ${unit.bloodUnitID}`);
        console.log(`      Donor: ${unit.donorID?.name || 'Unknown'}`);
        console.log(`      Collection Date: ${unit.collectionDate.toLocaleDateString()}`);
        console.log(`      Status: ${unit.status}`);
        
        // Fix: Set collection date to 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        unit.collectionDate = thirtyDaysAgo;
        
        // Recalculate expiry date (42 days from collection)
        const newExpiryDate = new Date(thirtyDaysAgo);
        newExpiryDate.setDate(newExpiryDate.getDate() + 42);
        unit.expiryDate = newExpiryDate;
        
        await unit.save();
        
        console.log(`      ✅ Fixed: Collection date now ${thirtyDaysAgo.toLocaleDateString()}`);
        console.log(`      ✅ New expiry date: ${newExpiryDate.toLocaleDateString()}`);
        console.log('');
      }
    } else {
      console.log('✅ No blood units with future dates found');
    }
    
    console.log('\n✅ Donor eligibility check complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDonorEligibility();
