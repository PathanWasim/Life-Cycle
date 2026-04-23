const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BloodUnit = require('../models/BloodUnit');
const Campaign = require('../models/Campaign');
const CampaignParticipant = require('../models/CampaignParticipant');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const certificateService = require('../services/certificateService');

/**
 * @route   GET /api/donor/profile
 * @desc    Get donor profile with eligibility information
 * @access  Private (Donor only)
 */
router.get('/profile', auth, roleCheck(['Donor']), async (req, res) => {
  try {
    // Get donor from database
    const donor = await User.findById(req.user.id).select('-password');
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    // Calculate eligibility status
    const eligibilityStatus = donor.checkEligibility();
    
    // Calculate days since last donation
    const daysSinceLastDonation = donor.daysSinceLastDonation();
    
    // Calculate next eligible donation date if currently ineligible
    let nextEligibleDate = null;
    if (donor.lastDonationDate && daysSinceLastDonation !== null && daysSinceLastDonation < 56) {
      const daysRemaining = 56 - daysSinceLastDonation;
      nextEligibleDate = new Date(donor.lastDonationDate);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 56);
    }
    
    // Prepare response
    const profile = {
      id: donor._id,
      name: donor.name,
      email: donor.email,
      bloodGroup: donor.bloodGroup,
      age: donor.age,
      dateOfBirth: donor.dateOfBirth,
      weight: donor.weight,
      city: donor.city,
      pincode: donor.pincode,
      walletAddress: donor.walletAddress,
      lastDonationDate: donor.lastDonationDate,
      daysSinceLastDonation: daysSinceLastDonation,
      eligibilityStatus: eligibilityStatus,
      nextEligibleDate: nextEligibleDate,
      createdAt: donor.createdAt
    };
    
    res.status(200).json({
      success: true,
      data: profile
    });
    
  } catch (error) {
    console.error('Error fetching donor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/donor/campaigns
 * @desc    Get donor's registered campaigns
 * @access  Private (Donor only)
 */
router.get('/campaigns', auth, roleCheck(['Donor']), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query for participant records
    const query = { donorID: req.user.id };
    
    if (status) {
      query.attendanceStatus = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Query participant records with campaign details
    const participants = await CampaignParticipant.find(query)
      .populate({
        path: 'campaignID',
        populate: {
          path: 'creatorHospitalID',
          select: 'hospitalName city pincode email phone'
        }
      })
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await CampaignParticipant.countDocuments(query);
    
    // Format campaigns with participant info
    const formattedCampaigns = participants.map(participant => {
      const campaign = participant.campaignID;
      
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
        status: campaign.status,
        hospital: {
          name: campaign.creatorHospitalID.hospitalName,
          city: campaign.creatorHospitalID.city,
          pincode: campaign.creatorHospitalID.pincode,
          email: campaign.creatorHospitalID.email,
          phone: campaign.creatorHospitalID.phone
        },
        participation: {
          registrationDate: participant.registrationDate,
          registrationSource: participant.registrationSource,
          attendanceStatus: participant.attendanceStatus,
          markedDoneDate: participant.markedDoneDate,
          verificationDate: participant.verificationDate,
          bloodUnitID: participant.bloodUnitID,
          canMarkAsDone: participant.canMarkAsDone() && campaign.isToday(),
          canCancel: participant.attendanceStatus === 'Registered' && !campaign.hasPassed()
        },
        isToday: campaign.isToday(),
        hasPassed: campaign.hasPassed(),
        daysUntilCampaign: Math.ceil((new Date(campaign.campaignDate) - new Date()) / (1000 * 60 * 60 * 24))
      };
    });
    
    res.json({
      success: true,
      message: 'Registered campaigns retrieved successfully',
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
    console.error('Error retrieving donor campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving campaigns',
      error: error.message
    });
  }
});

module.exports = router;

/**
 * @route   GET /api/donor/donations
 * @desc    Get donor's donation history
 * @access  Private (Donor only)
 */
router.get('/donations', auth, roleCheck(['Donor']), async (req, res) => {
  try {
    // Query blood units donated by this donor
    const donations = await BloodUnit.find({ donorID: req.user.id })
      .populate('originalHospitalID', 'hospitalName city')
      .populate('currentHospitalID', 'hospitalName city')
      .sort({ collectionDate: -1 });
    
    // Format donations
    const formattedDonations = donations.map(unit => ({
      bloodUnitID: unit.bloodUnitID,
      bloodGroup: unit.bloodGroup,
      collectionDate: unit.collectionDate,
      expiryDate: unit.expiryDate,
      status: unit.status,
      originalHospital: {
        name: unit.originalHospitalID?.hospitalName || 'Unknown',
        city: unit.originalHospitalID?.city || 'Unknown'
      },
      currentHospital: {
        name: unit.currentHospitalID?.hospitalName || 'Unknown',
        city: unit.currentHospitalID?.city || 'Unknown'
      },
      usageDate: unit.usageDate,
      donationTxHash: unit.donationTxHash,
      blockchainExplorerURL: unit.donationTxHash 
        ? `https://amoy.polygonscan.com/tx/${unit.donationTxHash}`
        : null
    }));
    
    res.json({
      success: true,
      message: 'Donation history retrieved successfully',
      data: {
        donations: formattedDonations,
        total: formattedDonations.length
      }
    });
    
  } catch (error) {
    console.error('Error retrieving donation history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving donation history',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/donor/certificate/:bloodUnitID
 * @desc    Download donation certificate PDF
 * @access  Private (Donor only)
 */
router.get('/certificate/:bloodUnitID', auth, roleCheck(['Donor']), async (req, res) => {
  try {
    const { bloodUnitID } = req.params;
    
    console.log(`📄 Generating certificate for ${bloodUnitID}...`);
    
    // Generate certificate PDF
    const pdfBuffer = await certificateService.generateCertificate(bloodUnitID, req.user.id);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="LifeChain-Certificate-${bloodUnitID}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF buffer
    res.send(pdfBuffer);
    
    console.log(`✅ Certificate downloaded for ${bloodUnitID}`);
    
  } catch (error) {
    console.error('Error generating certificate:', error);
    
    if (error.message === 'Blood unit not found') {
      return res.status(404).json({
        success: false,
        message: 'Blood unit not found'
      });
    }
    
    if (error.message === 'You do not have permission to download this certificate') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to download this certificate'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while generating certificate',
      error: error.message
    });
  }
});
