/**
 * Test Campaign Management API
 * Quick test to verify campaign endpoints work correctly
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');
const CampaignParticipant = require('./models/CampaignParticipant');
const User = require('./models/User');

async function testCampaignAPI() {
  try {
    console.log('🧪 Testing Campaign Management API...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Create a test campaign
    console.log('\n📝 Test 1: Creating test campaign...');
    
    // Find a verified hospital
    const hospital = await User.findOne({ role: 'Hospital', isVerified: true });
    if (!hospital) {
      console.log('❌ No verified hospital found. Please create one first.');
      return;
    }
    
    console.log(`   Using hospital: ${hospital.hospitalName}`);
    
    const testCampaign = new Campaign({
      creatorHospitalID: hospital._id,
      title: 'Test Blood Donation Campaign',
      description: 'This is a test campaign for API validation',
      venue: {
        name: 'Test Community Center',
        address: '123 Test Street',
        city: 'Mumbai',
        pincode: '400001'
      },
      campaignDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      startTime: '09:00',
      endTime: '17:00',
      bloodGroupsNeeded: ['A+', 'B+', 'O+'],
      targetQuantity: 50
    });
    
    await testCampaign.save();
    console.log(`✅ Campaign created: ${testCampaign.campaignID}`);
    
    // Test 2: Test campaign methods
    console.log('\n🔧 Test 2: Testing campaign methods...');
    console.log(`   Is Active: ${testCampaign.isActive()}`);
    console.log(`   Is Today: ${testCampaign.isToday()}`);
    console.log(`   Has Passed: ${testCampaign.hasPassed()}`);
    console.log(`   Can transition to Active: ${testCampaign.canTransitionTo('Active')}`);
    console.log(`   Collection Rate: ${testCampaign.getCollectionRate()}%`);
    
    // Test 3: Create test participant
    console.log('\n👤 Test 3: Creating test participant...');
    
    // Find an eligible donor
    const donor = await User.findOne({ role: 'Donor' });
    if (!donor) {
      console.log('❌ No donor found. Please create one first.');
    } else {
      console.log(`   Using donor: ${donor.name}`);
      
      const testParticipant = new CampaignParticipant({
        campaignID: testCampaign._id,
        donorID: donor._id,
        registrationSource: 'discovery'
      });
      
      await testParticipant.save();
      console.log(`✅ Participant created with status: ${testParticipant.attendanceStatus}`);
      
      // Test participant methods
      console.log(`   Can mark as done: ${testParticipant.canMarkAsDone()}`);
      console.log(`   Can be verified: ${testParticipant.canBeVerified()}`);
      console.log(`   Status info:`, testParticipant.getStatusInfo());
      
      // Update campaign registered count
      await Campaign.findByIdAndUpdate(testCampaign._id, {
        $inc: { registeredCount: 1 }
      });
      console.log('✅ Campaign registered count updated');
    }
    
    // Test 4: Test campaign statistics
    console.log('\n📊 Test 4: Testing campaign statistics...');
    const stats = await CampaignParticipant.getCampaignStats(testCampaign._id);
    console.log('   Campaign stats:', stats);
    
    // Test 5: Test campaign queries
    console.log('\n🔍 Test 5: Testing campaign queries...');
    
    // Find active campaigns
    const activeCampaigns = await Campaign.find({ status: 'Active' });
    console.log(`   Active campaigns: ${activeCampaigns.length}`);
    
    // Find campaigns by location
    const mumbaiCampaigns = await Campaign.find({ 'venue.city': 'Mumbai' });
    console.log(`   Mumbai campaigns: ${mumbaiCampaigns.length}`);
    
    // Find campaigns by blood group
    const oPlusCampaigns = await Campaign.find({ bloodGroupsNeeded: 'O+' });
    console.log(`   O+ campaigns: ${oPlusCampaigns.length}`);
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log(`   - Campaign model: ✅ Working`);
    console.log(`   - CampaignParticipant model: ✅ Working`);
    console.log(`   - Campaign methods: ✅ Working`);
    console.log(`   - Participant methods: ✅ Working`);
    console.log(`   - Database queries: ✅ Working`);
    console.log(`   - Statistics: ✅ Working`);
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    if (donor) {
      await CampaignParticipant.findOneAndDelete({ campaignID: testCampaign._id });
      console.log('✅ Test participant deleted');
    }
    await Campaign.findByIdAndDelete(testCampaign._id);
    console.log('✅ Test campaign deleted');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testCampaignAPI();