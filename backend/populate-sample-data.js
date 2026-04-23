/**
 * Sample Data Population Script for LifeChain
 * 
 * This script creates realistic sample data WITHOUT blockchain transactions
 * to avoid MATIC/gas costs. It populates:
 * - 10 donors (5 eligible, 5 with recent donations)
 * - 3 verified hospitals
 * - 15 blood units (various statuses, some with mock blockchain hashes)
 * - 2 emergency requests
 * 
 * Run: node backend/populate-sample-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
const EmergencyRequest = require('./models/EmergencyRequest');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

// Sample data configuration
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
const HOSPITAL_NAMES = ['City General Hospital', 'Metro Medical Center', 'Central Health Institute'];

// Mock blockchain transaction hashes (for display purposes only)
const generateMockTxHash = () => {
  return '0x' + Array.from({length: 64}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

async function clearExistingData() {
  console.log('\n🗑️  Clearing existing sample data...');
  
  // Delete only sample data (keep test accounts)
  await User.deleteMany({ 
    email: { $regex: /^sample\.|^donor\.sample|^hospital\.sample/ } 
  });
  
  await BloodUnit.deleteMany({ 
    bloodUnitID: { $regex: /^SAMPLE-/ } 
  });
  
  await EmergencyRequest.deleteMany({ 
    notes: { $regex: /Sample emergency request/ } 
  });
  
  console.log('✅ Cleared existing sample data');
}

async function createSampleDonors() {
  console.log('\n👥 Creating sample donors...');
  
  const donors = [];
  const hashedPassword = await bcrypt.hash('SamplePass123!', 10);
  
  for (let i = 1; i <= 10; i++) {
    const bloodGroup = BLOOD_GROUPS[i % BLOOD_GROUPS.length];
    const city = CITIES[i % CITIES.length];
    
    // First 5 donors are eligible (no recent donations)
    // Last 5 donors have recent donations (ineligible)
    const lastDonationDate = i > 5 ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : null;
    
    const donor = new User({
      name: `Sample Donor ${i}`,
      email: `sample.donor${i}@example.com`,
      password: hashedPassword,
      role: 'Donor',
      bloodGroup,
      dateOfBirth: new Date(1995, 0, i),
      weight: 55 + i,
      city,
      pincode: `40000${i}`,
      phone: `+91-98765432${10 + i}`,
      lastDonationDate,
      walletAddress: `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    });
    
    await donor.save();
    donors.push(donor);
    
    console.log(`  ✓ Created: ${donor.name} (${bloodGroup}) - ${lastDonationDate ? 'Ineligible' : 'Eligible'}`);
  }
  
  return donors;
}

async function createSampleHospitals() {
  console.log('\n🏥 Creating sample hospitals...');
  
  const hospitals = [];
  const hashedPassword = await bcrypt.hash('HospitalPass123!', 10);
  
  for (let i = 1; i <= 3; i++) {
    const city = CITIES[i - 1];
    
    const hospital = new User({
      hospitalName: HOSPITAL_NAMES[i - 1],
      email: `sample.hospital${i}@example.com`,
      password: hashedPassword,
      role: 'Hospital',
      city,
      pincode: `50000${i}`,
      phone: `+91-22-1234567${i}`,
      walletAddress: `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      isVerified: true // Pre-verified for testing
    });
    
    await hospital.save();
    hospitals.push(hospital);
    
    console.log(`  ✓ Created: ${hospital.hospitalName} (${city}) - VERIFIED`);
  }
  
  return hospitals;
}

async function createSampleBloodUnits(donors, hospitals) {
  console.log('\n🩸 Creating sample blood units...');
  
  const bloodUnits = [];
  const statuses = ['Collected', 'Stored', 'Transferred', 'Used'];
  
  for (let i = 1; i <= 15; i++) {
    const donor = donors[i % donors.length];
    const hospital = hospitals[i % hospitals.length];
    const status = statuses[Math.floor(i / 4) % statuses.length];
    
    // Create collection date (random within last 30 days)
    const daysAgo = Math.floor(Math.random() * 30);
    const collectionDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    const bloodUnit = new BloodUnit({
      bloodUnitID: `SAMPLE-BU-${Date.now()}-${i}`,
      donorID: donor._id,
      bloodGroup: donor.bloodGroup,
      collectionDate,
      expiryDate: new Date(collectionDate.getTime() + 42 * 24 * 60 * 60 * 1000),
      status,
      originalHospitalID: hospital._id,
      currentHospitalID: hospital._id,
      // Add mock blockchain hashes (for display only - no actual blockchain transaction)
      donationTxHash: generateMockTxHash(),
      transferTxHashes: status === 'Transferred' || status === 'Used' ? [generateMockTxHash()] : [],
      usageTxHash: status === 'Used' ? generateMockTxHash() : null,
      usageDate: status === 'Used' ? new Date(collectionDate.getTime() + 10 * 24 * 60 * 60 * 1000) : null,
      patientID: status === 'Used' ? `PAT-${1000 + i}` : null
    });
    
    await bloodUnit.save();
    bloodUnits.push(bloodUnit);
    
    console.log(`  ✓ Created: ${bloodUnit.bloodUnitID} (${bloodUnit.bloodGroup}) - ${status}`);
  }
  
  return bloodUnits;
}

async function createSampleEmergencyRequests(hospitals) {
  console.log('\n🚨 Creating sample emergency requests...');
  
  const requests = [];
  
  for (let i = 1; i <= 2; i++) {
    const hospital = hospitals[i - 1];
    const bloodGroup = BLOOD_GROUPS[i * 2];
    
    const request = new EmergencyRequest({
      hospitalID: hospital._id,
      bloodGroup,
      quantity: i + 1,
      urgencyLevel: i === 1 ? 'Critical' : 'High',
      city: hospital.city,
      pincode: hospital.pincode,
      notes: `Sample emergency request ${i} - Urgent need for ${bloodGroup}`,
      status: 'Active',
      createdDate: new Date(),
      notifiedDonors: []
    });
    
    await request.save();
    requests.push(request);
    
    console.log(`  ✓ Created: Emergency request for ${bloodGroup} (${request.urgencyLevel})`);
  }
  
  return requests;
}

async function displaySummary(donors, hospitals, bloodUnits, requests) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SAMPLE DATA POPULATION COMPLETE');
  console.log('='.repeat(60));
  
  console.log('\n✅ Created:');
  console.log(`   • ${donors.length} Donors (5 eligible, 5 with recent donations)`);
  console.log(`   • ${hospitals.length} Verified Hospitals`);
  console.log(`   • ${bloodUnits.length} Blood Units (various statuses)`);
  console.log(`   • ${requests.length} Active Emergency Requests`);
  
  console.log('\n🔐 Sample Login Credentials:');
  console.log('\n   DONORS (Eligible):');
  for (let i = 1; i <= 5; i++) {
    console.log(`   • sample.donor${i}@example.com / SamplePass123!`);
  }
  
  console.log('\n   HOSPITALS (Verified):');
  for (let i = 1; i <= 3; i++) {
    console.log(`   • sample.hospital${i}@example.com / HospitalPass123!`);
  }
  
  console.log('\n📝 Blood Unit Status Breakdown:');
  const statusCounts = {};
  bloodUnits.forEach(unit => {
    statusCounts[unit.status] = (statusCounts[unit.status] || 0) + 1;
  });
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   • ${status}: ${count} units`);
  });
  
  console.log('\n⚠️  IMPORTANT NOTES:');
  console.log('   • Mock blockchain hashes are used (no actual MATIC spent)');
  console.log('   • All hospitals are pre-verified for testing');
  console.log('   • Blood units have realistic expiry dates');
  console.log('   • Use these accounts to test all dashboard features');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Login to frontend with sample credentials');
  console.log('   2. Test donor dashboard (view donations, download certificates)');
  console.log('   3. Test hospital dashboard (view inventory, record donations)');
  console.log('   4. Test admin panel (view statistics)');
  
  console.log('\n' + '='.repeat(60) + '\n');
}

async function main() {
  try {
    console.log('🚀 Starting Sample Data Population...');
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing sample data
    await clearExistingData();
    
    // Create sample data
    const donors = await createSampleDonors();
    const hospitals = await createSampleHospitals();
    const bloodUnits = await createSampleBloodUnits(donors, hospitals);
    const requests = await createSampleEmergencyRequests(hospitals);
    
    // Display summary
    await displaySummary(donors, hospitals, bloodUnits, requests);
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error populating sample data:', error);
    process.exit(1);
  }
}

// Run the script
main();
