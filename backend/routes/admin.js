const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BloodUnit = require('../models/BloodUnit');
const EmergencyRequest = require('../models/EmergencyRequest');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const emailService = require('../services/emailService');

/**
 * @route   GET /api/admin/pending-hospitals
 * @desc    Get list of pending hospital verifications
 * @access  Private (Admin only)
 */
router.get('/pending-hospitals', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    // Query hospitals that are not verified
    const pendingHospitals = await User.find({
      role: 'Hospital',
      isVerified: false
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Pending hospitals retrieved successfully',
      data: {
        hospitals: pendingHospitals.map(hospital => ({
          hospitalID: hospital._id,
          hospitalName: hospital.hospitalName,
          email: hospital.email,
          city: hospital.city,
          pincode: hospital.pincode,
          walletAddress: hospital.walletAddress,
          registrationDate: hospital.createdAt
        })),
        total: pendingHospitals.length
      }
    });

  } catch (error) {
    console.error('Error retrieving pending hospitals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving pending hospitals',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/verify-hospital/:hospitalID
 * @desc    Verify a hospital
 * @access  Private (Admin only)
 */
router.post('/verify-hospital/:hospitalID', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    const { hospitalID } = req.params;

    // Find hospital
    const hospital = await User.findById(hospitalID);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    if (hospital.role !== 'Hospital') {
      return res.status(400).json({
        success: false,
        message: 'User is not a hospital'
      });
    }

    if (hospital.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Hospital is already verified'
      });
    }

    // Update verification status
    hospital.isVerified = true;
    await hospital.save();

    console.log(`✅ Hospital verified: ${hospital.hospitalName}`);

    // Send verification email
    try {
      await emailService.sendHospitalVerificationEmail(hospital.email, hospital.hospitalName);
      console.log(`📧 Verification email sent to ${hospital.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError.message);
      // Don't fail the verification if email fails
    }

    res.json({
      success: true,
      message: 'Hospital verified successfully',
      data: {
        hospitalID: hospital._id,
        hospitalName: hospital.hospitalName,
        email: hospital.email,
        isVerified: hospital.isVerified
      }
    });

  } catch (error) {
    console.error('Error verifying hospital:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying hospital',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/reject-hospital/:hospitalID
 * @desc    Reject a hospital and delete account
 * @access  Private (Admin only)
 */
router.delete('/reject-hospital/:hospitalID', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    const { hospitalID } = req.params;

    // Find hospital
    const hospital = await User.findById(hospitalID);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    if (hospital.role !== 'Hospital') {
      return res.status(400).json({
        success: false,
        message: 'User is not a hospital'
      });
    }

    if (hospital.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject verified hospital. Please contact support.'
      });
    }

    // Send rejection email before deleting
    try {
      await emailService.sendHospitalRejectionEmail(hospital.email, hospital.hospitalName);
      console.log(`📧 Rejection email sent to ${hospital.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send rejection email:', emailError.message);
      // Continue with deletion even if email fails
    }

    // Delete hospital account
    await User.findByIdAndDelete(hospitalID);

    console.log(`✅ Hospital rejected and deleted: ${hospital.hospitalName}`);

    res.json({
      success: true,
      message: 'Hospital rejected and account deleted',
      data: {
        hospitalName: hospital.hospitalName,
        email: hospital.email
      }
    });

  } catch (error) {
    console.error('Error rejecting hospital:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting hospital',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/statistics
 * @desc    Get system statistics
 * @access  Private (Admin only)
 */
router.get('/statistics', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    // Count total donors
    const totalDonors = await User.countDocuments({ role: 'Donor' });

    // Count total hospitals
    const totalHospitals = await User.countDocuments({ role: 'Hospital', isVerified: true });

    // Count pending hospitals
    const pendingHospitals = await User.countDocuments({ role: 'Hospital', isVerified: false });

    // Count total blood units
    const totalBloodUnits = await BloodUnit.countDocuments();

    // Count available units (Collected or Stored status)
    const availableUnits = await BloodUnit.countDocuments({
      status: { $in: ['Collected', 'Stored'] }
    });

    // Count active emergency requests
    const activeEmergencyRequests = await EmergencyRequest.countDocuments({ status: 'Active' });

    // Blood units by status
    const bloodUnitsByStatus = await BloodUnit.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Blood units by blood group
    const bloodUnitsByGroup = await BloodUnit.aggregate([
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format aggregation results for raw status breakdown
    const bloodUnitsByStatusMap = {};
    bloodUnitsByStatus.forEach(item => {
      bloodUnitsByStatusMap[item._id] = item.count;
    });

    // Create frontend-compatible status breakdown
    const statusBreakdown = {
      available: (bloodUnitsByStatusMap['Collected'] || 0) + (bloodUnitsByStatusMap['Stored'] || 0),
      reserved: bloodUnitsByStatusMap['Reserved'] || 0,
      used: bloodUnitsByStatusMap['Used'] || 0,
      expired: bloodUnitsByStatusMap['Expired'] || 0,
      transferred: bloodUnitsByStatusMap['Transferred'] || 0
    };

    const bloodGroupBreakdown = {};
    bloodUnitsByGroup.forEach(item => {
      bloodGroupBreakdown[item._id] = item.count;
    });

    res.json({
      success: true,
      message: 'System statistics retrieved successfully',
      data: {
        totalDonors,
        totalHospitals,
        pendingHospitals,
        totalBloodUnits,
        availableUnits,
        activeEmergencyRequests,
        bloodUnitsByStatus: bloodUnitsByStatusMap,
        bloodUnitsByBloodGroup: bloodGroupBreakdown,
        statusBreakdown
      }
    });

  } catch (error) {
    console.error('Error retrieving statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/detailed-statistics
 * @desc    Get detailed system statistics including hospital-wise data
 * @access  Private (Admin only)
 */
router.get('/detailed-statistics', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    // Get hospital-wise blood unit statistics
    const hospitalStats = await BloodUnit.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'currentHospitalID',
          foreignField: '_id',
          as: 'hospital'
        }
      },
      {
        $unwind: '$hospital'
      },
      {
        $match: {
          'hospital.role': 'Hospital',
          'hospital.isVerified': true
        }
      },
      {
        $group: {
          _id: {
            hospitalID: '$hospital._id',
            hospitalName: '$hospital.hospitalName',
            city: '$hospital.city',
            pincode: '$hospital.pincode',
            bloodGroup: '$bloodGroup',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            hospitalID: '$_id.hospitalID',
            hospitalName: '$_id.hospitalName',
            city: '$_id.city',
            pincode: '$_id.pincode'
          },
          bloodUnits: {
            $push: {
              bloodGroup: '$_id.bloodGroup',
              status: '$_id.status',
              count: '$count'
            }
          },
          totalUnits: { $sum: '$count' }
        }
      },
      {
        $sort: { totalUnits: -1 }
      }
    ]);

    // Get donor statistics by city
    const donorsByCity = await User.aggregate([
      {
        $match: { role: 'Donor' }
      },
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          bloodGroups: {
            $push: '$bloodGroup'
          }
        }
      },
      {
        $project: {
          city: '$_id',
          donorCount: '$count',
          bloodGroupBreakdown: {
            $reduce: {
              input: '$bloodGroups',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this',
                          v: {
                            $add: [
                              { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
                              1
                            ]
                          }
                        }
                      ]
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $sort: { donorCount: -1 }
      }
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = {
      newDonors: await User.countDocuments({
        role: 'Donor',
        createdAt: { $gte: thirtyDaysAgo }
      }),
      newHospitals: await User.countDocuments({
        role: 'Hospital',
        isVerified: true,
        createdAt: { $gte: thirtyDaysAgo }
      }),
      newBloodUnits: await BloodUnit.countDocuments({
        collectionDate: { $gte: thirtyDaysAgo }
      }),
      emergencyRequests: await EmergencyRequest.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      })
    };

    // Get blood unit expiry analysis
    const now = new Date();
    const expiryAnalysis = await BloodUnit.aggregate([
      {
        $match: {
          status: { $in: ['Collected', 'Stored'] }
        }
      },
      {
        $project: {
          daysUntilExpiry: {
            $divide: [
              { $subtract: ['$expiryDate', now] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$daysUntilExpiry',
          boundaries: [-Infinity, 0, 7, 14, 30, Infinity],
          default: 'Unknown',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Detailed statistics retrieved successfully',
      data: {
        hospitalStats,
        donorsByCity,
        recentActivity,
        expiryAnalysis
      }
    });

  } catch (error) {
    console.error('Error retrieving detailed statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving detailed statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/hospital-inventories
 * @desc    Get detailed hospital inventories with blood unit breakdown
 * @access  Private (Admin only)
 */
router.get('/hospital-inventories', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    // Get hospital-wise blood unit statistics with detailed breakdown
    const hospitalStats = await BloodUnit.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'currentHospitalID',
          foreignField: '_id',
          as: 'hospital'
        }
      },
      {
        $unwind: '$hospital'
      },
      {
        $match: {
          'hospital.role': 'Hospital',
          'hospital.isVerified': true
        }
      },
      {
        $group: {
          _id: {
            hospitalID: '$hospital._id',
            hospitalName: '$hospital.hospitalName',
            city: '$hospital.city',
            pincode: '$hospital.pincode',
            email: '$hospital.email',
            bloodGroup: '$bloodGroup',
            status: '$status'
          },
          count: { $sum: 1 },
          bloodUnits: {
            $push: {
              bloodUnitID: '$bloodUnitID',
              collectionDate: '$collectionDate',
              expiryDate: '$expiryDate',
              donorID: '$donorID'
            }
          }
        }
      },
      {
        $group: {
          _id: {
            hospitalID: '$_id.hospitalID',
            hospitalName: '$_id.hospitalName',
            city: '$_id.city',
            pincode: '$_id.pincode',
            email: '$_id.email'
          },
          bloodUnits: {
            $push: {
              bloodGroup: '$_id.bloodGroup',
              status: '$_id.status',
              count: '$count',
              units: '$bloodUnits'
            }
          },
          totalUnits: { $sum: '$count' }
        }
      },
      {
        $sort: { totalUnits: -1 }
      }
    ]);

    res.json({
      success: true,
      message: 'Hospital inventories retrieved successfully',
      data: {
        hospitalStats,
        totalHospitals: hospitalStats.length,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Error retrieving hospital inventories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving hospital inventories',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/all-blood-units
 * @desc    Get all blood units in the system with hospital and donor details
 * @access  Private (Admin only)
 */
router.get('/all-blood-units', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    const { limit = 100, skip = 0, status, bloodGroup, hospitalID } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (hospitalID) query.currentHospitalID = hospitalID;

    // Get blood units with hospital and donor details
    const bloodUnits = await BloodUnit.find(query)
      .populate('currentHospitalID', 'hospitalName city pincode email')
      .populate('originalHospitalID', 'hospitalName city pincode')
      .populate('donorID', 'name email bloodGroup city')
      .sort({ collectionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Get total count for pagination
    const totalCount = await BloodUnit.countDocuments(query);

    // Format blood units with calculated fields
    const formattedUnits = bloodUnits.map(unit => {
      const daysUntilExpiry = Math.ceil((new Date(unit.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

      return {
        bloodUnitID: unit.bloodUnitID,
        bloodGroup: unit.bloodGroup,
        status: unit.status,
        collectionDate: unit.collectionDate,
        expiryDate: unit.expiryDate,
        daysUntilExpiry,
        isExpired: daysUntilExpiry <= 0,

        // Hospital details
        hospitalName: unit.currentHospitalID?.hospitalName || 'Unknown',
        hospitalCity: unit.currentHospitalID?.city || 'Unknown',
        hospitalEmail: unit.currentHospitalID?.email,

        // Original hospital (if transferred)
        originalHospitalName: unit.originalHospitalID?.hospitalName,

        // Donor details
        donorName: unit.donorID?.name || 'Unknown',
        donorEmail: unit.donorID?.email,
        donorCity: unit.donorID?.city,

        // Blockchain details
        donationTxHash: unit.donationTxHash,
        transferTxHashes: unit.transferTxHashes,
        usageTxHash: unit.usageTxHash,

        // Transfer history
        transferHistory: unit.transferHistory,

        // Timestamps
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      };
    });

    // Get summary statistics
    const summary = {
      total: totalCount,
      byStatus: {},
      byBloodGroup: {},
      byHospital: {}
    };

    // Calculate summaries from all units (not just current page)
    const allUnitsForSummary = await BloodUnit.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          byStatus: {
            $push: {
              k: '$status',
              v: 1
            }
          },
          byBloodGroup: {
            $push: {
              k: '$bloodGroup',
              v: 1
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Blood units retrieved successfully',
      data: {
        bloodUnits: formattedUnits,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: (parseInt(skip) + parseInt(limit)) < totalCount
        },
        summary,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Error retrieving all blood units:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving blood units',
      error: error.message
    });
  }
});

module.exports = router;
