const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
require('dotenv').config();

async function verifyDemoSetup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('\n🔍 DEMO SETUP VERIFICATION');
    console.log('==========================');

    // Check demo users
    const demoUsers = await User.find({
      email: { 
        $in: [
          'sample.donor1@example.com',
          'sample.donor2@example.com', 
          'sample.donor3@example.com',
          'sample.hospital1@example.com',
          'sample.hospital2@example.com',
          'admin@lifechain.com'
        ]
      }
    }).sort({ role: 1, email: 1 });

    console.log('\n👥 DEMO USERS:');
    demoUsers.forEach(user => {
      const location = user.city && user.pincode ? `${user.city}, ${user.pincode}` : 'No location';
      const eligibility = user.role === 'Donor' ? ` | ${user.eligibilityStatus}` : '';
      console.log(`   ${user.role}: ${user.email} | ${location}${eligibility}`);
    });

    // Check blood inventory
    const hospitals = await User.find({ 
      role: 'Hospital',
      email: { $in: ['sample.hospital1@example.com', 'sample.hospital2@example.com'] }
    });

    console.log('\n🩸 BLOOD INVENTORY:');
    
    for (const hospital of hospitals) {
      const bloodUnits = await BloodUnit.find({ 
        currentHospitalID: hospital._id,
        status: 'Stored'
      });
      
      console.log(`\n🏥 ${hospital.hospitalName} (${hospital.city})`);
      console.log(`   Total Units: ${bloodUnits.length}`);
      
      // Group by blood type
      const bloodGroups = {};
      bloodUnits.forEach(unit => {
        if (!bloodGroups[unit.bloodGroup]) {
          bloodGroups[unit.bloodGroup] = [];
        }
        bloodGroups[unit.bloodGroup].push(unit);
      });
      
      // Show distribution
      Object.keys(bloodGroups).sort().forEach(bloodGroup => {
        const units = bloodGroups[bloodGroup];
        const expiryInfo = units.map(u => u.daysUntilExpiry()).sort((a, b) => a - b);
        const minExpiry = Math.min(...expiryInfo);
        const maxExpiry = Math.max(...expiryInfo);
        console.log(`   ${bloodGroup}: ${units.length} units (expires: ${minExpiry}-${maxExpiry} days)`);
      });
    }

    // Check email mapping
    const emailMapping = require('./services/emailMapping');
    const mappings = emailMapping.getAllMappings();
    
    console.log('\n📧 EMAIL MAPPING:');
    Object.entries(mappings).forEach(([demo, real]) => {
      console.log(`   ${demo} → ${real}`);
    });

    // Summary statistics
    const totalDonors = await User.countDocuments({ role: 'Donor' });
    const totalHospitals = await User.countDocuments({ role: 'Hospital' });
    const totalBloodUnits = await BloodUnit.countDocuments({ status: 'Stored' });
    const eligibleDonors = await User.countDocuments({ 
      role: 'Donor', 
      eligibilityStatus: 'Eligible' 
    });

    console.log('\n📊 SYSTEM STATISTICS:');
    console.log(`   Total Donors: ${totalDonors} (${eligibleDonors} eligible)`);
    console.log(`   Total Hospitals: ${totalHospitals}`);
    console.log(`   Total Blood Units: ${totalBloodUnits}`);

    console.log('\n✅ DEMO VERIFICATION COMPLETE');
    console.log('=============================');
    console.log('🎯 All systems ready for demonstration');
    console.log('📱 Frontend: http://localhost:3000');
    console.log('🔧 Backend: http://localhost:5000');
    console.log('🤖 AI Service: http://localhost:8000');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyDemoSetup();