const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BloodUnit = require('../models/BloodUnit');
const Campaign = require('../models/Campaign');
const CampaignParticipant = require('../models/CampaignParticipant');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const emailService = require('../services/emailService');
const { activeCampaignsCache, cacheInvalidation } = require('../middleware/cache');

/**
 * @route   GET /api/campaigns/active
 * @desc    Get active campaigns for public discovery (with optional auth)
 * @access  Public (enhanced with auth)
 */
router.get('/active', activeCampaignsCache, async (req, res) => {
  try {
    const { city, pincode, bloodGroup, page = 1, limit = 10 } = req.query;
    
    // Build query for active campaigns
    const query = { status: 'Active' };
    
    // Add location filters
    if (city || pincode) {
      const locationQuery = [];
      if (city) locationQuery.push({ 'venue.city': city });
      if (pincode) locationQuery.push({ 'venue.pincode': pincode });
      query.$or = locationQuery;
    }
    
    // Add blood group filter
    if (bloodGroup) {
      query.bloodGroupsNeeded = bloodGroup;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Query campaigns
    const campaigns = await Campaign.find(query)
      .populate('creatorHospitalID', 'hospitalName city pincode email phone')
      .sort({ campaignDate: 1 }) // Nearest campaigns first
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Campaign.countDocuments(query);
    
    // Check if user is authenticated and get their registrations
    let userRegistrations = [];
    if (req.headers.authorization) {
      try {
        // Try to authenticate user (optional)
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.role === 'Donor') {
          const campaignIds = campaigns.map(c => c._id);
          userRegistrations = await CampaignParticipant.find({
            campaignID: { $in: campaignIds },
            donorID: user._id
          });
        }
      } catch (authError) {
        // Ignore auth errors for public endpoint
        console.log('Optional auth failed:', authError.message);
      }
    }
    
    // Format campaigns with additional info
    const formattedCampaigns = campaigns.map(campaign => {
      const isRegistered = userRegistrations.some(reg => 
        reg.campaignID.toString() === campaign._id.toString()
      );
      
      return {
        campaignID: campaign.campaignID,
        title: campaign.title,
        description: campaign.description,
        venue: campaign.venue,
        campaignDate: campaign.campaignDate,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
        bloodGroupsNeeded: campaign.bloodGroupsNeeded,
        targetQuantity: campaign.targetQuantity,
        registeredCount: campaign.registeredCount,
        hospital: {
          name: campaign.creatorHospitalID.hospitalName,
          city: campaign.creatorHospitalID.city,
          pincode: campaign.creatorHospitalID.pincode,
          email: campaign.creatorHospitalID.email,
          phone: campaign.creatorHospitalID.phone
        },
        isRegistered: isRegistered,
        isToday: campaign.isToday(),
        daysUntilCampaign: Math.ceil((new Date(campaign.campaignDate) - new Date()) / (1000 * 60 * 60 * 24)),
        createdAt: campaign.createdAt
      };
    });
    
    res.json({
      success: true,
      message: 'Active campaigns retrieved successfully',
      data: {
        campaigns: formattedCampaigns,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        filters: {
          city: city || null,
          pincode: pincode || null,
          bloodGroup: bloodGroup || null
        }
      }
    });
    
  } catch (error) {
    console.error('Error retrieving active campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving campaigns',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/:campaignID/register
 * @desc    Register donor for a campaign
 * @access  Private (Donor only)
 */
router.post('/:campaignID/register', auth, roleCheck(['Donor']), async (req, res) => {
  try {
    const { campaignID } = req.params;
    
    // Find campaign
    const campaign = await Campaign.findOne({ campaignID })
      .populate('creatorHospitalID', 'hospitalName email phone');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Check if campaign is active
    if (campaign.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Cannot register for campaign with status "${campaign.status}"`
      });
    }
    
    // Check if campaign date has passed
    if (campaign.hasPassed()) {
      return res.status(400).json({
        success: false,
        message: 'Campaign date has passed'
      });
    }
    
    // Get donor details
    const donor = await User.findById(req.user.id);
    
    // Check donor eligibility
    const eligibilityStatus = donor.checkEligibility();
    if (eligibilityStatus !== 'Eligible') {
      return res.status(400).json({
        success: false,
        message: `You are not eligible for donation: ${eligibilityStatus}`
      });
    }
    
    // Check if donor's blood group is needed
    if (!campaign.bloodGroupsNeeded.includes(donor.bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: `Your blood group (${donor.bloodGroup}) is not needed for this campaign`
      });
    }
    
    // Check if already registered
    const existingRegistration = await CampaignParticipant.findOne({
      campaignID: campaign._id,
      donorID: donor._id
    });
    
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this campaign'
      });
    }
    
    // Determine registration source
    const registrationSource = campaign.invitedDonorIDs.includes(donor._id) ? 'invitation' : 'discovery';
    
    // Create participant record
    const participant = new CampaignParticipant({
      campaignID: campaign._id,
      donorID: donor._id,
      registrationSource
    });
    
    await participant.save();
    
    // Update campaign registered count
    await Campaign.findByIdAndUpdate(campaign._id, {
      $inc: { registeredCount: 1 }
    });
    
    // Invalidate campaigns cache since registration count changed
    await cacheInvalidation.invalidateCampaigns(campaign.venue.city, donor.bloodGroup);
    
    console.log(`✅ Donor registered for campaign: ${donor.name} -> ${campaign.title}`);
    
    // Send confirmation email
    try {
      const campaignDetails = {
        title: campaign.title,
        description: campaign.description,
        venue: campaign.venue,
        campaignDate: campaign.campaignDate,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
        hospitalName: campaign.creatorHospitalID.hospitalName,
        hospitalPhone: campaign.creatorHospitalID.phone,
        hospitalEmail: campaign.creatorHospitalID.email
      };
      
      await emailService.sendCampaignRegistrationConfirmationEmail(
        donor.email,
        donor.name,
        campaignDetails
      );
      
      console.log(`📧 Registration confirmation email sent to ${donor.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Successfully registered for campaign',
      data: {
        campaignID: campaign.campaignID,
        campaignTitle: campaign.title,
        campaignDate: campaign.campaignDate,
        venue: campaign.venue,
        registrationDate: participant.registrationDate,
        attendanceStatus: participant.attendanceStatus,
        registrationSource: participant.registrationSource
      }
    });
    
  } catch (error) {
    console.error('Error registering for campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while registering for campaign',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/:campaignID/mark-done
 * @desc    Mark donation as done by donor (on campaign day)
 * @access  Private (Donor only)
 */
router.post('/:campaignID/mark-done', auth, roleCheck(['Donor']), async (req, res) => {
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
    
    // Check if campaign is today
    if (!campaign.isToday()) {
      return res.status(400).json({
        success: false,
        message: 'You can only mark donation as done on the campaign day'
      });
    }
    
    // Find participant record
    const participant = await CampaignParticipant.findOne({
      campaignID: campaign._id,
      donorID: req.user.id
    });
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'You are not registered for this campaign'
      });
    }
    
    // Check if already marked as done
    if (participant.attendanceStatus !== 'Registered') {
      return res.status(400).json({
        success: false,
        message: `Cannot mark as done. Current status: ${participant.attendanceStatus}`
      });
    }
    
    // Update attendance status
    participant.updateAttendanceStatus('Marked Done by Donor');
    await participant.save();
    
    // Update campaign attended count
    await Campaign.findByIdAndUpdate(campaign._id, {
      $inc: { attendedCount: 1 }
    });
    
    // Invalidate campaigns cache since attendance count changed
    await cacheInvalidation.invalidateCampaigns(campaign.venue.city);
    
    console.log(`✅ Donor marked donation as done: ${req.user.id} -> ${campaign.title}`);
    
    res.json({
      success: true,
      message: 'Donation marked as completed. Please wait for hospital verification.',
      data: {
        campaignID: campaign.campaignID,
        campaignTitle: campaign.title,
        attendanceStatus: participant.attendanceStatus,
        markedDoneDate: participant.markedDoneDate,
        awaitingVerification: true
      }
    });
    
  } catch (error) {
    console.error('Error marking donation as done:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking donation as done',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/campaigns/:campaignID/register
 * @desc    Cancel campaign registration
 * @access  Private (Donor only)
 */
router.delete('/:campaignID/register', auth, roleCheck(['Donor']), async (req, res) => {
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
    
    // Check if campaign date has passed
    if (campaign.hasPassed()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration after campaign has ended'
      });
    }
    
    // Find participant record
    const participant = await CampaignParticipant.findOne({
      campaignID: campaign._id,
      donorID: req.user.id
    });
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'You are not registered for this campaign'
      });
    }
    
    // Check if donation is already verified
    if (participant.attendanceStatus === 'Verified by Hospital') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration after donation has been verified'
      });
    }
    
    // Delete participant record
    await CampaignParticipant.findByIdAndDelete(participant._id);
    
    // Update campaign registered count
    const decrementField = participant.attendanceStatus === 'Marked Done by Donor' 
      ? { registeredCount: -1, attendedCount: -1 }
      : { registeredCount: -1 };
    
    await Campaign.findByIdAndUpdate(campaign._id, { $inc: decrementField });
    
    // Invalidate campaigns cache since registration count changed
    await cacheInvalidation.invalidateCampaigns(campaign.venue.city);
    
    console.log(`✅ Campaign registration cancelled: ${req.user.id} -> ${campaign.title}`);
    
    res.json({
      success: true,
      message: 'Campaign registration cancelled successfully',
      data: {
        campaignID: campaign.campaignID,
        campaignTitle: campaign.title,
        cancelledAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error cancelling campaign registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling registration',
      error: error.message
    });
  }
});

module.exports = router;