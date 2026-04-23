/**
 * Blockchain Data Parser
 * Utilities for parsing and formatting blockchain data
 */

/**
 * Parse milestone data from blockchain
 * @param {Object} rawData - Raw milestone data from smart contract
 * @returns {Object} Parsed milestone object
 */
function parseMilestone(rawData) {
  try {
    // Validate required fields
    if (!rawData || !rawData.bloodUnitID || !rawData.milestoneType) {
      throw new Error('Invalid milestone data: missing required fields');
    }
    
    // Parse milestone type (convert from enum number to string)
    const milestoneTypes = ['Donation', 'Transfer', 'Usage'];
    const milestoneType = typeof rawData.milestoneType === 'number' 
      ? milestoneTypes[rawData.milestoneType] 
      : rawData.milestoneType;
    
    // Parse metadata (handle both string and object)
    let metadata = {};
    if (typeof rawData.metadata === 'string') {
      try {
        metadata = JSON.parse(rawData.metadata);
      } catch (e) {
        metadata = { raw: rawData.metadata };
      }
    } else if (typeof rawData.metadata === 'object') {
      metadata = rawData.metadata;
    }
    
    // Parse timestamp (handle both BigInt and number)
    const timestamp = typeof rawData.timestamp === 'bigint' 
      ? Number(rawData.timestamp) 
      : rawData.timestamp;
    
    return {
      bloodUnitID: rawData.bloodUnitID,
      milestoneType,
      actor: rawData.actor || metadata.hospitalID || 'Unknown',
      metadata,
      timestamp,
      formattedTimestamp: formatTimestamp(timestamp),
      formattedActor: formatAddress(rawData.actor || metadata.hospitalID || '')
    };
  } catch (error) {
    console.error('Error parsing milestone:', error);
    throw new Error(`Failed to parse milestone: ${error.message}`);
  }
}

/**
 * Format Unix timestamp to human-readable date
 * @param {number} unixTimestamp - Unix timestamp in seconds
 * @returns {string} Formatted date string (YYYY-MM-DD HH:MM:SS UTC)
 */
function formatTimestamp(unixTimestamp) {
  try {
    if (!unixTimestamp) {
      return 'N/A';
    }
    
    const date = new Date(unixTimestamp * 1000);
    
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid Date';
  }
}

/**
 * Format wallet address to shortened format
 * @param {string} walletAddress - Full wallet address (0x...)
 * @returns {string} Shortened address (0x1234...5678)
 */
function formatAddress(walletAddress) {
  try {
    if (!walletAddress || typeof walletAddress !== 'string') {
      return 'N/A';
    }
    
    // Remove any whitespace
    const address = walletAddress.trim();
    
    // Validate address format (should start with 0x and be 42 characters)
    if (!address.startsWith('0x') || address.length !== 42) {
      return address; // Return as-is if not a valid address
    }
    
    // Format as 0x1234...5678
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  } catch (error) {
    console.error('Error formatting address:', error);
    return walletAddress || 'N/A';
  }
}

/**
 * Validate milestone data completeness
 * @param {Object} milestone - Milestone object to validate
 * @returns {Object} Validation result { isValid, errors }
 */
function validateMilestone(milestone) {
  const errors = [];
  
  if (!milestone.bloodUnitID) {
    errors.push('Missing bloodUnitID');
  }
  
  if (!milestone.milestoneType) {
    errors.push('Missing milestoneType');
  }
  
  if (!milestone.timestamp || milestone.timestamp === 0) {
    errors.push('Missing or invalid timestamp');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sort milestones chronologically
 * @param {Array} milestones - Array of milestone objects
 * @returns {Array} Sorted milestones (oldest first)
 */
function sortMilestones(milestones) {
  return milestones.sort((a, b) => {
    const timestampA = typeof a.timestamp === 'bigint' ? Number(a.timestamp) : a.timestamp;
    const timestampB = typeof b.timestamp === 'bigint' ? Number(b.timestamp) : b.timestamp;
    return timestampA - timestampB;
  });
}

module.exports = {
  parseMilestone,
  formatTimestamp,
  formatAddress,
  validateMilestone,
  sortMilestones
};
