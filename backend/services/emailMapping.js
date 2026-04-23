/**
 * Email Mapping Service
 * Maps demo email addresses to real email addresses for notifications
 * This allows clean demo credentials while sending real emails
 */

// Mapping from demo emails to real emails
const EMAIL_MAPPING = {
  // Admin
  'admin@lifechain.com': 'sabalen666@gmail.com',
  
  // Hospitals
  'sample.hospital1@example.com': 'nileshsabale8869@gmail.com',
  'sample.hospital2@example.com': 'nilesh.sabale.dev@gmail.com',
  
  // Donors - Keep original email addresses
  'sample.donor1@example.com': 'ns7499244144@gmail.com',
  'sample.donor2@example.com': 'kingmaker0633@gmail.com',
  'sample.donor3@example.com': 'userns3106@gmail.com'
};

/**
 * Get real email address for notifications
 * @param {string} demoEmail - Demo email address from database
 * @returns {string} Real email address for sending notifications
 */
function getRealEmailForNotification(demoEmail) {
  // Return mapped real email if exists, otherwise return original email
  return EMAIL_MAPPING[demoEmail] || demoEmail;
}

/**
 * Get demo email for display purposes
 * @param {string} realEmail - Real email address
 * @returns {string} Demo email address for display
 */
function getDemoEmailForDisplay(realEmail) {
  // Find demo email by real email (reverse lookup)
  for (const [demoEmail, mappedRealEmail] of Object.entries(EMAIL_MAPPING)) {
    if (mappedRealEmail === realEmail) {
      return demoEmail;
    }
  }
  return realEmail;
}

/**
 * Check if email is a demo email
 * @param {string} email - Email address to check
 * @returns {boolean} True if it's a demo email
 */
function isDemoEmail(email) {
  return EMAIL_MAPPING.hasOwnProperty(email);
}

/**
 * Get all email mappings for debugging
 * @returns {Object} Complete email mapping object
 */
function getAllMappings() {
  return EMAIL_MAPPING;
}

module.exports = {
  getRealEmailForNotification,
  getDemoEmailForDisplay,
  isDemoEmail,
  getAllMappings
};