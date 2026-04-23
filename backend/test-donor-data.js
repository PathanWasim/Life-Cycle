require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');

async function checkDonorData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find the test donor
    const donor = await User.findOne({ email: 'test.donor@example.com' });
    
    if (!donor) {
      console.log('❌ Donor not found');
      return;
    }

    console.log('✅ Donor Profile:');
    console.log('  ID:', donor._id);
    console.log('  Email:', donor.email);
    console.log('  Name:', donor.name);
    console.log('  Blood Group:', donor.bloodGroup);
    console.log('  Age:', donor.age);
    console.log('  Weight:', donor.weight);
    console.log('  City:', donor.city);
    console.log('  Pincode:', donor.pincode);
    console.log('  Last Donation Date:', donor.lastDonationDate);
    console.log('  Eligibility Status:', donor.checkEligibility());
    
    // Find donations
    const donations = await BloodUnit.find({ donorID: donor._id })
      .populate('originalHospitalID', 'hospitalName city')
      .populate('currentHospitalID', 'hospitalName city')
      .sort({ collectionDate: -1 });
    
    console.log('\n📦 Donations:', donations.length);
    donations.forEach((donation, index) => {
      console.log(`\n  Donation ${index + 1}:`);
      console.log('    Blood Unit ID:', donation.bloodUnitID);
      console.log('    Blood Group:', donation.bloodGroup);
      console.log('    Collection Date:', donation.collectionDate);
      console.log('    Status:', donation.status);
      console.log('    Hospital:', donation.originalHospitalID?.hospitalName || 'N/A');
      console.log('    TX Hash:', donation.donationTxHash || 'Pending');
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkDonorData();
