require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function debugHospital1Emergency() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('🔍 DEBUGGING HOSPITAL 1 & DONOR 1 EMERGENCY REQUEST');
    console.log('===================================================\n');
    
    // Get Hospital 1
    const hospital1 = await User.findOne({ email: 'sample.hospital1@example.com' });
    console.log('🏥 Hospital 1:');
    console.log(`   Name: ${hospital1.hospitalName}`);
    console.log(`   Email: ${hospital1.email}`);
    console.log(`   City: ${hospital1.city}`);
    console.log(`   Pincode: ${hospital1.pincode}\n`);
    
    // Get Donor 1
    const donor1 = await User.findOne({ email: 'sample.donor1@example.com' });
    console.log('👤 Donor 1:');
    console.log(`   Name: ${donor1.name}`);
    console.log(`   Email: ${donor1.email}`);
    console.log(`   Blood Group: ${donor1.bloodGroup}`);
    console.log(`   City: ${donor1.city}`);
    console.log(`   Pincode: ${donor1.pincode}`);
    console.log(`   Last Donation: ${donor1.lastDonationDate ? donor1.lastDonationDate.toLocaleDateString() : 'Never'}`);
    console.log(`   Eligibility: ${donor1.checkEligibility()}\n`);
    
    // Check location matching
    console.log('📍 Location Matching:');
    console.log(`   Hospital City: "${hospital1.city}"`);
    console.log(`   Donor City: "${donor1.city}"`);
    console.log(`   Cities Match: ${hospital1.city === donor1.city ? '✅ YES' : '❌ NO'}`);
    console.log(`   Hospital Pincode: "${hospital1.pincode}"`);
    console.log(`   Donor Pincode: "${donor1.pincode}"`);
    console.log(`   Pincodes Match: ${hospital1.pincode === donor1.pincode ? '✅ YES' : '❌ NO'}\n`);
    
    // Check blood group
    console.log('🩸 Blood Group Matching:');
    console.log(`   Request Blood Group: A-`);
    console.log(`   Donor Blood Group: ${donor1.bloodGroup}`);
    console.log(`   Blood Groups Match: ${donor1.bloodGroup === 'A-' ? '✅ YES' : '❌ NO'}\n`);
    
    // Test query that emergency request would use
    console.log('🔍 Testing Emergency Request Query:\n');
    
    const testQuery = {
      role: 'Donor',
      bloodGroup: 'A-',
      $or: [
        { city: hospital1.city },
        { pincode: hospital1.pincode }
      ]
    };
    
    console.log('Query:', JSON.stringify(testQuery, null, 2));
    
    const matchingDonors = await User.find(testQuery);
    console.log(`\n   Found ${matchingDonors.length} donors matching query\n`);
    
    matchingDonors.forEach((donor, i) => {
      const eligibility = donor.checkEligibility();
      console.log(`   ${i + 1}. ${donor.name} (${donor.email})`);
      console.log(`      Blood Group: ${donor.bloodGroup}`);
      console.log(`      City: ${donor.city}`);
      console.log(`      Pincode: ${donor.pincode}`);
      console.log(`      Eligibility: ${eligibility}`);
      console.log('');
    });
    
    // Check eligible donors
    const eligibleDonors = matchingDonors.filter(d => d.checkEligibility() === 'Eligible');
    console.log(`✅ ${eligibleDonors.length} eligible donors found\n`);
    
    if (eligibleDonors.length > 0) {
      console.log('📧 These donors would receive emails:');
      eligibleDonors.forEach((donor, i) => {
        console.log(`   ${i + 1}. ${donor.name} (${donor.email})`);
      });
    } else {
      console.log('❌ No eligible donors found!');
      console.log('\nPossible reasons:');
      console.log('   1. Location mismatch (city or pincode)');
      console.log('   2. Blood group mismatch');
      console.log('   3. Donor not eligible (donated within 56 days)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugHospital1Emergency();
