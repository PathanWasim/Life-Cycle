require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');

async function findDonorWithDonations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find all blood units
    const bloodUnits = await BloodUnit.find()
      .populate('donorID', 'email name bloodGroup')
      .populate('originalHospitalID', 'hospitalName')
      .limit(10);

    if (bloodUnits.length === 0) {
      console.log('❌ No blood units found in database');
      console.log('\n💡 To test the full donor dashboard with donations:');
      console.log('   1. Login as a verified hospital');
      console.log('   2. Record a donation for test.donor@example.com');
      console.log('   3. Then login as donor to see the donation history');
      return;
    }

    console.log(`✅ Found ${bloodUnits.length} blood units\n`);

    // Group by donor
    const donorMap = new Map();
    bloodUnits.forEach(unit => {
      if (unit.donorID) {
        const email = unit.donorID.email;
        if (!donorMap.has(email)) {
          donorMap.set(email, {
            email,
            name: unit.donorID.name,
            bloodGroup: unit.donorID.bloodGroup,
            donations: []
          });
        }
        donorMap.get(email).donations.push({
          bloodUnitID: unit.bloodUnitID,
          status: unit.status,
          collectionDate: unit.collectionDate,
          hospital: unit.originalHospitalID?.hospitalName || 'N/A',
          txHash: unit.donationTxHash ? 'Yes' : 'Pending'
        });
      }
    });

    console.log('📋 Donors with donations:\n');
    for (const [email, data] of donorMap) {
      console.log(`👤 ${data.name} (${data.bloodGroup})`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: TestPassword123! (if created via test scripts)`);
      console.log(`   Donations: ${data.donations.length}`);
      data.donations.forEach((d, i) => {
        console.log(`     ${i + 1}. ${d.bloodUnitID} - ${d.status} - ${d.hospital} - TX: ${d.txHash}`);
      });
      console.log('');
    }

    console.log('\n💡 To test full donor dashboard:');
    console.log('   Login with any of the emails above using password: TestPassword123!');
    console.log('   You\'ll see donation history, blockchain links, and certificate downloads');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

findDonorWithDonations();
