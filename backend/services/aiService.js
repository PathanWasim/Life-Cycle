const axios = require('axios');

// AI Service base URL from environment
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * AI Service Communication Module
 * Handles all communication with the AI microservice
 */

/**
 * Predict blood demand for next 7 days
 * @param {string} hospitalID - Hospital ID
 * @param {string} bloodGroup - Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
 * @param {Array} historicalData - Array of historical usage data with date and quantity
 * @returns {Promise<Object>} Prediction result with 7-day forecast
 */
async function predictDemand(hospitalID, bloodGroup, historicalData) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/predict-demand`, {
      hospitalID,
      bloodGroup,
      historicalData
    }, {
      timeout: 10000 // 10 second timeout
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('❌ AI Service - Predict Demand Error:', error.message);
    
    // Return fallback response when AI service is unavailable
    return {
      success: false,
      message: 'AI service unavailable. Using fallback prediction.',
      data: {
        predictions: generateFallbackPrediction(bloodGroup),
        confidence: 0.5,
        recommendation: 'AI service unavailable. Maintain standard inventory levels.'
      }
    };
  }
}

/**
 * Recommend donors for emergency blood request
 * @param {string} bloodGroup - Blood group needed
 * @param {Object} location - Location object with city and pincode
 * @param {Array} eligibleDonors - Array of eligible donor objects
 * @returns {Promise<Object>} Ranked donors with suitability scores
 */
async function recommendDonors(bloodGroup, location, eligibleDonors) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/recommend-donors`, {
      bloodGroup,
      location,
      eligibleDonors
    }, {
      timeout: 10000 // 10 second timeout
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('❌ AI Service - Recommend Donors Error:', error.message);
    
    // Return fallback response - simple proximity-based ranking
    return {
      success: false,
      message: 'AI service unavailable. Using simple proximity ranking.',
      data: {
        topDonors: eligibleDonors.slice(0, 10).map((donor, index) => ({
          donorID: donor._id || donor.donorID,
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          city: donor.city,
          pincode: donor.pincode,
          suitabilityScore: 0.5,
          rank: index + 1
        })),
        totalEligible: eligibleDonors.length,
        recommendedCount: Math.min(10, eligibleDonors.length)
      }
    };
  }
}

/**
 * Check blood units for expiry and generate alerts
 * @param {Array} bloodUnits - Array of blood unit objects
 * @returns {Promise<Object>} Expiring units with priority levels
 */
async function checkExpiry(bloodUnits) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/check-expiry`, {
      bloodUnits
    }, {
      timeout: 10000 // 10 second timeout
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('❌ AI Service - Check Expiry Error:', error.message);
    
    // Return fallback response - simple expiry checking
    const expiringUnits = bloodUnits
      .filter(unit => {
        const daysUntilExpiry = Math.ceil((new Date(unit.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      })
      .map(unit => {
        const daysUntilExpiry = Math.ceil((new Date(unit.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return {
          bloodUnitID: unit.bloodUnitID,
          bloodGroup: unit.bloodGroup,
          daysUntilExpiry,
          priority: daysUntilExpiry <= 3 ? 'high' : 'medium',
          hospitalID: unit.currentHospitalID
        };
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    return {
      success: false,
      message: 'AI service unavailable. Using simple expiry checking.',
      data: {
        expiringUnits,
        totalExpiring: expiringUnits.length,
        highPriority: expiringUnits.filter(u => u.priority === 'high').length,
        mediumPriority: expiringUnits.filter(u => u.priority === 'medium').length
      }
    };
  }
}

/**
 * Generate fallback prediction when AI service is unavailable
 * @param {string} bloodGroup - Blood group
 * @returns {Array} Simple 7-day forecast
 */
function generateFallbackPrediction(bloodGroup) {
  const predictions = [];
  const baselineDemand = 10; // Conservative baseline
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    predictions.push({
      date: date.toISOString().split('T')[0],
      predictedDemand: baselineDemand,
      confidence: 0.5
    });
  }
  
  return predictions;
}

module.exports = {
  predictDemand,
  recommendDonors,
  checkExpiry
};
