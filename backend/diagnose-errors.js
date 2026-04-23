require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
const EmergencyRequest = require('./models/EmergencyRequest');

async function diagnoseSystem() {
  console.log('🔍 LIFECHAIN SYSTEM DIAGNOSTICS\n');
  console.log('='.repeat(70));

  try {
    // 1. Check MongoDB Connection
    console.log('\n📡 1. CHECKING MONGODB CONNECTION...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);

    // 2. Check Users
    console.log('\n👥 2. CHECKING USERS...');
    const donors = await User.countDocuments({ role: 'Donor' });
    const hospitals = await User.countDocuments({ role: 'Hospital' });
    const verifiedHospitals = await User.countDocuments({ role: 'Hospital', isVerified: true });
    const admins = await User.countDocuments({ role: 'Admin' });
    
    console.log(`   Donors: ${donors}`);
    console.log(`   Hospitals: ${hospitals} (${verifiedHospitals} verified)`);
    console.log(`   Admins: ${admins}`);

    if (donors === 0 || hospitals === 0) {
      console.log('   ⚠️  WARNING: No sample data found!');
      console.log('   Run: node backend/populate-sample-data.js');
    }

    // 3. Check Eligible Donors
    console.log('\n✅ 3. CHECKING ELIGIBLE DONORS...');
    const allDonors = await User.find({ role: 'Donor' });
    let eligibleCount = 0;
    
    for (const donor of allDonors) {
      const status = donor.checkEligibility();
      if (status === 'Eligible') {
        eligibleCount++;
        console.log(`   ✓ ${donor.email} - ${donor.bloodGroup} - Eligible`);
      } else {
        console.log(`   ✗ ${donor.email} - ${donor.bloodGroup} - ${status}`);
      }
    }
    
    console.log(`\n   Total Eligible: ${eligibleCount}/${allDonors.length}`);

    // 4. Check Blood Units
    console.log('\n🩸 4. CHECKING BLOOD UNITS...');
    const totalUnits = await BloodUnit.countDocuments();
    const collected = await BloodUnit.countDocuments({ status: 'Collected' });
    const stored = await BloodUnit.countDocuments({ status: 'Stored' });
    const transferred = await BloodUnit.countDocuments({ status: 'Transferred' });
    const used = await BloodUnit.countDocuments({ status: 'Used' });
    
    console.log(`   Total: ${totalUnits}`);
    console.log(`   Collected: ${collected}`);
    console.log(`   Stored: ${stored}`);
    console.log(`   Transferred: ${transferred}`);
    console.log(`   Used: ${used}`);

    if (totalUnits === 0) {
      console.log('   ⚠️  WARNING: No blood units found!');
      console.log('   Run: node backend/populate-sample-data.js');
    }

    // 5. Check Expired Blood Units
    console.log('\n⏰ 5. CHECKING EXPIRED BLOOD UNITS...');
    const activeUnits = await BloodUnit.find({ status: { $ne: 'Used' } });
    let expiredCount = 0;
    let expiringSoon = 0;
    
    for (const unit of activeUnits) {
      const daysLeft = unit.daysUntilExpiry();
      if (unit.isExpired()) {
        expiredCount++;
        console.log(`   ⚠️  EXPIRED: ${unit.bloodUnitID} (${unit.bloodGroup}) - Expired ${Math.abs(daysLeft)} days ago`);
      } else if (daysLeft <= 7) {
        expiringSoon++;
        console.log(`   ⚡ EXPIRING SOON: ${unit.bloodUnitID} (${unit.bloodGroup}) - ${daysLeft} days left`);
      }
    }
    
    console.log(`\n   Expired: ${expiredCount}`);
    console.log(`   Expiring Soon (≤7 days): ${expiringSoon}`);

    // 6. Check Emergency Requests
    console.log('\n🚨 6. CHECKING EMERGENCY REQUESTS...');
    const activeRequests = await EmergencyRequest.countDocuments({ status: 'Active' });
    const fulfilledRequests = await EmergencyRequest.countDocuments({ status: 'Fulfilled' });
    
    console.log(`   Active: ${activeRequests}`);
    console.log(`   Fulfilled: ${fulfilledRequests}`);

    // 7. Check Environment Variables
    console.log('\n🔐 7. CHECKING ENVIRONMENT VARIABLES...');
    const requiredVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'PORT',
      'BLOCKCHAIN_RPC_URL',
      'CONTRACT_ADDRESS',
      'PRIVATE_KEY',
      'AI_SERVICE_URL'
    ];

    let missingVars = [];
    for (const varName of requiredVars) {
      if (process.env[varName]) {
        console.log(`   ✓ ${varName}: Set`);
      } else {
        console.log(`   ✗ ${varName}: MISSING`);
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      console.log(`\n   ⚠️  WARNING: ${missingVars.length} environment variables missing!`);
      console.log('   Check your .env file');
    }

    // 8. Test Sample Credentials
    console.log('\n🔑 8. TESTING SAMPLE CREDENTIALS...');
    const bcrypt = require('bcryptjs');
    
    const testAccounts = [
      { email: 'sample.donor1@example.com', password: 'SamplePass123!', role: 'Donor' },
      { email: 'sample.hospital1@example.com', password: 'HospitalPass123!', role: 'Hospital' },
      { email: 'admin@lifechain.com', password: 'Admin@123456', role: 'Admin' }
    ];

    for (const account of testAccounts) {
      const user = await User.findOne({ email: account.email });
      if (user) {
        const isValid = await bcrypt.compare(account.password, user.password);
        if (isValid) {
          console.log(`   ✓ ${account.email} - Password valid`);
        } else {
          console.log(`   ✗ ${account.email} - Password INVALID`);
        }
      } else {
        console.log(`   ✗ ${account.email} - User NOT FOUND`);
      }
    }

    // 9. Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 DIAGNOSTIC SUMMARY\n');
    
    const issues = [];
    
    if (donors === 0 || hospitals === 0) {
      issues.push('No sample data - Run populate-sample-data.js');
    }
    
    if (eligibleCount === 0) {
      issues.push('No eligible donors available');
    }
    
    if (verifiedHospitals === 0) {
      issues.push('No verified hospitals - Cannot record donations');
    }
    
    if (missingVars.length > 0) {
      issues.push(`${missingVars.length} environment variables missing`);
    }
    
    if (expiredCount > 0) {
      issues.push(`${expiredCount} expired blood units (should be removed)`);
    }

    if (issues.length === 0) {
      console.log('✅ ALL CHECKS PASSED - System ready for testing!\n');
      console.log('📝 QUICK START:');
      console.log('   1. Start backend: cd backend && npm start');
      console.log('   2. Start AI service: cd ai-service && python app.py');
      console.log('   3. Start frontend: cd frontend && npm run dev');
      console.log('   4. Open browser: http://localhost:5173');
      console.log('   5. Login with sample credentials\n');
    } else {
      console.log('⚠️  ISSUES FOUND:\n');
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      console.log('\n💡 FIX SUGGESTIONS:');
      console.log('   - Run: node backend/populate-sample-data.js');
      console.log('   - Check: backend/.env file');
      console.log('   - Verify: MongoDB connection string\n');
    }

    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ DIAGNOSTIC ERROR:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run diagnostics
diagnoseSystem();
