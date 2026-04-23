const nodemailer = require('nodemailer');
const emailMapping = require('./emailMapping');

/**
 * Email Service for LifeChain
 * Handles all email notifications with demo-to-real email mapping
 */

// Create transporter
let transporter = null;

/**
 * Initialize email transporter
 */
function initializeTransporter() {
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };
  
  // Check if SMTP credentials are configured
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    console.log('⚠️  Email service not configured. Set SMTP_USER and SMTP_PASS in .env');
    return null;
  }
  
  transporter = nodemailer.createTransport(emailConfig);
  
  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email service verification failed:', error.message);
      transporter = null;
    } else {
      console.log('✅ Email service ready');
    }
  });
  
  return transporter;
}

/**
 * Send email
 * @param {string} to - Recipient email (demo email from database)
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email content
 * @returns {Promise<Object>} Send result
 */
async function sendEmail(to, subject, htmlContent) {
  try {
    // Map demo email to real email for notification
    const realEmail = emailMapping.getRealEmailForNotification(to);
    
    console.log(`📧 Email mapping: ${to} → ${realEmail}`);
    
    // Initialize transporter if not already done
    if (!transporter) {
      transporter = initializeTransporter();
    }
    
    // If still no transporter, email is not configured
    if (!transporter) {
      console.log(`📧 [SIMULATED] Email to ${realEmail}: ${subject}`);
      return {
        success: false,
        message: 'Email service not configured',
        simulated: true
      };
    }
    
    const mailOptions = {
      from: `"LifeChain" <${process.env.SMTP_USER}>`,
      to: realEmail, // Send to real email address
      subject,
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent to ${realEmail} (mapped from ${to}): ${subject}`);
    console.log(`   Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      originalEmail: to,
      realEmail: realEmail
    };
    
  } catch (error) {
    const realEmail = emailMapping.getRealEmailForNotification(to);
    console.error(`❌ Failed to send email to ${realEmail} (mapped from ${to}):`, error.message);
    return {
      success: false,
      message: error.message,
      originalEmail: to,
      realEmail: realEmail
    };
  }
}

/**
 * Send hospital verification approval email
 * @param {string} email - Hospital email
 * @param {string} hospitalName - Hospital name
 */
async function sendHospitalVerificationEmail(email, hospitalName) {
  const subject = 'Hospital Verification Approved - LifeChain';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Hospital Verification Approved</h1>
        </div>
        <div class="content">
          <h2>Dear ${hospitalName},</h2>
          <p>Congratulations! Your hospital has been successfully verified on the LifeChain platform.</p>
          <p>You can now:</p>
          <ul>
            <li>Record blood donations</li>
            <li>Manage blood inventory</li>
            <li>Transfer blood units to other hospitals</li>
            <li>Record blood usage</li>
            <li>Create emergency blood requests</li>
            <li>Access AI-powered demand predictions</li>
          </ul>
          <p>All your blood supply chain activities will be recorded on the blockchain for transparency and traceability.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Login to Dashboard</a>
        </div>
        <div class="footer">
          <p>LifeChain - Transparent Blood Supply Management</p>
          <p>This is an automated message. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, htmlContent);
}

/**
 * Send hospital rejection email
 * @param {string} email - Hospital email
 * @param {string} hospitalName - Hospital name
 */
async function sendHospitalRejectionEmail(email, hospitalName) {
  const subject = 'Hospital Verification Status - LifeChain';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hospital Verification Update</h1>
        </div>
        <div class="content">
          <h2>Dear ${hospitalName},</h2>
          <p>Thank you for your interest in joining the LifeChain platform.</p>
          <p>After reviewing your application, we are unable to verify your hospital at this time.</p>
          <p>This may be due to:</p>
          <ul>
            <li>Incomplete registration information</li>
            <li>Unable to verify hospital credentials</li>
            <li>Duplicate registration</li>
          </ul>
          <p>If you believe this is an error, please contact our support team with your hospital registration details.</p>
        </div>
        <div class="footer">
          <p>LifeChain - Transparent Blood Supply Management</p>
          <p>This is an automated message. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, htmlContent);
}

/**
 * Send emergency blood request notification to donors
 * @param {string} email - Donor email
 * @param {string} donorName - Donor name
 * @param {Object} requestDetails - Emergency request details
 */
async function sendEmergencyRequestEmail(email, donorName, requestDetails) {
  const { bloodGroup, quantity, hospitalName, city, pincode, urgencyLevel, notes } = requestDetails;
  
  const subject = `🚨 ${urgencyLevel} Priority: Blood Donation Needed - ${bloodGroup}`;
  
  const urgencyColor = urgencyLevel === 'Critical' ? '#dc2626' : urgencyLevel === 'High' ? '#ea580c' : '#f59e0b';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${urgencyColor}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .urgency-badge { display: inline-block; padding: 8px 16px; background-color: ${urgencyColor}; color: white; border-radius: 5px; font-weight: bold; }
        .details { background-color: white; padding: 15px; border-left: 4px solid ${urgencyColor}; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Emergency Blood Request</h1>
          <p class="urgency-badge">${urgencyLevel} Priority</p>
        </div>
        <div class="content">
          <h2>Dear ${donorName},</h2>
          <p>An emergency blood request has been issued by <strong>${hospitalName}</strong>.</p>
          <p>You have been identified as a suitable donor based on your location, blood type, and donation history.</p>
          
          <div class="details">
            <h3>Request Details:</h3>
            <p><strong>Blood Group Needed:</strong> ${bloodGroup}</p>
            <p><strong>Quantity Needed:</strong> ${quantity} units</p>
            <p><strong>Hospital:</strong> ${hospitalName}</p>
            <p><strong>Location:</strong> ${city}, ${pincode}</p>
            <p><strong>Urgency Level:</strong> ${urgencyLevel}</p>
            ${notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ''}
          </div>
          
          <p><strong>Your donation can save lives!</strong></p>
          <p>If you are available to donate, please contact the hospital as soon as possible or visit their blood donation center.</p>
          
          <p>Thank you for being a registered donor on LifeChain.</p>
        </div>
        <div class="footer">
          <p>LifeChain - Transparent Blood Supply Management</p>
          <p>This is an automated emergency notification.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, htmlContent);
}

/**
 * Send expiry alert email to hospital
 * @param {string} email - Hospital email
 * @param {string} hospitalName - Hospital name
 * @param {Array} expiringUnits - Array of expiring blood units
 */
async function sendExpiryAlertEmail(email, hospitalName, expiringUnits) {
  const highPriority = expiringUnits.filter(u => u.priority === 'high');
  const mediumPriority = expiringUnits.filter(u => u.priority === 'medium');
  
  const subject = `⚠️ Blood Unit Expiry Alert - ${expiringUnits.length} units expiring soon`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ea580c; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .alert-high { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 10px; margin: 10px 0; }
        .alert-medium { background-color: #fed7aa; border-left: 4px solid #ea580c; padding: 10px; margin: 10px 0; }
        .unit { margin: 5px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Blood Unit Expiry Alert</h1>
        </div>
        <div class="content">
          <h2>Dear ${hospitalName},</h2>
          <p>This is an automated alert regarding blood units in your inventory that are expiring soon.</p>
          
          ${highPriority.length > 0 ? `
          <div class="alert-high">
            <h3>🔴 High Priority (1-3 days)</h3>
            ${highPriority.map(unit => `
              <div class="unit">
                <strong>${unit.bloodUnitID}</strong> (${unit.bloodGroup}) - Expires in ${unit.daysUntilExpiry} day(s)
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${mediumPriority.length > 0 ? `
          <div class="alert-medium">
            <h3>🟡 Medium Priority (4-7 days)</h3>
            ${mediumPriority.map(unit => `
              <div class="unit">
                <strong>${unit.bloodUnitID}</strong> (${unit.bloodGroup}) - Expires in ${unit.daysUntilExpiry} day(s)
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <p><strong>Recommended Actions:</strong></p>
          <ul>
            <li>Use high-priority units immediately for patient care</li>
            <li>Consider transferring units to hospitals with higher demand</li>
            <li>Update inventory management to minimize waste</li>
          </ul>
          
          <p>Please take appropriate action to prevent blood wastage.</p>
        </div>
        <div class="footer">
          <p>LifeChain - Transparent Blood Supply Management</p>
          <p>This alert is sent daily at 08:00 UTC</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, htmlContent);
}

/**
 * Send campaign invitation email to donors
 * @param {string} email - Donor email
 * @param {string} donorName - Donor name
 * @param {Object} campaignDetails - Campaign details
 */
async function sendCampaignInvitationEmail(email, donorName, campaignDetails) {
  const {
    title,
    description,
    venue,
    campaignDate,
    startTime,
    endTime,
    bloodGroupsNeeded,
    targetQuantity,
    hospitalName,
    hospitalPhone,
    hospitalEmail,
    registrationLink
  } = campaignDetails;
  
  const subject = `🩸 Blood Donation Campaign Invitation - ${title}`;
  
  const formattedDate = new Date(campaignDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .campaign-details { background-color: white; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .blood-groups { display: inline-block; padding: 4px 8px; background-color: #fee2e2; color: #dc2626; border-radius: 3px; margin: 2px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🩸 You're Invited to Donate Blood!</h1>
        </div>
        <div class="content">
          <h2>Dear ${donorName},</h2>
          <p>You're invited to participate in a blood donation campaign organized by <strong>${hospitalName}</strong>.</p>
          <p>Your blood group is needed for this important community initiative!</p>
          
          <div class="campaign-details">
            <h3>📅 Campaign Details:</h3>
            <p><strong>Campaign:</strong> ${title}</p>
            ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
            <p><strong>Venue:</strong> ${venue.name}</p>
            <p><strong>Address:</strong> ${venue.address}, ${venue.city}, ${venue.pincode}</p>
            <p><strong>Blood Groups Needed:</strong> ${bloodGroupsNeeded.map(bg => `<span class="blood-groups">${bg}</span>`).join(' ')}</p>
            <p><strong>Target:</strong> ${targetQuantity} units</p>
            <p><strong>Organized by:</strong> ${hospitalName}</p>
          </div>
          
          <p><strong>Why Your Donation Matters:</strong></p>
          <ul>
            <li>One donation can save up to 3 lives</li>
            <li>Help maintain adequate blood supply in your community</li>
            <li>Support patients in need of emergency care</li>
            <li>Contribute to a transparent, blockchain-verified donation system</li>
          </ul>
          
          <p><strong>What to Expect:</strong></p>
          <ul>
            <li>Quick and safe donation process</li>
            <li>Professional medical staff</li>
            <li>Refreshments provided</li>
            <li>Digital certificate with blockchain verification</li>
          </ul>
          
          <a href="${registrationLink}" class="button">Register Now</a>
          
          <p><strong>Contact Information:</strong></p>
          <p>Hospital: ${hospitalName}<br>
          Phone: ${hospitalPhone}<br>
          Email: ${hospitalEmail}</p>
          
          <p>Thank you for considering to donate blood and save lives!</p>
        </div>
        <div class="footer">
          <p>LifeChain - Transparent Blood Supply Management</p>
          <p>You can ignore this invitation if you're not available. No action required.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, htmlContent);
}

/**
 * Send campaign registration confirmation email
 * @param {string} email - Donor email
 * @param {string} donorName - Donor name
 * @param {Object} campaignDetails - Campaign details
 */
async function sendCampaignRegistrationConfirmationEmail(email, donorName, campaignDetails) {
  const {
    title,
    description,
    venue,
    campaignDate,
    startTime,
    endTime,
    hospitalName,
    hospitalPhone,
    hospitalEmail
  } = campaignDetails;
  
  const subject = `✅ Campaign Registration Confirmed - ${title}`;
  
  const formattedDate = new Date(campaignDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .campaign-details { background-color: white; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0; }
        .checklist { background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Registration Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Dear ${donorName},</h2>
          <p>Thank you for registering for the blood donation campaign! Your commitment to saving lives is greatly appreciated.</p>
          
          <div class="campaign-details">
            <h3>📅 Your Campaign Details:</h3>
            <p><strong>Campaign:</strong> ${title}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
            <p><strong>Venue:</strong> ${venue.name}</p>
            <p><strong>Address:</strong> ${venue.address}, ${venue.city}, ${venue.pincode}</p>
            <p><strong>Hospital:</strong> ${hospitalName}</p>
          </div>
          
          <div class="checklist">
            <h3>📋 Pre-Donation Checklist:</h3>
            <p><strong>Before the campaign day:</strong></p>
            <ul>
              <li>✓ Get a good night's sleep (7-8 hours)</li>
              <li>✓ Eat a healthy, iron-rich meal</li>
              <li>✓ Drink plenty of water (avoid alcohol)</li>
              <li>✓ Bring a valid photo ID</li>
              <li>✓ Avoid smoking for at least 2 hours before donation</li>
            </ul>
          </div>
          
          <p><strong>What Happens Next:</strong></p>
          <ul>
            <li>We'll send you a reminder 24 hours before the campaign</li>
            <li>On the campaign day, you can mark your donation as completed in your donor dashboard</li>
            <li>The hospital will verify your donation and create your blood unit record</li>
            <li>You'll receive a blockchain-verified digital certificate</li>
          </ul>
          
          <p><strong>Contact Information:</strong></p>
          <p>Hospital: ${hospitalName}<br>
          Phone: ${hospitalPhone}<br>
          Email: ${hospitalEmail}</p>
          
          <p>Thank you for your commitment to saving lives!</p>
        </div>
        <div class="footer">
          <p>LifeChain - Transparent Blood Supply Management</p>
          <p>You can cancel your registration anytime before the campaign date.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, htmlContent);
}

/**
 * Send campaign reminder email (24 hours before)
 * @param {string} email - Donor email
 * @param {string} donorName - Donor name
 * @param {Object} campaignDetails - Campaign details
 */
async function sendCampaignReminderEmail(email, donorName, campaignDetails) {
  const {
    title,
    venue,
    campaignDate,
    startTime,
    endTime,
    hospitalName,
    hospitalPhone
  } = campaignDetails;
  
  const subject = `⏰ Reminder: Blood Donation Campaign Tomorrow - ${title}`;
  
  const formattedDate = new Date(campaignDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .campaign-details { background-color: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .checklist { background-color: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Campaign Reminder</h1>
        </div>
        <div class="content">
          <h2>Dear ${donorName},</h2>
          <p>This is a friendly reminder about the blood donation campaign you registered for <strong>tomorrow</strong>!</p>
          
          <div class="campaign-details">
            <h3>📅 Tomorrow's Campaign:</h3>
            <p><strong>Campaign:</strong> ${title}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
            <p><strong>Venue:</strong> ${venue.name}</p>
            <p><strong>Address:</strong> ${venue.address}, ${venue.city}, ${venue.pincode}</p>
          </div>
          
          <div class="checklist">
            <h3>📋 Final Preparation Checklist:</h3>
            <ul>
              <li>✓ Get a good night's sleep tonight</li>
              <li>✓ Eat a healthy breakfast tomorrow</li>
              <li>✓ Drink plenty of water</li>
              <li>✓ Bring valid ID</li>
              <li>✓ Avoid alcohol and smoking</li>
              <li>✓ Arrive on time</li>
            </ul>
          </div>
          
          <p><strong>On Campaign Day:</strong></p>
          <ul>
            <li>Check in at the registration desk</li>
            <li>Complete the health screening</li>
            <li>Donate blood (takes about 10-15 minutes)</li>
            <li>Rest and enjoy refreshments</li>
            <li>Mark your donation as completed in your LifeChain dashboard</li>
          </ul>
          
          <p>We look forward to seeing you tomorrow!</p>
          
          <p><strong>Questions?</strong> Contact ${hospitalName} at ${hospitalPhone}</p>
        </div>
        <div class="footer">
          <p>LifeChain - Transparent Blood Supply Management</p>
          <p>Thank you for your commitment to saving lives!</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, htmlContent);
}

/**
 * Send campaign cancellation email
 * @param {string} email - Donor email
 * @param {string} donorName - Donor name
 * @param {Object} campaignDetails - Campaign details
 */
async function sendCampaignCancellationEmail(email, donorName, campaignDetails) {
  const { title, campaignDate, venue } = campaignDetails;
  
  const subject = `❌ Campaign Cancelled - ${title}`;
  
  const formattedDate = new Date(campaignDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .campaign-details { background-color: white; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Campaign Cancelled</h1>
        </div>
        <div class="content">
          <h2>Dear ${donorName},</h2>
          <p>We regret to inform you that the blood donation campaign you registered for has been cancelled.</p>
          
          <div class="campaign-details">
            <h3>📅 Cancelled Campaign:</h3>
            <p><strong>Campaign:</strong> ${title}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Venue:</strong> ${venue.name}, ${venue.city}</p>
          </div>
          
          <p>We apologize for any inconvenience this may cause. Campaign cancellations can occur due to various reasons such as:</p>
          <ul>
            <li>Unforeseen circumstances at the venue</li>
            <li>Insufficient registrations</li>
            <li>Emergency situations</li>
            <li>Weather or safety concerns</li>
          </ul>
          
          <p><strong>What's Next:</strong></p>
          <ul>
            <li>Your registration has been automatically cancelled</li>
            <li>Look out for future campaign invitations</li>
            <li>You can browse active campaigns in your area</li>
            <li>Consider registering for other available campaigns</li>
          </ul>
          
          <p>Thank you for your willingness to donate blood. Your commitment to saving lives is greatly appreciated!</p>
        </div>
        <div class="footer">
          <p>LifeChain - Transparent Blood Supply Management</p>
          <p>We'll notify you about future campaigns in your area.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, htmlContent);
}

/**
 * Send donation verification thank you email
 * @param {string} email - Donor email
 * @param {string} donorName - Donor name
 * @param {Object} donationDetails - Donation details
 */
async function sendDonationVerificationThankYouEmail(email, donorName, donationDetails) {
  const { campaignTitle, bloodUnitID, hospitalName, donationDate } = donationDetails;
  
  const subject = `🙏 Thank You for Your Blood Donation - ${campaignTitle}`;
  
  const formattedDate = new Date(donationDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .donation-details { background-color: white; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0; }
        .impact { background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🙏 Thank You, Hero!</h1>
        </div>
        <div class="content">
          <h2>Dear ${donorName},</h2>
          <p>Thank you for your generous blood donation! Your contribution has been verified and recorded on the blockchain.</p>
          
          <div class="donation-details">
            <h3>🩸 Your Donation Details:</h3>
            <p><strong>Campaign:</strong> ${campaignTitle}</p>
            <p><strong>Donation Date:</strong> ${formattedDate}</p>
            <p><strong>Hospital:</strong> ${hospitalName}</p>
            <p><strong>Blood Unit ID:</strong> ${bloodUnitID}</p>
            <p><strong>Status:</strong> Verified and Recorded</p>
          </div>
          
          <div class="impact">
            <h3>🌟 Your Impact:</h3>
            <ul>
              <li>Your donation can save up to <strong>3 lives</strong></li>
              <li>You've contributed to maintaining adequate blood supply</li>
              <li>Your donation is blockchain-verified for complete transparency</li>
              <li>You've helped patients in need of emergency care</li>
            </ul>
          </div>
          
          <p><strong>What's Next:</strong></p>
          <ul>
            <li>Your donation certificate is available in your donor dashboard</li>
            <li>You can track your blood unit's journey on the blockchain</li>
            <li>You'll be eligible to donate again in 56 days</li>
            <li>We'll notify you about future campaigns in your area</li>
          </ul>
          
          <p><strong>Post-Donation Care:</strong></p>
          <ul>
            <li>Drink plenty of fluids for the next 24 hours</li>
            <li>Avoid heavy lifting or strenuous exercise today</li>
            <li>Eat iron-rich foods to help replenish your blood</li>
            <li>Contact us if you experience any unusual symptoms</li>
          </ul>
          
          <p>Thank you once again for being a life-saver!</p>
        </div>
        <div class="footer">
          <p>LifeChain - Transparent Blood Supply Management</p>
          <p>Your donation makes a difference in someone's life.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, htmlContent);
}

// Initialize transporter on module load
initializeTransporter();

module.exports = {
  sendEmail,
  sendHospitalVerificationEmail,
  sendHospitalRejectionEmail,
  sendEmergencyRequestEmail,
  sendExpiryAlertEmail,
  sendCampaignInvitationEmail,
  sendCampaignRegistrationConfirmationEmail,
  sendCampaignReminderEmail,
  sendCampaignCancellationEmail,
  sendDonationVerificationThankYouEmail,
  emailMapping
};
