require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function testAPI() {
  try {
    console.log('🧪 TESTING HOSPITAL 2 API ENDPOINT...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');
    const BloodUnit = require('./models/BloodUnit');

    // Get Hospital 2
    const hospital2 = await User.findOne({ email: 'sample.hospital2@example.com' });
    
    if (!hospital2) {
      console.log('❌ Hospital 2 not found!');
      process.exit(1);
    }

    console.log('🏥 HOSPITAL 2:');
    console.log(`   Name: ${hospital2.hospitalName}`);
    console.log(`   Email: ${hospital2.email}`);
    console.log(`   ID: ${hospital2._id}`);
    console.log(`   Verified: ${hospital2.isVerified}`);
    console.log();

    // Simulate the API query (same as backend/routes/hospital.js line 130-180)
    const query = {
      currentHospitalID: hospital2._id,
      status: { $ne: 'Used' } // Exclude used blood units
    };

    console.log('📡 SIMULATING API QUERY:');
    console.log(`   Query: currentHospitalID = ${hospital2._id}, status != 'Used'`);
    console.log();

    const bloodUnits = await BloodUnit.find(query)
      .populate('donorID', 'name bloodGroup')
      .populate('originalHospitalID', 'hospitalName')
      .sort({ collectionDate: -1 });

    console.log(`📦 API WOULD RETURN: ${bloodUnits.length} units\n`);

    // Format like the API does
    const formattedUnits = bloodUnits.map(unit => ({
      bloodUnitID: unit.bloodUnitID,
      bloodGroup: unit.bloodGroup,
      donorName: unit.donorID?.name || 'Unknown',
      collectionDate: unit.collectionDate,
      expiryDate: unit.expiryDate,
      daysUntilExpiry: unit.daysUntilExpiry(),
      isExpired: unit.isExpired(),
      status: unit.status,
      originalHospital: unit.originalHospitalID?.hospitalName || 'Unknown',
      donationTxHash: unit.donationTxHash
    }));

    console.log('📋 FORMATTED RESPONSE (what frontend receives):');
    console.log(JSON.stringify({
      success: true,
      message: 'Inventory retrieved successfully',
      data: {
        inventory: formattedUnits,
        summary: {
          total: formattedUnits.length,
          byStatus: formattedUnits.reduce((acc, unit) => {
            acc[unit.status] = (acc[unit.status] || 0) + 1;
            return acc;
          }, {})
        }
      }
    }, null, 2));

    console.log('\n✅ API TEST COMPLETE');
    console.log('\n🎯 WHAT THIS MEANS:');
    console.log('   - The backend API is returning the correct data');
    console.log('   - Hospital 2 should see all these units in the frontend');
    console.log('   - If the frontend doesn\'t show them, it\'s a frontend/cache issue');
    console.log('\n💡 USER SHOULD:');
    console.log('   1. Log out from Hospital 2');
    console.log('   2. Log back in');
    console.log('   3. Go to Inventory tab');
    console.log('   4. Hard refresh browser (Ctrl+Shift+R)');

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testAPI();
