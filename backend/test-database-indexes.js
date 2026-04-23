#!/usr/bin/env node

/**
 * Test Database Index Performance
 * 
 * This script tests the performance improvements from the database indexes
 * created for the Campaign Management system.
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const BloodUnit = require('./models/BloodUnit');
const Campaign = require('./models/Campaign');
const CampaignParticipant = require('./models/CampaignParticipant');

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

async function testCampaignIndexes() {
  console.log('\n📊 Testing Campaign collection indexes...');
  
  try {
    // Test location-based campaign queries
    console.time('Campaign location query');
    const locationCampaigns = await Campaign.find({
      'venue.city': 'Mumbai',
      status: 'Active',
      campaignDate: { $gte: new Date() }
    }).explain('executionStats');
    console.timeEnd('Campaign location query');
    
    console.log(`  Documents examined: ${locationCampaigns.executionStats.totalDocsExamined}`);
    console.log(`  Documents returned: ${locationCampaigns.executionStats.nReturned}`);
    console.log(`  Index used: ${locationCampaigns.executionStats.winningPlan.inputStage?.indexName || 'NONE'}`);
    
    // Test blood group filtering
    console.time('Campaign blood group query');
    const bloodGroupCampaigns = await Campaign.find({
      bloodGroupsNeeded: { $in: ['A+', 'O+'] },
      status: 'Active'
    }).explain('executionStats');
    console.timeEnd('Campaign blood group query');
    
    console.log(`  Documents examined: ${bloodGroupCampaigns.executionStats.totalDocsExamined}`);
    console.log(`  Documents returned: ${bloodGroupCampaigns.executionStats.nReturned}`);
    console.log(`  Index used: ${bloodGroupCampaigns.executionStats.winningPlan.inputStage?.indexName || 'NONE'}`);
    
  } catch (error) {
    console.error('❌ Campaign index test failed:', error.message);
  }
}

async function testParticipantIndexes() {
  console.log('\n👥 Testing CampaignParticipant collection indexes...');
  
  try {
    // Test participant lookup by campaign and status
    console.time('Participant status query');
    const participants = await CampaignParticipant.find({
      attendanceStatus: 'Marked Done by Donor'
    }).explain('executionStats');
    console.timeEnd('Participant status query');
    
    console.log(`  Documents examined: ${participants.executionStats.totalDocsExamined}`);
    console.log(`  Documents returned: ${participants.executionStats.nReturned}`);
    console.log(`  Index used: ${participants.executionStats.winningPlan.inputStage?.indexName || 'NONE'}`);
    
  } catch (error) {
    console.error('❌ Participant index test failed:', error.message);
  }
}

async function testBloodUnitIndexes() {
  console.log('\n🩸 Testing BloodUnit collection indexes...');
  
  try {
    // Test public blood availability query
    console.time('Blood availability query');
    const availableBlood = await BloodUnit.find({
      status: { $in: ['Collected', 'Stored'] },
      expiryDate: { $gt: new Date() },
      bloodGroup: 'A+'
    }).explain('executionStats');
    console.timeEnd('Blood availability query');
    
    console.log(`  Documents examined: ${availableBlood.executionStats.totalDocsExamined}`);
    console.log(`  Documents returned: ${availableBlood.executionStats.nReturned}`);
    console.log(`  Index used: ${availableBlood.executionStats.winningPlan.inputStage?.indexName || 'NONE'}`);
    
    // Test campaign blood units
    console.time('Campaign blood units query');
    const campaignBlood = await BloodUnit.find({
      campaignDonation: true,
      status: 'Collected'
    }).explain('executionStats');
    console.timeEnd('Campaign blood units query');
    
    console.log(`  Documents examined: ${campaignBlood.executionStats.totalDocsExamined}`);
    console.log(`  Documents returned: ${campaignBlood.executionStats.nReturned}`);
    console.log(`  Index used: ${campaignBlood.executionStats.winningPlan.inputStage?.indexName || 'NONE'}`);
    
  } catch (error) {
    console.error('❌ BloodUnit index test failed:', error.message);
  }
}

async function testUserIndexes() {
  console.log('\n👤 Testing User collection indexes...');
  
  try {
    // Test donor invitation query
    console.time('Donor invitation query');
    const eligibleDonors = await User.find({
      role: 'Donor',
      bloodGroup: 'A+',
      city: 'Mumbai'
    }).explain('executionStats');
    console.timeEnd('Donor invitation query');
    
    console.log(`  Documents examined: ${eligibleDonors.executionStats.totalDocsExamined}`);
    console.log(`  Documents returned: ${eligibleDonors.executionStats.nReturned}`);
    console.log(`  Index used: ${eligibleDonors.executionStats.winningPlan.inputStage?.indexName || 'NONE'}`);
    
    // Test hospital location query
    console.time('Hospital location query');
    const hospitals = await User.find({
      role: 'Hospital',
      city: 'Mumbai',
      isVerified: true
    }).explain('executionStats');
    console.timeEnd('Hospital location query');
    
    console.log(`  Documents examined: ${hospitals.executionStats.totalDocsExamined}`);
    console.log(`  Documents returned: ${hospitals.executionStats.nReturned}`);
    console.log(`  Index used: ${hospitals.executionStats.winningPlan.inputStage?.indexName || 'NONE'}`);
    
  } catch (error) {
    console.error('❌ User index test failed:', error.message);
  }
}

async function listAllIndexes() {
  console.log('\n📋 Listing all collection indexes...');
  
  const collections = [
    { name: 'campaigns', model: Campaign },
    { name: 'campaignparticipants', model: CampaignParticipant },
    { name: 'bloodunits', model: BloodUnit },
    { name: 'users', model: User }
  ];
  
  for (const { name, model } of collections) {
    try {
      const indexes = await model.collection.listIndexes().toArray();
      console.log(`\n${name.toUpperCase()}:`);
      indexes.forEach(index => {
        const keyStr = Object.keys(index.key).map(k => `${k}:${index.key[k]}`).join(', ');
        console.log(`  • ${index.name}: {${keyStr}}`);
      });
    } catch (error) {
      console.error(`❌ Failed to list indexes for ${name}:`, error.message);
    }
  }
}

async function runPerformanceTests() {
  console.log('🚀 Starting database index performance tests...\n');
  
  await connectToDatabase();
  
  try {
    await listAllIndexes();
    await testCampaignIndexes();
    await testParticipantIndexes();
    await testBloodUnitIndexes();
    await testUserIndexes();
    
    console.log('\n🎉 Performance tests completed!');
    console.log('\n📝 Performance Tips:');
    console.log('  • Queries using indexes should examine fewer documents');
    console.log('  • Look for "IXSCAN" in query plans (good)');
    console.log('  • Avoid "COLLSCAN" in query plans (bad)');
    console.log('  • Monitor query performance in production');
    
  } catch (error) {
    console.error('\n❌ Performance tests failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

// Run tests if called directly
if (require.main === module) {
  runPerformanceTests().catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runPerformanceTests,
  testCampaignIndexes,
  testParticipantIndexes,
  testBloodUnitIndexes,
  testUserIndexes
};