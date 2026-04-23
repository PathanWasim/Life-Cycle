const cron = require('node-cron');
const BloodUnit = require('../models/BloodUnit');
const User = require('../models/User');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

/**
 * Expiry Alert Job
 * Runs daily at 08:00 UTC to check for expiring blood units
 * and send email alerts to hospitals
 */

/**
 * Process expiry alerts for all hospitals
 */
async function processExpiryAlerts() {
  try {
    console.log('🔍 Running expiry alert job...');
    
    // Query all blood units that are not used
    const bloodUnits = await BloodUnit.find({
      status: { $ne: 'Used' }
    }).populate('currentHospitalID', 'hospitalName email');
    
    if (bloodUnits.length === 0) {
      console.log('ℹ️  No blood units to check');
      return;
    }
    
    console.log(`📊 Checking ${bloodUnits.length} blood units for expiry...`);
    
    // Format blood units for AI service
    const formattedUnits = bloodUnits.map(unit => ({
      bloodUnitID: unit.bloodUnitID,
      bloodGroup: unit.bloodGroup,
      expiryDate: unit.expiryDate.toISOString(),
      currentHospitalID: unit.currentHospitalID._id.toString(),
      hospitalName: unit.currentHospitalID.hospitalName,
      hospitalEmail: unit.currentHospitalID.email
    }));
    
    // Call AI service to check expiry
    const expiryResult = await aiService.checkExpiry(formattedUnits);
    
    if (!expiryResult.data || !expiryResult.data.expiringUnits) {
      console.log('ℹ️  No expiring units found');
      return;
    }
    
    const expiringUnits = expiryResult.data.expiringUnits;
    
    console.log(`⚠️  Found ${expiringUnits.length} expiring units`);
    console.log(`   High Priority: ${expiryResult.data.highPriority || 0}`);
    console.log(`   Medium Priority: ${expiryResult.data.mediumPriority || 0}`);
    
    // Group expiring units by hospital
    const alertsByHospital = {};
    
    expiringUnits.forEach(unit => {
      const hospitalID = unit.hospitalID;
      if (!alertsByHospital[hospitalID]) {
        alertsByHospital[hospitalID] = [];
      }
      alertsByHospital[hospitalID].push(unit);
    });
    
    // Send email alerts to each hospital
    for (const [hospitalID, units] of Object.entries(alertsByHospital)) {
      try {
        const hospital = await User.findById(hospitalID);
        
        if (!hospital || !hospital.email) {
          console.log(`⚠️  Hospital ${hospitalID} not found or has no email`);
          continue;
        }
        
        console.log(`📧 Sending alert to ${hospital.hospitalName} (${hospital.email}):`);
        units.forEach(unit => {
          console.log(`   - ${unit.bloodUnitID} (${unit.bloodGroup}): ${unit.daysUntilExpiry} days, Priority: ${unit.priority}`);
        });
        
        // Send email alert
        await emailService.sendExpiryAlertEmail(hospital.email, hospital.hospitalName, units);
        console.log(`   ✅ Email sent successfully`);
        
      } catch (emailError) {
        console.error(`❌ Failed to send alert to hospital ${hospitalID}:`, emailError.message);
      }
    }
    
    console.log('✅ Expiry alert job completed');
    
  } catch (error) {
    console.error('❌ Error in expiry alert job:', error);
  }
}

/**
 * Initialize expiry alert scheduler
 * Runs daily at 08:00 UTC
 */
function initializeExpiryAlertScheduler() {
  // Schedule job to run daily at 08:00 UTC
  // Cron format: second minute hour day month weekday
  // '0 8 * * *' = At 08:00 every day
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Scheduled expiry alert job triggered');
    await processExpiryAlerts();
  }, {
    timezone: 'UTC'
  });
  
  console.log('✅ Expiry alert scheduler initialized (runs daily at 08:00 UTC)');
}

/**
 * Run expiry alerts immediately (for testing)
 */
async function runExpiryAlertsNow() {
  console.log('🧪 Running expiry alerts manually...');
  await processExpiryAlerts();
}

module.exports = {
  initializeExpiryAlertScheduler,
  runExpiryAlertsNow,
  processExpiryAlerts
};
