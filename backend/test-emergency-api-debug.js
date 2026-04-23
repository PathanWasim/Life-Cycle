require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function testEmergencyRequestLogic() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Test data - matching what Hospital 1 would send
    const bloodGroup = 'A-';
    const city = 'Mumbai';
    const pincode = '400001';
    
    console.log('🔍 Testing Emergency Request Logic:');
    console.log(`   Blood Group: ${bloodGroup}`);
    console.log(`   City: ${city}`);
    console.log(`   Pincode: ${pincode}\n`);
    
    // Step 1: Find eligible donors by location and blood group
    console.log('Step 1: Finding donors by location and blood group...');
    const eligibleDonors = await User.find({
      role: 'Donor',
      bloodGroup: bloodGroup,
      $or: [
        { city: city },
        { pincode: pincode }
      ]
    });
    
    console.log(`   Found ${eligibleDonors.length} donors matching criteria\n`);
    
    if (eligibleDonors.length === 0) {
      console.log('❌ No donors found!');
      console.log('\n🔍 Let\'s check all donors:');
      
      const allDonors = await User.find({ role: 'Donor' })
        .select('name email bloodGroup city pincode');
      
      console.log(`\nTotal donors in database: ${allDonors.length}\n`);
      allDonors.forEach(donor => {
        console.log(`${donor.name} (${donor.email})`);
        console.log(`  Blood Group: ${donor.bloodGroup}`);
        console.log(`  City: ${donor.city || 'MISSING'}`);
        console.log(`  Pincode: ${donor.pincode || 'MISSING'}`);
        console.log('');
      });
      
      process.exit(0);
    }
    
    // Step 2: Check eligibility
    console.log('Step 2: Checking donor eligibility...');
    eligibleDonors.forEach(donor => {
      const eligibilityStatus = donor.checkEligibility();
      console.log(`   ${donor.name} (${donor.email})`);
      console.log(`      Blood Group: ${donor.bloodGroup}`);
      console.log(`      City: ${donor.city}`);
      console.log(`      Pincode: ${donor.pincode}`);
      console.log(`      Eligibility: ${eligibilityStatus}`);
      console.log(`      Last Donation: ${donor.lastDonationDate || 'Never'}`);
      console.log('');
    });
    
    const trulyEligibleDonors = eligibleDonors.filter(donor => {
      return donor.checkEligibility() === 'Eligible';
    });
    
    console.log(`✅ ${trulyEligibleDonors.length} donors are eligible for notification\n`);
    
    if (trulyEligibleDonors.length > 0) {
      console.log('📧 These donors would receive emails:');
      trulyEligibleDonors.forEach((donor, index) => {
        console.log(`   ${index + 1}. ${donor.name} (${donor.email})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testEmergencyRequestLogic();
