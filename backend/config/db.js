const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in Mongoose 6+, but included for compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Create indexes after connection
    await createIndexes();
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log(`⚠️  Server will continue running without database`);
    console.log(`📝 See docs/MONGODB_SETUP.md for setup instructions`);
    // Don't exit in development - allow server to run for testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Function to create additional performance indexes for campaign queries
const createCampaignPerformanceIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Campaign collection additional indexes
    const campaignCollection = db.collection('campaigns');
    
    // Compound index for location-based campaign queries with status and date
    await campaignCollection.createIndex(
      { 'venue.city': 1, 'venue.pincode': 1, status: 1, campaignDate: 1 },
      { name: 'campaign_location_status_date_idx' }
    );
    
    // Index for blood group filtering with status
    await campaignCollection.createIndex(
      { bloodGroupsNeeded: 1, status: 1, campaignDate: 1 },
      { name: 'campaign_bloodgroup_status_date_idx' }
    );
    
    // Index for hospital campaign management queries
    await campaignCollection.createIndex(
      { creatorHospitalID: 1, status: 1, campaignDate: -1 },
      { name: 'campaign_hospital_status_date_idx' }
    );
    
    // Text search index for campaign title and description
    await campaignCollection.createIndex(
      { title: 'text', description: 'text', 'venue.name': 'text' },
      { name: 'campaign_text_search_idx' }
    );
    
    console.log('✅ Campaign performance indexes created');
    
    // CampaignParticipant collection additional indexes
    const participantCollection = db.collection('campaignparticipants');
    
    // Compound index for participant lookups by campaign and status
    await participantCollection.createIndex(
      { campaignID: 1, attendanceStatus: 1, registrationDate: -1 },
      { name: 'participant_campaign_status_date_idx' }
    );
    
    // Index for donor participation history
    await participantCollection.createIndex(
      { donorID: 1, attendanceStatus: 1, registrationDate: -1 },
      { name: 'participant_donor_status_date_idx' }
    );
    
    // Index for verification queries
    await participantCollection.createIndex(
      { attendanceStatus: 1, verificationDate: -1 },
      { name: 'participant_verification_idx' }
    );
    
    console.log('✅ CampaignParticipant performance indexes created');
    
    // BloodUnit collection campaign-related indexes
    const bloodUnitCollection = db.collection('bloodunits');
    
    // Compound index for public blood availability queries
    await bloodUnitCollection.createIndex(
      { currentHospitalID: 1, status: 1, bloodGroup: 1, expiryDate: 1 },
      { name: 'bloodunit_availability_idx' }
    );
    
    // Index for campaign blood units
    await bloodUnitCollection.createIndex(
      { campaignID: 1, campaignDonation: 1, status: 1 },
      { name: 'bloodunit_campaign_idx' }
    );
    
    // Index for regional blood availability (hospital location-based)
    await bloodUnitCollection.createIndex(
      { status: 1, expiryDate: 1, bloodGroup: 1, currentHospitalID: 1 },
      { name: 'bloodunit_regional_availability_idx' }
    );
    
    console.log('✅ BloodUnit campaign performance indexes created');
    
    // User collection campaign-related indexes
    const userCollection = db.collection('users');
    
    // Compound index for donor invitation queries
    await userCollection.createIndex(
      { role: 1, bloodGroup: 1, city: 1, isVerified: 1 },
      { name: 'user_donor_invitation_city_idx' }
    );
    
    await userCollection.createIndex(
      { role: 1, bloodGroup: 1, pincode: 1, isVerified: 1 },
      { name: 'user_donor_invitation_pincode_idx' }
    );
    
    // Index for hospital location queries
    await userCollection.createIndex(
      { role: 1, city: 1, pincode: 1, isVerified: 1 },
      { name: 'user_hospital_location_idx' }
    );
    
    console.log('✅ User campaign performance indexes created');
    
  } catch (error) {
    console.error(`⚠️  Campaign performance index creation warning: ${error.message}`);
    // Continue execution even if some indexes fail
  }
};

// Function to create database indexes for optimal performance
const createIndexes = async () => {
  try {
    const User = require('../models/User');
    const BloodUnit = require('../models/BloodUnit');
    const EmergencyRequest = require('../models/EmergencyRequest');
    const BlockchainRetry = require('../models/BlockchainRetry');
    const Campaign = require('../models/Campaign');
    const CampaignParticipant = require('../models/CampaignParticipant');

    // User indexes (already defined in schema, but ensuring they're created)
    await User.createIndexes();
    console.log('✅ User indexes created');

    // BloodUnit indexes
    await BloodUnit.createIndexes();
    console.log('✅ BloodUnit indexes created');

    // EmergencyRequest indexes
    await EmergencyRequest.createIndexes();
    console.log('✅ EmergencyRequest indexes created');

    // BlockchainRetry indexes
    await BlockchainRetry.createIndexes();
    console.log('✅ BlockchainRetry indexes created');

    // Campaign indexes
    await Campaign.createIndexes();
    console.log('✅ Campaign indexes created');

    // CampaignParticipant indexes
    await CampaignParticipant.createIndexes();
    console.log('✅ CampaignParticipant indexes created');

    // Additional performance indexes for campaign queries
    await createCampaignPerformanceIndexes();

  } catch (error) {
    console.error(`⚠️  Index creation warning: ${error.message}`);
    // Don't exit on index errors, they might already exist
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
