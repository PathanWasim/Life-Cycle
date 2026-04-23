const mongoose = require('mongoose');
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
require('dotenv').config();

async function createRealisticInventory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get demo hospitals
    const hospital1 = await User.findOne({ email: 'sample.hospital1@example.com' });
    const hospital2 = await User.findOne({ email: 'sample.hospital2@example.com' });
    
    if (!hospital1 || !hospital2) {
      console.log('Demo hospitals not found!');
      return;
    }

    // Get demo donors
    const donors = await User.find({ 
      role: 'Donor',
      email: { $in: ['sample.donor1@example.com', 'sample.donor2@example.com', 'sample.donor3@example.com'] }
    });

    console.log(`Found ${donors.length} donors`);

    // Clear existing demo blood units
    await BloodUnit.deleteMany({
      bloodUnitID: { $regex: /^SAMPLE-BU-/ }
    });
    console.log('Cleared existing sample blood units');

    // Blood group distribution (realistic hospital inventory)
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    // Hospital 1 (City General Hospital - Mumbai) - 15 units
    const hospital1Inventory = [
      // O+ (most common) - 4 units
      { bloodGroup: 'O+', count: 4 },
      // A+ (second most common) - 3 units  
      { bloodGroup: 'A+', count: 3 },
      // B+ - 2 units
      { bloodGroup: 'B+', count: 2 },
      // O- (universal donor) - 2 units
      { bloodGroup: 'O-', count: 2 },
      // A- - 2 units
      { bloodGroup: 'A-', count: 2 },
      // AB+ - 1 unit
      { bloodGroup: 'AB+', count: 1 },
      // B- - 1 unit
      { bloodGroup: 'B-', count: 1 }
    ];

    // Hospital 2 (Metro Medical Center - Delhi) - 12 units  
    const hospital2Inventory = [
      // O+ - 3 units
      { bloodGroup: 'O+', count: 3 },
      // A+ - 3 units
      { bloodGroup: 'A+', count: 3 },
      // B+ - 2 units
      { bloodGroup: 'B+', count: 2 },
      // O- - 2 units
      { bloodGroup: 'O-', count: 2 },
      // AB- - 1 unit
      { bloodGroup: 'AB-', count: 1 },
      // A- - 1 unit
      { bloodGroup: 'A-', count: 1 }
    ];

    let totalCreated = 0;

    // Create inventory for Hospital 1
    console.log(`\n🏥 Creating inventory for ${hospital1.hospitalName}...`);
    for (const item of hospital1Inventory) {
      for (let i = 0; i < item.count; i++) {
        // Find a donor with matching blood group or use any donor
        let donor = donors.find(d => d.bloodGroup === item.bloodGroup);
        if (!donor) donor = donors[0]; // Fallback to first donor

        // Create collection date (random between 1-35 days ago)
        const daysAgo = Math.floor(Math.random() * 35) + 1;
        const collectionDate = new Date();
        collectionDate.setDate(collectionDate.getDate() - daysAgo);

        // Calculate expiry date (42 days from collection)
        const expiryDate = new Date(collectionDate);
        expiryDate.setDate(expiryDate.getDate() + 42);

        const bloodUnit = new BloodUnit({
          bloodUnitID: `SAMPLE-BU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          donorID: donor._id,
          bloodGroup: item.bloodGroup,
          collectionDate: collectionDate,
          expiryDate: expiryDate,
          status: 'Stored',
          originalHospitalID: hospital1._id,
          currentHospitalID: hospital1._id,
          donationTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
        });

        await bloodUnit.save();
        totalCreated++;
        
        const daysUntilExpiry = bloodUnit.daysUntilExpiry();
        console.log(`   ✓ Created ${item.bloodGroup} unit (expires in ${daysUntilExpiry} days)`);
        
        // Small delay to ensure unique timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    // Create inventory for Hospital 2
    console.log(`\n🏥 Creating inventory for ${hospital2.hospitalName}...`);
    for (const item of hospital2Inventory) {
      for (let i = 0; i < item.count; i++) {
        // Find a donor with matching blood group or use any donor
        let donor = donors.find(d => d.bloodGroup === item.bloodGroup);
        if (!donor) donor = donors[1] || donors[0]; // Fallback

        // Create collection date (random between 1-35 days ago)
        const daysAgo = Math.floor(Math.random() * 35) + 1;
        const collectionDate = new Date();
        collectionDate.setDate(collectionDate.getDate() - daysAgo);

        // Calculate expiry date (42 days from collection)
        const expiryDate = new Date(collectionDate);
        expiryDate.setDate(expiryDate.getDate() + 42);

        const bloodUnit = new BloodUnit({
          bloodUnitID: `SAMPLE-BU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          donorID: donor._id,
          bloodGroup: item.bloodGroup,
          collectionDate: collectionDate,
          expiryDate: expiryDate,
          status: 'Stored',
          originalHospitalID: hospital2._id,
          currentHospitalID: hospital2._id,
          donationTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
        });

        await bloodUnit.save();
        totalCreated++;
        
        const daysUntilExpiry = bloodUnit.daysUntilExpiry();
        console.log(`   ✓ Created ${item.bloodGroup} unit (expires in ${daysUntilExpiry} days)`);
        
        // Small delay to ensure unique timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    console.log(`\n✅ SUCCESS: Created ${totalCreated} realistic blood units`);
    console.log(`   Hospital 1 (Mumbai): 15 units`);
    console.log(`   Hospital 2 (Delhi): 12 units`);
    console.log(`\n📊 Blood Group Distribution:`);
    console.log(`   O+: Most common (7 total)`);
    console.log(`   A+: Second most (6 total)`);
    console.log(`   B+: Common (4 total)`);
    console.log(`   O-: Universal donor (4 total)`);
    console.log(`   A-: Less common (3 total)`);
    console.log(`   AB+: Rare (1 total)`);
    console.log(`   AB-: Rare (1 total)`);
    console.log(`   B-: Rare (1 total)`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createRealisticInventory();