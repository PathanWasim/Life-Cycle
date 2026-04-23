const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BloodUnit = require('../models/BloodUnit');
const cacheMiddleware = require('../middleware/cacheMiddleware');

/**
 * @route   GET /api/public/blood-availability
 * @desc    Get regional blood availability (public access)
 * @access  Public (no authentication required)
 */
router.get('/blood-availability', cacheMiddleware(120), async (req, res) => {
  try {
    const { city, pincode, bloodGroup, radius } = req.query;
    
    // Validate that at least city or pincode is provided
    if (!city && !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either city or pincode to search for blood availability'
      });
    }
    
    // Build hospital query based on location
    const hospitalQuery = {
      role: 'Hospital',
      isVerified: true
    };
    
    // Add location filters
    if (city && pincode) {
      hospitalQuery.$or = [
        { city: city },
        { pincode: pincode }
      ];
    } else if (city) {
      hospitalQuery.city = city;
    } else if (pincode) {
      hospitalQuery.pincode = pincode;
    }
    
    // Find hospitals in the specified region
    const hospitals = await User.find(hospitalQuery)
      .select('_id hospitalName city pincode email phone');
    
    if (hospitals.length === 0) {
      return res.json({
        success: true,
        message: 'No verified hospitals found in the specified location',
        data: {
          location: { city: city || null, pincode: pincode || null },
          bloodGroup: bloodGroup || 'All',
          availability: [],
          totalUnits: 0,
          hospitalsWithStock: 0
        }
      });
    }
    
    const hospitalIDs = hospitals.map(h => h._id);
    
    // Build blood unit query
    const bloodQuery = {
      currentHospitalID: { $in: hospitalIDs },
      status: { $in: ['Collected', 'Stored', 'Transferred'] },
      expiryDate: { $gt: new Date() } // Not expired
    };
    
    // Add blood group filter if specified
    if (bloodGroup) {
      const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      if (!validBloodGroups.includes(bloodGroup)) {
        return res.status(400).json({
          success: false,
          message: `Invalid blood group. Must be one of: ${validBloodGroups.join(', ')}`
        });
      }
      bloodQuery.bloodGroup = bloodGroup;
    }
    
    // Aggregate blood units by hospital and blood group
    const availability = await BloodUnit.aggregate([
      { $match: bloodQuery },
      {
        $group: {
          _id: {
            hospitalID: '$currentHospitalID',
            bloodGroup: '$bloodGroup'
          },
          count: { $sum: 1 },
          lastUpdated: { $max: '$updatedAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.hospitalID',
          foreignField: '_id',
          as: 'hospital'
        }
      },
      {
        $unwind: '$hospital'
      },
      {
        $project: {
          hospitalName: '$hospital.hospitalName',
          hospitalCity: '$hospital.city',
          hospitalPincode: '$hospital.pincode',
          hospitalPhone: '$hospital.phone',
          hospitalEmail: '$hospital.email',
          bloodGroup: '$_id.bloodGroup',
          availableUnits: '$count',
          lastUpdated: '$lastUpdated'
        }
      },
      {
        $sort: { hospitalName: 1, bloodGroup: 1 }
      }
    ]);
    
    // Calculate summary statistics
    const totalUnits = availability.reduce((sum, item) => sum + item.availableUnits, 0);
    const hospitalsWithStock = [...new Set(availability.map(item => item.hospitalName))].length;
    
    // Group by hospital for better presentation
    const hospitalGroups = {};
    availability.forEach(item => {
      const hospitalKey = item.hospitalName;
      if (!hospitalGroups[hospitalKey]) {
        hospitalGroups[hospitalKey] = {
          hospitalName: item.hospitalName,
          hospitalCity: item.hospitalCity,
          hospitalPincode: item.hospitalPincode,
          hospitalPhone: item.hospitalPhone || 'Contact hospital directly',
          hospitalEmail: item.hospitalEmail,
          bloodGroups: {},
          totalUnits: 0
        };
      }
      
      hospitalGroups[hospitalKey].bloodGroups[item.bloodGroup] = {
        availableUnits: item.availableUnits,
        lastUpdated: item.lastUpdated
      };
      hospitalGroups[hospitalKey].totalUnits += item.availableUnits;
    });
    
    // Convert to array and sort by total units (descending)
    const hospitalAvailability = Object.values(hospitalGroups)
      .sort((a, b) => b.totalUnits - a.totalUnits);
    
    // Generate recommendations based on availability
    let recommendations = [];
    if (totalUnits === 0) {
      recommendations.push('No blood units available in this region. Try expanding your search radius or contact hospitals directly.');
    } else if (totalUnits < 10) {
      recommendations.push('Limited blood availability in this region. Contact hospitals immediately if urgent.');
    } else {
      recommendations.push(`Good blood availability in this region with ${totalUnits} units across ${hospitalsWithStock} hospitals.`);
    }
    
    // Add blood group specific recommendations
    if (bloodGroup && availability.length > 0) {
      const bloodGroupTotal = availability
        .filter(item => item.bloodGroup === bloodGroup)
        .reduce((sum, item) => sum + item.availableUnits, 0);
      
      if (bloodGroupTotal === 0) {
        recommendations.push(`No ${bloodGroup} blood available. Consider compatible blood groups or contact hospitals for updates.`);
      } else {
        recommendations.push(`${bloodGroupTotal} units of ${bloodGroup} blood available.`);
      }
    }
    
    res.json({
      success: true,
      message: 'Blood availability retrieved successfully',
      data: {
        location: {
          city: city || null,
          pincode: pincode || null
        },
        searchCriteria: {
          bloodGroup: bloodGroup || 'All blood groups',
          includeExpired: false
        },
        availability: hospitalAvailability,
        summary: {
          totalUnits,
          hospitalsWithStock,
          hospitalsInRegion: hospitals.length,
          lastUpdated: new Date()
        },
        recommendations,
        emergencyContacts: hospitalAvailability.map(hospital => ({
          hospitalName: hospital.hospitalName,
          phone: hospital.hospitalPhone,
          email: hospital.hospitalEmail,
          location: `${hospital.hospitalCity}, ${hospital.hospitalPincode}`
        }))
      }
    });
    
  } catch (error) {
    console.error('Error retrieving blood availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving blood availability',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/public/hospitals
 * @desc    Get list of verified hospitals in a region (public access)
 * @access  Public (no authentication required)
 */
router.get('/hospitals', cacheMiddleware(300), async (req, res) => {
  try {
    const { city, pincode } = req.query;
    
    // Build query
    const query = {
      role: 'Hospital',
      isVerified: true
    };
    
    // Add location filters
    if (city && pincode) {
      query.$or = [
        { city: city },
        { pincode: pincode }
      ];
    } else if (city) {
      query.city = city;
    } else if (pincode) {
      query.pincode = pincode;
    }
    
    // Query hospitals
    const hospitals = await User.find(query)
      .select('hospitalName city pincode email phone createdAt')
      .sort({ hospitalName: 1 });
    
    res.json({
      success: true,
      message: 'Hospitals retrieved successfully',
      data: {
        hospitals: hospitals.map(hospital => ({
          hospitalName: hospital.hospitalName,
          city: hospital.city,
          pincode: hospital.pincode,
          email: hospital.email,
          phone: hospital.phone || 'Contact hospital directly',
          establishedDate: hospital.createdAt
        })),
        total: hospitals.length,
        location: {
          city: city || null,
          pincode: pincode || null
        }
      }
    });
    
  } catch (error) {
    console.error('Error retrieving hospitals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving hospitals',
      error: error.message
    });
  }
});

module.exports = router;