require('dotenv').config();
const mongoose = require('mongoose');

async function prepareForDemo() {
  try {
    console.log('🎬 PREPARING SYSTEM FOR DEMO...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const User = require('./models/User');
    const BloodUnit = require('./models/BloodUnit');

    // ========================================
    // STEP 1: Reset Test Donors
    // ========================================
    console.log('📋 STEP 1: Resetting Test Donors...\n');

    const testDonorEmails = [
      'sample.donor1@example.com',
      'sample.donor2@example.com'
    ];

    for (const email of testDonorEmails) {
      const donor = await User.findOne({ email, role: 'Donor' });
      
      if (!donor) {
        console.log(`❌ Donor not found: ${email}`);
        continue;
      }

      // Delete all blood units for this donor
      const deleteResult = await BloodUnit.deleteMany({ donorID: donor._id });
      
      // Reset donor's last donation date
      donor.lastDonationDate = null;
      await donor.save();
      
      console.log(`✅ ${donor.name || email}: Reset (Deleted ${deleteResult.deletedCount} units)`);
    }

    console.log();

    // ========================================
    // STEP 2: Fix Transferred Units
    // ========================================
    console.log('📋 STEP 2: Fixing Transferred Units...\n');

    const transferredUnits = await BloodUnit.find({
      status: 'Transferred'
    });

    let fixed = 0;

    for (const unit of transferredUnits) {
      if (unit.transferHistory.length === 0) {
        console.log(`⚠️  ${unit.bloodUnitID}: No transfer history, skipping`);
        continue;
      }

      const lastTransfer = unit.transferHistory[unit.transferHistory.length - 1];
      const destinationHospitalID = lastTransfer.toHospitalID;

      if (unit.currentHospitalID.toString() !== destinationHospitalID.toString()) {
        unit.currentHospitalID = destinationHospitalID;
        await unit.save();
        console.log(`✅ ${unit.bloodUnitID}: Fixed`);
        fixed++;
      }
    }

    if (fixed === 0) {
      console.log('✅ All transferred units are correct');
    }

    console.log();

    // ========================================
    // STEP 3: Verify Demo Credentials
    // ========================================
    console.log('📋 STEP 3: Verifying Demo Credentials...\n');

    const donor1 = await User.findOne({ email: 'sample.donor1@example.com' });
    const donor2 = await User.findOne({ email: 'sample.donor2@example.com' });
    const hospital1 = await User.findOne({ email: 'sample.hospital1@example.com' });
    const hospital2 = await User.findOne({ email: 'sample.hospital2@example.com' });
    const admin = await User.findOne({ email: 'admin@lifechain.com' });

    console.log('👤 Donors:');
    console.log(`   ✅ Donor 1: ${donor1?.name || 'Not found'} (${donor1?.bloodGroup}) - ${donor1?.checkEligibility()}`);
    console.log(`   ✅ Donor 2: ${donor2?.name || 'Not found'} (${donor2?.bloodGroup}) - ${donor2?.checkEligibility()}`);
    console.log();

    console.log('🏥 Hospitals:');
    console.log(`   ✅ Hospital 1: ${hospital1?.hospitalName || 'Not found'} - ${hospital1?.city}`);
    console.log(`   ✅ Hospital 2: ${hospital2?.hospitalName || 'Not found'} - ${hospital2?.city}`);
    console.log();

    console.log('👨‍💼 Admin:');
    console.log(`   ✅ Admin: ${admin?.email || 'Not found'}`);
    console.log();

    // ========================================
    // STEP 4: System Summary
    // ========================================
    console.log('📋 STEP 4: System Summary...\n');

    const totalDonors = await User.countDocuments({ role: 'Donor' });
    const totalHospitals = await User.countDocuments({ role: 'Hospital', isVerified: true });
    const totalBloodUnits = await BloodUnit.countDocuments();
    const availableUnits = await BloodUnit.countDocuments({ status: { $in: ['Collected', 'Stored'] } });

    console.log('📊 System Status:');
    console.log(`   Total Donors: ${totalDonors}`);
    console.log(`   Verified Hospitals: ${totalHospitals}`);
    console.log(`   Total Blood Units: ${totalBloodUnits}`);
    console.log(`   Available Units: ${availableUnits}`);
    console.log();

    await mongoose.connection.close();

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ SYSTEM READY FOR DEMO!');
    console.log('═══════════════════════════════════════════════════════');
    console.log();
    console.log('📖 Next Steps:');
    console.log('   1. Restart backend: npm start');
    console.log('   2. Open browser: http://localhost:5173');
    console.log('   3. Follow: DEMO_CREDENTIALS.md');
    console.log();
    console.log('🎯 Test Credentials:');
    console.log('   Donor 1: sample.donor1@example.com / SamplePass123!');
    console.log('   Donor 2: sample.donor2@example.com / SamplePass123!');
    console.log('   Hospital 1: sample.hospital1@example.com / HospitalPass123!');
    console.log('   Hospital 2: sample.hospital2@example.com / HospitalPass123!');
    console.log('   Admin: admin@lifechain.com / Admin@123456');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

prepareForDemo();
