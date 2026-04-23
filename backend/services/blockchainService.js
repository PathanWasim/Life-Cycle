const { ethers } = require('ethers');
require('dotenv').config();

// Import the contract ABI (bundled inside backend for deployment)
const BloodChainABI = require('../abi/BloodChain.json');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.initialized = false;
  }

  /**
   * Initialize the blockchain service with provider, wallet, and contract
   */
  async initialize() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

      // Initialize wallet with private key
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

      // Initialize contract instance
      this.contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        BloodChainABI,
        this.wallet
      );

      this.initialized = true;
      console.log('✅ Blockchain service initialized successfully');
      console.log(`📍 Contract Address: ${process.env.CONTRACT_ADDRESS}`);
      console.log(`🔗 Network: ${process.env.BLOCKCHAIN_RPC_URL}`);
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error.message);
      throw error;
    }
  }

  /**
   * Ensure the service is initialized before operations
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Blockchain service not initialized. Call initialize() first.');
    }
  }

  /**
   * Record a donation milestone on the blockchain
   * @param {string} bloodUnitID - Unique identifier for the blood unit
   * @param {object} metadata - Donation metadata (donorID, hospitalID, bloodGroup, timestamp)
   * @returns {Promise<object>} Transaction receipt with hash
   */
  async recordDonationMilestone(bloodUnitID, metadata) {
    this.ensureInitialized();

    try {
      console.log(`📝 Recording donation milestone for ${bloodUnitID}...`);

      // Convert metadata to JSON string
      const metadataString = JSON.stringify(metadata);

      // Call smart contract function
      const tx = await this.contract.recordDonation(bloodUnitID, metadataString);

      console.log(`⏳ Transaction submitted: ${tx.hash}`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      console.log(`✅ Donation milestone recorded! Block: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Failed to record donation milestone:', error.message);
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  /**
   * Record a transfer milestone on the blockchain
   * @param {string} bloodUnitID - Unique identifier for the blood unit
   * @param {object} metadata - Transfer metadata (fromHospitalID, toHospitalID, timestamp)
   * @returns {Promise<object>} Transaction receipt with hash
   */
  async recordTransferMilestone(bloodUnitID, metadata) {
    this.ensureInitialized();

    try {
      console.log(`📝 Recording transfer milestone for ${bloodUnitID}...`);

      // Convert metadata to JSON string
      const metadataString = JSON.stringify(metadata);

      // Call smart contract function
      const tx = await this.contract.recordTransfer(bloodUnitID, metadataString);

      console.log(`⏳ Transaction submitted: ${tx.hash}`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      console.log(`✅ Transfer milestone recorded! Block: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Failed to record transfer milestone:', error.message);
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  /**
   * Record a usage milestone on the blockchain
   * @param {string} bloodUnitID - Unique identifier for the blood unit
   * @param {object} metadata - Usage metadata (hospitalID, patientID, timestamp)
   * @returns {Promise<object>} Transaction receipt with hash
   */
  async recordUsageMilestone(bloodUnitID, metadata) {
    this.ensureInitialized();

    try {
      console.log(`📝 Recording usage milestone for ${bloodUnitID}...`);

      // Convert metadata to JSON string
      const metadataString = JSON.stringify(metadata);

      // Call smart contract function
      const tx = await this.contract.recordUsage(bloodUnitID, metadataString);

      console.log(`⏳ Transaction submitted: ${tx.hash}`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      console.log(`✅ Usage milestone recorded! Block: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Failed to record usage milestone:', error.message);
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  /**
   * Get all milestones for a blood unit from the blockchain
   * @param {string} bloodUnitID - Unique identifier for the blood unit
   * @returns {Promise<Array>} Array of milestone objects
   */
  async getMilestones(bloodUnitID) {
    this.ensureInitialized();

    try {
      console.log(`🔍 Fetching milestones for ${bloodUnitID}...`);

      // Call smart contract view function
      const milestones = await this.contract.getMilestones(bloodUnitID);

      // Parse and format milestones
      const formattedMilestones = milestones.map(milestone => {
        // Parse metadata JSON
        let metadata = {};
        try {
          metadata = JSON.parse(milestone.metadata);
        } catch (e) {
          metadata = { raw: milestone.metadata };
        }

        // Map milestone type enum to string
        const milestoneTypes = ['Donation', 'Transfer', 'Usage'];

        return {
          bloodUnitID: milestone.bloodUnitID,
          milestoneType: milestoneTypes[milestone.milestoneType],
          actor: milestone.actor,
          metadata: metadata,
          timestamp: Number(milestone.timestamp),
          date: new Date(Number(milestone.timestamp) * 1000).toISOString()
        };
      });

      console.log(`✅ Found ${formattedMilestones.length} milestones`);

      return formattedMilestones;
    } catch (error) {
      console.error('❌ Failed to fetch milestones:', error.message);
      throw new Error(`Failed to fetch blockchain data: ${error.message}`);
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
