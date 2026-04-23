const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BloodUnit = require('../models/BloodUnit');
const EmergencyRequest = require('../models/EmergencyRequest');
const Campaign = require('../models/Campaign');
const CampaignParticipant = require('../models/CampaignParticipant');
const auth = require('../middleware/auth');
const { roleCheck, checkHospitalVerified } = require('../middleware/roleCheck');
const blockchainService = require('../services/blockchainService');
const retryService = require('../services/retryService');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');
const { campaignDetailsCache, hospitalVerificationCache, cacheInvalidation } = require('../middleware/cache');

/**
 * @route   GET /api/hospital/dashboard-stats
 * @desc    Get hospital dashboard statistics
 * @access  Private (Verified Hospital only)
 */
router.get('/dashboard-stats', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const hospitalID = req.user.id;
    
    // Get blood units statistics
    const totalUnits = await BloodUnit.countDocuments({
      currentHospitalID: hospitalID
    });
    
    const availableUnits = await BloodUnit.countDocuments({
      currentHospitalID: hospitalID,
      status: { $in: ['Collected', 'Stored'] },
      expiryDate: { $gt: new Date() }
    });
    
    // Get active campaigns
    const activeCampaigns = await Campaign.countDocuments({
      creatorHospitalID: hospitalID,
      status: 'Active'
    });
    
    // Get active emergency requests
    const emergencyRequests = await EmergencyRequest.countDocuments({
      hospitalID: hospitalID,
      status: 'Active'
    });
    
    // Get blood group distribution
    const bloodGroupDistribution = await BloodUnit.aggregate([
      {
        $match: {
          currentHospitalID: hospitalID,
          status: { $in: ['Collected', 'Stored'] },
          expiryDate: { $gt: new Date() }
        }
      },
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const bloodGroupData = {};
    bloodGroupDistribution.forEach(item => {
      bloodGroupData[item._id] = item.count;
    });
    
    // Get recent activity (last 10 activities)
    const recentBloodUnits = await BloodUnit.find({
      $or: [
        { currentHospitalID: hospitalID },
        { originalHospitalID: hospitalID }
      ]
    })
    .populate('donorID', 'name')
    .sort({ createdAt: -1 })
    .limit(10);
    
    const recentActivity = recentBloodUnits.map(unit => ({
      description: `Blood unit ${unit.bloodUnitID} (${unit.bloodGroup}) - ${unit.status}`,
      timestamp: unit.updatedAt || unit.createdAt,
      type: 'blood_unit'
    }));
    
    // Get recent campaigns
    const recentCampaigns = await Campaign.find({
      creatorHospitalID: hospitalID
    })
    .sort({ createdAt: -1 })
    .limit(5);
    
    recentCampaigns.forEach(campaign => {
      recentActivity.push({
        description: `Campaign "${campaign.title}" - ${campaign.status}`,
        timestamp: campaign.updatedAt || campaign.createdAt,
        type: 'campaign'
      });
    });
    
    // Sort all activities by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        totalUnits,
        availableUnits,
        activeCampaigns,
        emergencyRequests,
        bloodGroupDistribution: bloodGroupData,
        recentActivity: recentActivity.slice(0, 10)
      }
    });
    
  } catch (error) {
    console.error('Error retrieving dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving dashboard statistics',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/hospital/donate
 * @desc    Record a blood donation
 * @access  Private (Verified Hospital only)
 */
router.post('/donate', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { donorEmail, bloodGroup, collectionDate } = req.body;
    
    // Validate required fields
    if (!donorEmail || !bloodGroup || !collectionDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide donorEmail, bloodGroup, and collectionDate'
      });
    }
    
    // Find donor by email
    const donor = await User.findOne({ email: donorEmail, role: 'Donor' });
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    // Check donor eligibility
    const eligibilityStatus = donor.checkEligibility();
    
    if (eligibilityStatus !== 'Eligible') {
      return res.status(400).json({
        success: false,
        message: `Donor is not eligible for donation: ${eligibilityStatus}`
      });
    }
    
    // Verify blood group matches
    if (donor.bloodGroup !== bloodGroup) {
      return res.status(400).json({
        success: false,
        message: `Blood group mismatch. Donor's blood group is ${donor.bloodGroup}, not ${bloodGroup}`
      });
    }
    
    // Generate unique blood unit ID
    const bloodUnitID = `BU-${Date.now()}-${uuidv4().substring(0, 8)}`;
    
    // Calculate expiry date (42 days from collection)
    const expiryDate = new Date(collectionDate);
    expiryDate.setDate(expiryDate.getDate() + 42);
    
    // Get hospital details
    const hospital = await User.findById(req.user.id);
    
    // Create blood unit
    const bloodUnit = new BloodUnit({
      bloodUnitID,
      donorID: donor._id,
      bloodGroup,
      collectionDate: new Date(collectionDate),
      expiryDate,
      status: 'Collected',
      originalHospitalID: hospital._id,
      currentHospitalID: hospital._id
    });
    
    // Save blood unit to MongoDB
    await bloodUnit.save();
    
    // Invalidate blood availability cache since new blood unit was created
    await cacheInvalidation.invalidateBloodAvailability();
    
    console.log(`✅ Blood unit created: ${bloodUnitID}`);
    
    // Record donation milestone on blockchain
    let blockchainResult = null;
    try {
      const metadata = {
        donorID: donor._id.toString(),
        hospitalID: hospital._id.toString(),
        bloodGroup: bloodUnit.bloodGroup,
        timestamp: new Date(collectionDate).toISOString()
      };
      
      console.log(`📝 Recording donation milestone on blockchain for ${bloodUnitID}...`);
      blockchainResult = await blockchainService.recordDonationMilestone(bloodUnitID, metadata);
      
      // Update blood unit with transaction hash
      bloodUnit.donationTxHash = blockchainResult.transactionHash;
      await bloodUnit.save();
      
      console.log(`✅ Blockchain milestone recorded: ${blockchainResult.transactionHash}`);
      
    } catch (blockchainError) {
      console.error('❌ Blockchain recording failed:', blockchainError.message);
      
      // Queue for retry
      const metadata = {
        donorID: donor._id.toString(),
        hospitalID: hospital._id.toString(),
        bloodGroup: bloodUnit.bloodGroup,
        timestamp: new Date(collectionDate).toISOString()
      };
      
      await retryService.queueMilestone(bloodUnitID, 'Donation', metadata);
      console.log(`📥 Milestone queued for retry`);
    }
    
    // Update donor's last donation date
    donor.lastDonationDate = new Date(collectionDate);
    await donor.save();
    
    console.log(`✅ Donor's last donation date updated`);
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Blood donation recorded successfully',
      data: {
        bloodUnitID: bloodUnit.bloodUnitID,
        donorName: donor.name,
        bloodGroup: bloodUnit.bloodGroup,
        collectionDate: bloodUnit.collectionDate,
        expiryDate: bloodUnit.expiryDate,
        status: bloodUnit.status,
        daysUntilExpiry: bloodUnit.daysUntilExpiry(),
        blockchainTxHash: blockchainResult?.transactionHash || 'Queued for retry',
        blockchainStatus: blockchainResult ? 'Recorded' : 'Pending'
      }
    });
    
  } catch (error) {
    console.error('Error recording blood donation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording donation',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/hospital/inventory
 * @desc    Get hospital's blood inventory
 * @access  Private (Verified Hospital only)
 */
router.get('/inventory', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { bloodGroup, status } = req.query;
    
    // Build query
    const query = {
      currentHospitalID: req.user.id,
      status: { $ne: 'Used' } // Exclude used blood units
    };
    
    // Add optional filters
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Query blood units
    const bloodUnits = await BloodUnit.find(query)
      .populate('donorID', 'name bloodGroup')
      .populate('originalHospitalID', 'hospitalName')
      .sort({ collectionDate: -1 });
    
    // Calculate summary statistics
    const summary = {
      total: bloodUnits.length,
      byBloodGroup: {},
      byStatus: {}
    };
    
    bloodUnits.forEach(unit => {
      // Count by blood group
      summary.byBloodGroup[unit.bloodGroup] = (summary.byBloodGroup[unit.bloodGroup] || 0) + 1;
      
      // Count by status
      summary.byStatus[unit.status] = (summary.byStatus[unit.status] || 0) + 1;
    });
    
    // Format blood units with calculated fields
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
    
    res.json({
      success: true,
      message: 'Inventory retrieved successfully',
      data: {
        inventory: formattedUnits,
        summary
      }
    });
    
  } catch (error) {
    console.error('Error retrieving inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving inventory',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/hospital/verified-hospitals
 * @desc    Get list of all verified hospitals (for transfer dropdown)
 * @access  Private (Hospital only)
 */
router.get('/verified-hospitals', auth, roleCheck(['Hospital']), hospitalVerificationCache, async (req, res) => {
  try {
    // Get all verified hospitals except the current one
    const hospitals = await User.find({
      role: 'Hospital',
      isVerified: true,
      _id: { $ne: req.user.id } // Exclude current hospital
    }).select('_id hospitalName city pincode email');
    
    res.json({
      success: true,
      message: 'Verified hospitals retrieved successfully',
      data: {
        hospitals
      }
    });
    
  } catch (error) {
    console.error('Error retrieving verified hospitals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving hospitals',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/hospital/blood-unit/:bloodUnitID/status
 * @desc    Update blood unit status (Collected → Stored)
 * @access  Private (Verified Hospital only)
 */
router.patch('/blood-unit/:bloodUnitID/status', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { bloodUnitID } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }
    
    // Only allow Collected → Stored transition
    if (status !== 'Stored') {
      return res.status(400).json({
        success: false,
        message: 'Only status change to "Stored" is allowed'
      });
    }
    
    // Find blood unit
    const bloodUnit = await BloodUnit.findOne({ bloodUnitID });
    
    if (!bloodUnit) {
      return res.status(404).json({
        success: false,
        message: 'Blood unit not found'
      });
    }
    
    // Verify hospital owns the blood unit
    if (bloodUnit.currentHospitalID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this blood unit'
      });
    }
    
    // Verify current status is Collected
    if (bloodUnit.status !== 'Collected') {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from "${bloodUnit.status}" to "Stored". Only "Collected" units can be marked as "Stored".`
      });
    }
    
    // Update status
    bloodUnit.status = status;
    await bloodUnit.save();
    
    console.log(`✅ Blood unit ${bloodUnitID} status updated to ${status}`);
    
    res.json({
      success: true,
      message: 'Blood unit status updated successfully',
      data: {
        bloodUnitID: bloodUnit.bloodUnitID,
        bloodGroup: bloodUnit.bloodGroup,
        status: bloodUnit.status,
        daysUntilExpiry: bloodUnit.daysUntilExpiry()
      }
    });
    
  } catch (error) {
    console.error('Error updating blood unit status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/hospital/transfer
 * @desc    Transfer blood unit to another hospital
 * @access  Private (Verified Hospital only)
 */
router.post('/transfer', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { bloodUnitID, destinationHospitalID } = req.body;
    
    // Validate required fields
    if (!bloodUnitID || !destinationHospitalID) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bloodUnitID and destinationHospitalID'
      });
    }
    
    // Find blood unit
    const bloodUnit = await BloodUnit.findOne({ bloodUnitID });
    
    if (!bloodUnit) {
      return res.status(404).json({
        success: false,
        message: 'Blood unit not found'
      });
    }
    
    // Verify hospital owns the blood unit
    if (bloodUnit.currentHospitalID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to transfer this blood unit'
      });
    }
    
    // Check if blood unit is expired
    if (bloodUnit.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer expired blood unit'
      });
    }
    
    // Validate destination hospital exists and is verified
    const destinationHospital = await User.findById(destinationHospitalID);
    
    if (!destinationHospital) {
      return res.status(404).json({
        success: false,
        message: 'Destination hospital not found'
      });
    }
    
    if (destinationHospital.role !== 'Hospital') {
      return res.status(400).json({
        success: false,
        message: 'Destination must be a hospital'
      });
    }
    
    if (!destinationHospital.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Destination hospital is not verified'
      });
    }
    
    // Prevent transfer to same hospital
    if (destinationHospitalID === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer blood unit to the same hospital'
      });
    }
    
    // Get source hospital details
    const sourceHospital = await User.findById(req.user.id);
    
    // Update blood unit
    const transferDate = new Date();
    bloodUnit.currentHospitalID = destinationHospitalID;
    bloodUnit.status = 'Transferred';
    
    // Add to transfer history
    bloodUnit.transferHistory.push({
      fromHospitalID: req.user.id,
      toHospitalID: destinationHospitalID,
      transferDate: transferDate,
      transferredBy: req.user.id
    });
    
    // Save blood unit to MongoDB
    await bloodUnit.save();
    
    // Invalidate blood availability cache since blood unit was transferred
    await cacheInvalidation.invalidateBloodAvailability();
    
    console.log(`✅ Blood unit transferred: ${bloodUnitID} from ${sourceHospital.hospitalName} to ${destinationHospital.hospitalName}`);
    
    // Record transfer milestone on blockchain
    let blockchainResult = null;
    try {
      const metadata = {
        fromHospitalID: req.user.id,
        toHospitalID: destinationHospitalID,
        bloodGroup: bloodUnit.bloodGroup,
        timestamp: transferDate.toISOString()
      };
      
      console.log(`📝 Recording transfer milestone on blockchain for ${bloodUnitID}...`);
      blockchainResult = await blockchainService.recordTransferMilestone(bloodUnitID, metadata);
      
      // Update blood unit with transaction hash
      bloodUnit.transferTxHashes.push(blockchainResult.transactionHash);
      
      // Update the last transfer history entry with blockchain tx hash
      bloodUnit.transferHistory[bloodUnit.transferHistory.length - 1].blockchainTxHash = blockchainResult.transactionHash;
      
      await bloodUnit.save();
      
      console.log(`✅ Blockchain milestone recorded: ${blockchainResult.transactionHash}`);
      
    } catch (blockchainError) {
      console.error('❌ Blockchain recording failed:', blockchainError.message);
      
      // Queue for retry
      const metadata = {
        fromHospitalID: req.user.id,
        toHospitalID: destinationHospitalID,
        bloodGroup: bloodUnit.bloodGroup,
        timestamp: transferDate.toISOString()
      };
      
      await retryService.queueMilestone(bloodUnitID, 'Transfer', metadata);
      console.log(`📥 Milestone queued for retry`);
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Blood unit transferred successfully',
      data: {
        bloodUnitID: bloodUnit.bloodUnitID,
        bloodGroup: bloodUnit.bloodGroup,
        fromHospital: sourceHospital.hospitalName,
        toHospital: destinationHospital.hospitalName,
        transferDate: transferDate,
        status: bloodUnit.status,
        daysUntilExpiry: bloodUnit.daysUntilExpiry(),
        blockchainTxHash: blockchainResult?.transactionHash || 'Queued for retry',
        blockchainStatus: blockchainResult ? 'Recorded' : 'Pending'
      }
    });
    
  } catch (error) {
    console.error('Error transferring blood unit:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while transferring blood unit',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/hospital/predict-demand/:bloodGroup
 * @desc    Predict blood demand for next 7 days
 * @access  Private (Verified Hospital only)
 */
router.get('/predict-demand/:bloodGroup', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    
    // Validate blood group
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: `Invalid blood group. Must be one of: ${validBloodGroups.join(', ')}`
      });
    }
    
    // Query historical usage data for this hospital and blood group
    // Get last 30 days of usage data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const usedBloodUnits = await BloodUnit.find({
      currentHospitalID: req.user.id,
      bloodGroup: bloodGroup,
      status: 'Used',
      usageDate: { $gte: thirtyDaysAgo }
    }).sort({ usageDate: 1 });
    
    // Format historical data for AI service
    const historicalData = [];
    const usageByDate = {};
    
    // Group usage by date
    usedBloodUnits.forEach(unit => {
      const dateKey = unit.usageDate.toISOString().split('T')[0];
      usageByDate[dateKey] = (usageByDate[dateKey] || 0) + 1;
    });
    
    // Create array with all dates (fill missing dates with 0)
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      historicalData.push({
        date: dateKey,
        quantity: usageByDate[dateKey] || 0
      });
    }
    
    // Check if we have enough data
    if (historicalData.length < 7) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient historical data. Need at least 7 days of usage data.'
      });
    }
    
    // Call AI service for prediction
    const predictionResult = await aiService.predictDemand(req.user.id, bloodGroup, historicalData);
    
    // Get current inventory for this blood group
    const currentInventory = await BloodUnit.countDocuments({
      currentHospitalID: req.user.id,
      bloodGroup: bloodGroup,
      status: { $in: ['Collected', 'Stored', 'Transferred'] },
      expiryDate: { $gt: new Date() } // Not expired
    });
    
    // Calculate total predicted demand for 7 days
    const totalPredictedDemand = predictionResult.data.predictions
      ? predictionResult.data.predictions.reduce((sum, pred) => sum + pred.predictedDemand, 0)
      : 0;
    
    // Generate recommendation
    let recommendation = '';
    if (currentInventory >= totalPredictedDemand * 1.2) {
      recommendation = `Inventory is sufficient. Current: ${currentInventory} units, Predicted 7-day demand: ${totalPredictedDemand} units.`;
    } else if (currentInventory >= totalPredictedDemand) {
      recommendation = `Inventory is adequate but consider restocking. Current: ${currentInventory} units, Predicted 7-day demand: ${totalPredictedDemand} units.`;
    } else {
      const shortage = totalPredictedDemand - currentInventory;
      recommendation = `⚠️ Inventory shortage expected. Current: ${currentInventory} units, Predicted 7-day demand: ${totalPredictedDemand} units. Shortage: ${shortage} units. Consider creating emergency request.`;
    }
    
    res.json({
      success: true,
      message: 'Demand prediction generated successfully',
      data: {
        bloodGroup,
        currentInventory,
        historicalDataPoints: historicalData.length,
        predictions: predictionResult.data.predictions || [],
        confidence: predictionResult.data.confidence || 0.5,
        totalPredictedDemand,
        recommendation,
        aiServiceStatus: predictionResult.success ? 'available' : 'unavailable'
      }
    });
    
  } catch (error) {
    console.error('Error predicting demand:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while predicting demand',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/hospital/emergency-request
 * @desc    Create emergency blood request with AI donor recommendations
 * @access  Private (Verified Hospital only)
 */
router.post('/emergency-request', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { bloodGroup, quantity, city, pincode, urgencyLevel, notes } = req.body;
    
    // Validate required fields
    if (!bloodGroup || !quantity || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bloodGroup, quantity, city, and pincode'
      });
    }
    
    // Get hospital details
    const hospital = await User.findById(req.user.id);
    
    // Create emergency request
    const emergencyRequest = new EmergencyRequest({
      hospitalID: req.user.id,
      bloodGroup,
      quantity,
      city,
      pincode,
      urgencyLevel: urgencyLevel || 'High',
      status: 'Active',
      notes
    });
    
    await emergencyRequest.save();
    
    console.log(`🚨 Emergency request created: ${emergencyRequest._id} for ${bloodGroup} at ${city}`);
    
    // Find eligible donors
    const eligibleDonors = await User.find({
      role: 'Donor',
      bloodGroup: bloodGroup,
      $or: [
        { city: city },
        { pincode: pincode }
      ]
    });
    
    console.log(`👥 Found ${eligibleDonors.length} donors in location`);
    
    // Filter by eligibility
    const trulyEligibleDonors = eligibleDonors.filter(donor => {
      return donor.checkEligibility() === 'Eligible';
    });
    
    console.log(`✅ ${trulyEligibleDonors.length} donors are eligible`);
    
    if (trulyEligibleDonors.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Emergency request created but no eligible donors found in location',
        data: {
          requestID: emergencyRequest._id,
          bloodGroup,
          quantity,
          location: { city, pincode },
          urgencyLevel: emergencyRequest.urgencyLevel,
          notifiedDonors: 0
        }
      });
    }
    
    // Call AI service for donor recommendations
    const location = { city, pincode };
    const donorData = trulyEligibleDonors.map(donor => ({
      id: donor._id.toString(),
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      bloodGroup: donor.bloodGroup,
      city: donor.city,
      pincode: donor.pincode,
      donationsPerYear: donor.donationHistory?.length || 0,
      daysSinceLastDonation: donor.lastDonationDate 
        ? Math.floor((new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24))
        : 365
    }));
    
    const recommendationResult = await aiService.recommendDonors(bloodGroup, location, donorData);
    
    const topDonors = recommendationResult.data.topDonors || [];
    const notifiedDonorIDs = topDonors.slice(0, 10).map(d => d.donorID || d.id);
    
    // Update emergency request with notified donors
    emergencyRequest.notifiedDonors = notifiedDonorIDs;
    await emergencyRequest.save();
    
    console.log(`📧 ${notifiedDonorIDs.length} donors will be notified`);
    
    // Send email notifications to top donors
    const emailPromises = topDonors.slice(0, 10).map(async (donor, index) => {
      try {
        const requestDetails = {
          bloodGroup,
          quantity,
          hospitalName: hospital.hospitalName,
          city,
          pincode,
          urgencyLevel: emergencyRequest.urgencyLevel,
          notes: notes || ''
        };
        
        await emailService.sendEmergencyRequestEmail(donor.email, donor.name, requestDetails);
        console.log(`   ${index + 1}. ✅ Email sent to ${donor.name} (${donor.email}) - Score: ${donor.suitabilityScore}`);
      } catch (emailError) {
        console.error(`   ${index + 1}. ❌ Failed to send email to ${donor.email}:`, emailError.message);
      }
    });
    
    // Wait for all emails to be sent (don't block response)
    Promise.all(emailPromises).catch(err => {
      console.error('Error sending some emergency request emails:', err);
    });
    
    res.status(201).json({
      success: true,
      message: 'Emergency request created and donors notified',
      data: {
        requestID: emergencyRequest._id,
        bloodGroup,
        quantity,
        location: { city, pincode },
        urgencyLevel: emergencyRequest.urgencyLevel,
        notifiedDonors: notifiedDonorIDs.length,
        topDonors: topDonors.slice(0, 10).map(d => ({
          name: d.name,
          email: d.email,
          phone: d.phone,
          suitabilityScore: d.suitabilityScore
        })),
        aiServiceStatus: recommendationResult.success ? 'available' : 'unavailable'
      }
    });
    
  } catch (error) {
    console.error('Error creating emergency request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating emergency request',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/hospital/emergency-requests
 * @desc    Get hospital's emergency requests
 * @access  Private (Verified Hospital only)
 */
router.get('/emergency-requests', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query = { hospitalID: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    // Query emergency requests
    const requests = await EmergencyRequest.find(query)
      .populate('notifiedDonors', 'name email phone bloodGroup city')
      .sort({ createdDate: -1 });
    
    res.json({
      success: true,
      message: 'Emergency requests retrieved successfully',
      data: {
        requests: requests.map(req => ({
          requestID: req._id,
          bloodGroup: req.bloodGroup,
          quantity: req.quantity,
          location: { city: req.city, pincode: req.pincode },
          urgencyLevel: req.urgencyLevel,
          status: req.status,
          createdDate: req.createdDate,
          fulfillmentDate: req.fulfillmentDate,
          notifiedDonorsCount: req.notifiedDonors.length,
          notes: req.notes
        })),
        total: requests.length
      }
    });
    
  } catch (error) {
    console.error('Error retrieving emergency requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving emergency requests',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/hospital/emergency-request/:requestID/fulfill
 * @desc    Mark emergency request as fulfilled
 * @access  Private (Verified Hospital only)
 */
router.patch('/emergency-request/:requestID/fulfill', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { requestID } = req.params;
    
    // Find emergency request
    const emergencyRequest = await EmergencyRequest.findById(requestID);
    
    if (!emergencyRequest) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }
    
    // Verify hospital owns the request
    if (emergencyRequest.hospitalID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to fulfill this request'
      });
    }
    
    // Check if already fulfilled
    if (emergencyRequest.status === 'Fulfilled') {
      return res.status(400).json({
        success: false,
        message: 'Emergency request is already fulfilled'
      });
    }
    
    // Update status
    emergencyRequest.status = 'Fulfilled';
    emergencyRequest.fulfillmentDate = new Date();
    await emergencyRequest.save();
    
    console.log(`✅ Emergency request fulfilled: ${requestID}`);
    
    res.json({
      success: true,
      message: 'Emergency request marked as fulfilled',
      data: {
        requestID: emergencyRequest._id,
        bloodGroup: emergencyRequest.bloodGroup,
        quantity: emergencyRequest.quantity,
        status: emergencyRequest.status,
        fulfillmentDate: emergencyRequest.fulfillmentDate
      }
    });
    
  } catch (error) {
    console.error('Error fulfilling emergency request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fulfilling emergency request',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/hospital/campaigns
 * @desc    Create a new blood donation campaign
 * @access  Private (Verified Hospital only)
 */
router.post('/campaigns', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const {
      title,
      description,
      venue,
      campaignDate,
      startTime,
      endTime,
      bloodGroupsNeeded,
      targetQuantity
    } = req.body;
    
    // Validate required fields
    if (!title || !venue || !campaignDate || !bloodGroupsNeeded || !targetQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, venue, campaignDate, bloodGroupsNeeded, and targetQuantity'
      });
    }
    
    // Validate venue structure
    if (!venue.name || !venue.address || !venue.city || !venue.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Venue must include name, address, city, and pincode'
      });
    }
    
    // Validate blood groups
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const invalidGroups = bloodGroupsNeeded.filter(group => !validBloodGroups.includes(group));
    if (invalidGroups.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid blood groups: ${invalidGroups.join(', ')}`
      });
    }
    
    // Validate campaign date is not in the past (allow today)
    const campaignDateTime = new Date(campaignDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    if (campaignDateTime < today) {
      return res.status(400).json({
        success: false,
        message: 'Campaign date cannot be in the past'
      });
    }
    
    // Create campaign
    const campaign = new Campaign({
      creatorHospitalID: req.user.id,
      title: title.trim(),
      description: description?.trim() || '',
      venue: {
        name: venue.name.trim(),
        address: venue.address.trim(),
        city: venue.city.trim(),
        pincode: venue.pincode.trim()
      },
      campaignDate: campaignDateTime,
      startTime: startTime || '09:00',
      endTime: endTime || '17:00',
      bloodGroupsNeeded,
      targetQuantity: parseInt(targetQuantity)
    });
    
    await campaign.save();
    
    // Invalidate campaigns cache since new campaign was created
    try {
      await cacheInvalidation.invalidateCampaigns(campaign.venue.city);
    } catch (cacheError) {
      console.warn('Cache invalidation failed:', cacheError.message);
      // Continue even if cache invalidation fails
    }
    
    console.log(`✅ Campaign created: ${campaign.campaignID} by hospital ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: {
        campaignID: campaign.campaignID,
        title: campaign.title,
        venue: campaign.venue,
        campaignDate: campaign.campaignDate,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
        bloodGroupsNeeded: campaign.bloodGroupsNeeded,
        targetQuantity: campaign.targetQuantity,
        status: campaign.status,
        createdAt: campaign.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating campaign',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/hospital/campaigns
 * @desc    Get hospital's campaigns with filtering
 * @access  Private (Verified Hospital only)
 */
router.get('/campaigns', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { creatorHospitalID: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Query campaigns
    const campaigns = await Campaign.find(query)
      .sort({ campaignDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Campaign.countDocuments(query);
    
    // Format campaigns with additional info
    const formattedCampaigns = campaigns.map(campaign => ({
      campaignID: campaign.campaignID,
      title: campaign.title,
      description: campaign.description,
      venue: campaign.venue,
      campaignDate: campaign.campaignDate,
      startTime: campaign.startTime,
      endTime: campaign.endTime,
      bloodGroupsNeeded: campaign.bloodGroupsNeeded,
      targetQuantity: campaign.targetQuantity,
      status: campaign.status,
      registeredCount: campaign.registeredCount,
      attendedCount: campaign.attendedCount,
      verifiedDonations: campaign.verifiedDonations,
      invitationsSent: campaign.invitationsSent,
      collectionRate: campaign.getCollectionRate(),
      attendanceRate: campaign.getAttendanceRate(),
      isTargetMet: campaign.isTargetMet(),
      isToday: campaign.isToday(),
      hasPassed: campaign.hasPassed(),
      createdAt: campaign.createdAt
    }));
    
    res.json({
      success: true,
      message: 'Campaigns retrieved successfully',
      data: {
        campaigns: formattedCampaigns,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Error retrieving campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving campaigns',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/hospital/campaigns/:campaignID
 * @desc    Update campaign details
 * @access  Private (Verified Hospital only)
 */
router.patch('/campaigns/:campaignID', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { campaignID } = req.params;
    const updates = req.body;
    
    // Find campaign
    const campaign = await Campaign.findOne({ campaignID });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Verify hospital owns the campaign
    if (campaign.creatorHospitalID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this campaign'
      });
    }
    
    // Prevent updates to active/completed/cancelled campaigns
    if (campaign.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot update campaign with status "${campaign.status}". Only draft campaigns can be updated.`
      });
    }
    
    // Validate updates
    if (updates.campaignDate) {
      const campaignDateTime = new Date(updates.campaignDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day
      
      if (campaignDateTime < today) {
        return res.status(400).json({
          success: false,
          message: 'Campaign date cannot be in the past'
        });
      }
      campaign.campaignDate = campaignDateTime;
    }
    
    if (updates.bloodGroupsNeeded) {
      const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const invalidGroups = updates.bloodGroupsNeeded.filter(group => !validBloodGroups.includes(group));
      if (invalidGroups.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid blood groups: ${invalidGroups.join(', ')}`
        });
      }
      campaign.bloodGroupsNeeded = updates.bloodGroupsNeeded;
    }
    
    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'venue', 'startTime', 'endTime', 'targetQuantity'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        campaign[field] = updates[field];
      }
    });
    
    await campaign.save();
    
    console.log(`✅ Campaign updated: ${campaignID}`);
    
    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: {
        campaignID: campaign.campaignID,
        title: campaign.title,
        description: campaign.description,
        venue: campaign.venue,
        campaignDate: campaign.campaignDate,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
        bloodGroupsNeeded: campaign.bloodGroupsNeeded,
        targetQuantity: campaign.targetQuantity,
        status: campaign.status,
        updatedAt: campaign.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating campaign',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/hospital/campaigns/:campaignID
 * @desc    Delete campaign (only if draft and no participants)
 * @access  Private (Verified Hospital only)
 */
router.delete('/campaigns/:campaignID', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { campaignID } = req.params;
    
    // Find campaign
    const campaign = await Campaign.findOne({ campaignID });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Verify hospital owns the campaign
    if (campaign.creatorHospitalID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this campaign'
      });
    }
    
    // Only allow deletion of draft campaigns
    if (campaign.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete campaign with status "${campaign.status}". Only draft campaigns can be deleted.`
      });
    }
    
    // Check if campaign has participants
    const participantCount = await CampaignParticipant.countDocuments({ campaignID: campaign._id });
    if (participantCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete campaign with registered participants'
      });
    }
    
    // Delete campaign
    await Campaign.findByIdAndDelete(campaign._id);
    
    console.log(`✅ Campaign deleted: ${campaignID}`);
    
    res.json({
      success: true,
      message: 'Campaign deleted successfully',
      data: {
        campaignID: campaign.campaignID,
        title: campaign.title
      }
    });
    
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting campaign',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/hospital/campaigns/:campaignID/status
 * @desc    Update campaign status with automatic invitation triggering
 * @access  Private (Verified Hospital only)
 */
router.patch('/campaigns/:campaignID/status', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { campaignID } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Draft', 'Active', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Find campaign
    const campaign = await Campaign.findOne({ campaignID });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Verify hospital owns the campaign
    if (campaign.creatorHospitalID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this campaign'
      });
    }
    
    // Validate status transition
    if (!campaign.canTransitionTo(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${campaign.status}" to "${status}"`
      });
    }
    
    // Special validation for completion
    if (status === 'Completed' && !campaign.hasPassed()) {
      return res.status(400).json({
        success: false,
        message: 'Campaign can only be marked as completed after the campaign date and time have passed'
      });
    }
    
    const oldStatus = campaign.status;
    campaign.status = status;
    await campaign.save();
    
    // Invalidate campaigns cache since campaign status changed
    await cacheInvalidation.invalidateCampaigns(campaign.venue.city);
    
    console.log(`✅ Campaign status updated: ${campaignID} from ${oldStatus} to ${status}`);
    
    let invitationResult = null;
    
    // Trigger automatic invitations when status changes to Active
    if (status === 'Active' && oldStatus === 'Draft') {
      try {
        invitationResult = await sendCampaignInvitations(campaign);
        console.log(`📧 Invitations sent: ${invitationResult.invitationsSent} donors notified`);
      } catch (invitationError) {
        console.error('❌ Failed to send invitations:', invitationError.message);
        // Don't fail the status update if invitations fail
        invitationResult = { invitationsSent: 0, error: invitationError.message };
      }
    }
    
    // Send cancellation emails if campaign is cancelled
    if (status === 'Cancelled') {
      try {
        const participants = await CampaignParticipant.find({ campaignID: campaign._id })
          .populate('donorID', 'name email');
        
        const emailPromises = participants.map(participant => 
          emailService.sendCampaignCancellationEmail(
            participant.donorID.email,
            participant.donorID.name,
            {
              title: campaign.title,
              campaignDate: campaign.campaignDate,
              venue: campaign.venue
            }
          )
        );
        
        await Promise.all(emailPromises);
        console.log(`📧 Cancellation emails sent to ${participants.length} participants`);
      } catch (emailError) {
        console.error('❌ Failed to send cancellation emails:', emailError.message);
      }
    }
    
    res.json({
      success: true,
      message: `Campaign status updated to ${status}`,
      data: {
        campaignID: campaign.campaignID,
        title: campaign.title,
        status: campaign.status,
        previousStatus: oldStatus,
        invitationsSent: invitationResult?.invitationsSent || 0,
        invitationError: invitationResult?.error || null,
        updatedAt: campaign.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error updating campaign status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating campaign status',
      error: error.message
    });
  }
});

/**
 * Helper function to send campaign invitations
 */
async function sendCampaignInvitations(campaign) {
  // Find eligible donors by location and blood group
  const eligibleDonors = await User.find({
    role: 'Donor',
    bloodGroup: { $in: campaign.bloodGroupsNeeded },
    $or: [
      { city: campaign.venue.city },
      { pincode: campaign.venue.pincode }
    ]
  });
  
  console.log(`👥 Found ${eligibleDonors.length} donors in location with matching blood groups`);
  
  // Filter by eligibility (age, weight, 56-day rule)
  const trulyEligibleDonors = eligibleDonors.filter(donor => 
    donor.checkEligibility() === 'Eligible'
  );
  
  console.log(`✅ ${trulyEligibleDonors.length} donors are eligible for donation`);
  
  if (trulyEligibleDonors.length === 0) {
    return { invitationsSent: 0, eligibleDonorsFound: 0 };
  }
  
  // Get hospital details
  const hospital = await User.findById(campaign.creatorHospitalID);
  
  // Send invitation emails
  const emailPromises = trulyEligibleDonors.map(async (donor, index) => {
    try {
      const campaignDetails = {
        title: campaign.title,
        description: campaign.description,
        venue: campaign.venue,
        campaignDate: campaign.campaignDate,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
        bloodGroupsNeeded: campaign.bloodGroupsNeeded,
        targetQuantity: campaign.targetQuantity,
        hospitalName: hospital.hospitalName,
        hospitalPhone: hospital.phone || 'Contact hospital directly',
        hospitalEmail: hospital.email,
        registrationLink: `${process.env.FRONTEND_URL}/campaigns/${campaign.campaignID}/register`
      };
      
      await emailService.sendCampaignInvitationEmail(donor.email, donor.name, campaignDetails);
      console.log(`   ${index + 1}. ✅ Invitation sent to ${donor.name} (${donor.email})`);
      return donor._id;
    } catch (emailError) {
      console.error(`   ${index + 1}. ❌ Failed to send invitation to ${donor.email}:`, emailError.message);
      return null;
    }
  });
  
  // Wait for all emails and filter successful ones
  const results = await Promise.all(emailPromises);
  const successfulInvitations = results.filter(result => result !== null);
  
  // Update campaign with invitation stats
  campaign.invitationsSent = successfulInvitations.length;
  campaign.invitedDonorIDs = successfulInvitations;
  await campaign.save();
  
  return {
    invitationsSent: successfulInvitations.length,
    eligibleDonorsFound: trulyEligibleDonors.length
  };
}

/**
 * @route   GET /api/hospital/campaigns/:campaignID/participants
 * @desc    Get campaign participants with attendance tracking
 * @access  Private (Verified Hospital only)
 */
router.get('/campaigns/:campaignID/participants', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { campaignID } = req.params;
    const { status } = req.query;
    
    // Find campaign
    const campaign = await Campaign.findOne({ campaignID });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Verify hospital owns the campaign
    if (campaign.creatorHospitalID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view participants for this campaign'
      });
    }
    
    // Build query for participants
    const query = { campaignID: campaign._id };
    
    if (status) {
      query.attendanceStatus = status;
    }
    
    // Query participants with donor details
    const participants = await CampaignParticipant.find(query)
      .populate('donorID', 'name email phone bloodGroup city pincode')
      .sort({ registrationDate: -1 });
    
    // Get campaign statistics
    const stats = await CampaignParticipant.getCampaignStats(campaign._id);
    
    // Format participants with additional info
    const formattedParticipants = participants.map(participant => {
      const statusInfo = participant.getStatusInfo();
      
      return {
        participantID: participant._id,
        donor: {
          id: participant.donorID._id,
          name: participant.donorID.name,
          email: participant.donorID.email,
          phone: participant.donorID.phone,
          bloodGroup: participant.donorID.bloodGroup,
          city: participant.donorID.city,
          pincode: participant.donorID.pincode
        },
        registration: {
          date: participant.registrationDate,
          source: participant.registrationSource
        },
        attendance: {
          status: participant.attendanceStatus,
          statusInfo: statusInfo,
          markedDoneDate: participant.markedDoneDate,
          verificationDate: participant.verificationDate,
          bloodUnitID: participant.bloodUnitID,
          canVerify: participant.canBeVerified(),
          canMarkAbsent: participant.canBeMarkedAbsent()
        }
      };
    });
    
    res.json({
      success: true,
      message: 'Campaign participants retrieved successfully',
      data: {
        campaign: {
          campaignID: campaign.campaignID,
          title: campaign.title,
          campaignDate: campaign.campaignDate,
          status: campaign.status,
          isToday: campaign.isToday(),
          hasPassed: campaign.hasPassed()
        },
        participants: formattedParticipants,
        statistics: stats,
        summary: {
          totalParticipants: stats.total,
          registeredCount: stats.registered,
          markedDoneCount: stats.markedDone,
          verifiedCount: stats.verified,
          absentCount: stats.absent,
          attendanceRate: stats.total > 0 ? Math.round((stats.verified + stats.markedDone) / stats.total * 100) : 0,
          verificationRate: stats.markedDone > 0 ? Math.round(stats.verified / stats.markedDone * 100) : 0
        }
      }
    });
    
  } catch (error) {
    console.error('Error retrieving campaign participants:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving participants',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/hospital/campaigns/:campaignID/verify-donation
 * @desc    Verify campaign donation and create blood unit
 * @access  Private (Verified Hospital only)
 */
router.post('/campaigns/:campaignID/verify-donation', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { campaignID } = req.params;
    const { donorID, bloodGroup, collectionDate } = req.body;
    
    // Validate required fields
    if (!donorID || !bloodGroup || !collectionDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide donorID, bloodGroup, and collectionDate'
      });
    }
    
    // Find campaign
    const campaign = await Campaign.findOne({ campaignID });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Verify hospital owns the campaign
    if (campaign.creatorHospitalID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to verify donations for this campaign'
      });
    }
    
    // Find participant record
    const participant = await CampaignParticipant.findOne({
      campaignID: campaign._id,
      donorID: donorID,
      attendanceStatus: 'Marked Done by Donor'
    }).populate('donorID', 'name email bloodGroup lastDonationDate');
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found or not marked as done by donor'
      });
    }
    
    // Verify blood group matches
    if (participant.donorID.bloodGroup !== bloodGroup) {
      return res.status(400).json({
        success: false,
        message: `Blood group mismatch. Donor's blood group is ${participant.donorID.bloodGroup}, not ${bloodGroup}`
      });
    }
    
    // Generate unique blood unit ID
    const bloodUnitID = `BU-${Date.now()}-${uuidv4().substring(0, 8)}`;
    
    // Calculate expiry date (42 days from collection)
    const expiryDate = new Date(collectionDate);
    expiryDate.setDate(expiryDate.getDate() + 42);
    
    // Create blood unit
    const bloodUnit = new BloodUnit({
      bloodUnitID,
      donorID: participant.donorID._id,
      bloodGroup,
      collectionDate: new Date(collectionDate),
      expiryDate,
      status: 'Collected',
      originalHospitalID: req.user.id,
      currentHospitalID: req.user.id,
      campaignID: campaign._id,
      campaignDonation: true
    });
    
    await bloodUnit.save();
    
    // Invalidate blood availability cache since new blood unit was created from campaign
    await cacheInvalidation.invalidateBloodAvailability();
    
    console.log(`✅ Campaign blood unit created: ${bloodUnitID} from campaign ${campaign.title}`);
    
    // Update participant record
    participant.updateAttendanceStatus('Verified by Hospital', {
      bloodUnitID: bloodUnitID,
      verifiedByHospitalID: req.user.id
    });
    await participant.save();
    
    // Update donor's last donation date
    const donor = await User.findById(participant.donorID._id);
    donor.lastDonationDate = new Date(collectionDate);
    await donor.save();
    
    // Update campaign statistics
    await Campaign.findByIdAndUpdate(campaign._id, {
      $inc: { verifiedDonations: 1 }
    });
    
    console.log(`✅ Campaign donation verified: ${participant.donorID.name} -> ${campaign.title}`);
    
    // Record on blockchain
    let blockchainResult = null;
    try {
      const metadata = {
        donorID: participant.donorID._id.toString(),
        hospitalID: req.user.id,
        campaignID: campaign._id.toString(),
        bloodGroup,
        timestamp: new Date(collectionDate).toISOString()
      };
      
      console.log(`📝 Recording campaign donation milestone on blockchain for ${bloodUnitID}...`);
      blockchainResult = await blockchainService.recordDonationMilestone(bloodUnitID, metadata);
      
      // Update blood unit with transaction hash
      bloodUnit.donationTxHash = blockchainResult.transactionHash;
      await bloodUnit.save();
      
      console.log(`✅ Blockchain milestone recorded: ${blockchainResult.transactionHash}`);
      
    } catch (blockchainError) {
      console.error('❌ Blockchain recording failed:', blockchainError.message);
      
      // Queue for retry
      const metadata = {
        donorID: participant.donorID._id.toString(),
        hospitalID: req.user.id,
        campaignID: campaign._id.toString(),
        bloodGroup,
        timestamp: new Date(collectionDate).toISOString()
      };
      
      await retryService.queueMilestone(bloodUnitID, 'Donation', metadata);
      console.log(`📥 Milestone queued for retry`);
    }
    
    // Send thank you email
    try {
      const donationDetails = {
        campaignTitle: campaign.title,
        bloodUnitID: bloodUnitID,
        hospitalName: (await User.findById(req.user.id)).hospitalName,
        donationDate: collectionDate
      };
      
      await emailService.sendDonationVerificationThankYouEmail(
        participant.donorID.email,
        participant.donorID.name,
        donationDetails
      );
      
      console.log(`📧 Thank you email sent to ${participant.donorID.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send thank you email:', emailError.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Campaign donation verified successfully',
      data: {
        bloodUnitID: bloodUnit.bloodUnitID,
        donorName: participant.donorID.name,
        bloodGroup: bloodUnit.bloodGroup,
        collectionDate: bloodUnit.collectionDate,
        expiryDate: bloodUnit.expiryDate,
        status: bloodUnit.status,
        campaignTitle: campaign.title,
        attendanceStatus: participant.attendanceStatus,
        verificationDate: participant.verificationDate,
        blockchainTxHash: blockchainResult?.transactionHash || 'Queued for retry',
        blockchainStatus: blockchainResult ? 'Recorded' : 'Pending'
      }
    });
    
  } catch (error) {
    console.error('Error verifying campaign donation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying donation',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/hospital/campaigns/:campaignID/participants/:donorID/absent
 * @desc    Mark participant as absent
 * @access  Private (Verified Hospital only)
 */
router.patch('/campaigns/:campaignID/participants/:donorID/absent', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { campaignID, donorID } = req.params;
    
    // Find campaign
    const campaign = await Campaign.findOne({ campaignID });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Verify hospital owns the campaign
    if (campaign.creatorHospitalID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to manage participants for this campaign'
      });
    }
    
    // Find participant record
    const participant = await CampaignParticipant.findOne({
      campaignID: campaign._id,
      donorID: donorID
    }).populate('donorID', 'name email');
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }
    
    // Check if participant can be marked absent
    if (!participant.canBeMarkedAbsent()) {
      return res.status(400).json({
        success: false,
        message: `Cannot mark participant as absent. Current status: ${participant.attendanceStatus}`
      });
    }
    
    // Update attendance status
    const wasMarkedDone = participant.attendanceStatus === 'Marked Done by Donor';
    participant.updateAttendanceStatus('Absent');
    await participant.save();
    
    // Update campaign statistics
    const updateFields = { registeredCount: -1 };
    if (wasMarkedDone) {
      updateFields.attendedCount = -1;
    }
    
    await Campaign.findByIdAndUpdate(campaign._id, { $inc: updateFields });
    
    console.log(`✅ Participant marked as absent: ${participant.donorID.name} -> ${campaign.title}`);
    
    res.json({
      success: true,
      message: 'Participant marked as absent',
      data: {
        campaignID: campaign.campaignID,
        campaignTitle: campaign.title,
        donor: {
          name: participant.donorID.name,
          email: participant.donorID.email
        },
        attendanceStatus: participant.attendanceStatus,
        markedAbsentDate: participant.markedAbsentDate
      }
    });
    
  } catch (error) {
    console.error('Error marking participant as absent:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking participant as absent',
      error: error.message
    });
  }
});

module.exports = router;

/**
 * @route   POST /api/hospital/use
 * @desc    Record blood unit usage
 * @access  Private (Verified Hospital only)
 */
router.post('/use', auth, roleCheck(['Hospital']), checkHospitalVerified, async (req, res) => {
  try {
    const { bloodUnitID, patientID } = req.body;
    
    // Validate required fields
    if (!bloodUnitID || !patientID) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bloodUnitID and patientID'
      });
    }
    
    // Find blood unit
    const bloodUnit = await BloodUnit.findOne({ bloodUnitID });
    
    if (!bloodUnit) {
      return res.status(404).json({
        success: false,
        message: 'Blood unit not found'
      });
    }
    
    // Verify hospital owns the blood unit
    if (bloodUnit.currentHospitalID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to use this blood unit'
      });
    }
    
    // Check if blood unit is already used
    if (bloodUnit.status === 'Used') {
      return res.status(400).json({
        success: false,
        message: 'Blood unit has already been used'
      });
    }
    
    // Check if blood unit is expired
    if (bloodUnit.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot use expired blood unit'
      });
    }
    
    // Get hospital details
    const hospital = await User.findById(req.user.id);
    
    // Update blood unit
    const usageDate = new Date();
    bloodUnit.status = 'Used';
    bloodUnit.usageDate = usageDate;
    bloodUnit.patientID = patientID;
    
    // Save blood unit to MongoDB
    await bloodUnit.save();
    
    // Invalidate blood availability cache since blood unit was used
    await cacheInvalidation.invalidateBloodAvailability();
    
    console.log(`✅ Blood unit used: ${bloodUnitID} at ${hospital.hospitalName}`);
    
    // Record usage milestone on blockchain
    let blockchainResult = null;
    try {
      const metadata = {
        hospitalID: req.user.id,
        patientID: patientID,
        bloodGroup: bloodUnit.bloodGroup,
        timestamp: usageDate.toISOString()
      };
      
      console.log(`📝 Recording usage milestone on blockchain for ${bloodUnitID}...`);
      blockchainResult = await blockchainService.recordUsageMilestone(bloodUnitID, metadata);
      
      // Update blood unit with transaction hash
      bloodUnit.usageTxHash = blockchainResult.transactionHash;
      await bloodUnit.save();
      
      console.log(`✅ Blockchain milestone recorded: ${blockchainResult.transactionHash}`);
      
    } catch (blockchainError) {
      console.error('❌ Blockchain recording failed:', blockchainError.message);
      
      // Queue for retry
      const metadata = {
        hospitalID: req.user.id,
        patientID: patientID,
        bloodGroup: bloodUnit.bloodGroup,
        timestamp: usageDate.toISOString()
      };
      
      await retryService.queueMilestone(bloodUnitID, 'Usage', metadata);
      console.log(`📥 Milestone queued for retry`);
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Blood unit usage recorded successfully',
      data: {
        bloodUnitID: bloodUnit.bloodUnitID,
        bloodGroup: bloodUnit.bloodGroup,
        hospitalName: hospital.hospitalName,
        patientID: bloodUnit.patientID,
        usageDate: bloodUnit.usageDate,
        status: bloodUnit.status,
        blockchainTxHash: blockchainResult?.transactionHash || 'Queued for retry',
        blockchainStatus: blockchainResult ? 'Recorded' : 'Pending'
      }
    });
    
  } catch (error) {
    console.error('Error recording blood usage:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording blood usage',
      error: error.message
    });
  }
});
