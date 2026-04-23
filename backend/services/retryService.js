const BlockchainRetry = require('../models/BlockchainRetry');
const BloodUnit = require('../models/BloodUnit');
const blockchainService = require('./blockchainService');

class RetryService {
  constructor() {
    this.isProcessing = false;
    this.retryInterval = 5 * 60 * 1000; // 5 minutes
    this.maxRetryAge = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Queue a failed blockchain milestone for retry
   * @param {string} bloodUnitID - Blood unit identifier
   * @param {string} milestoneType - Type: 'Donation', 'Transfer', or 'Usage'
   * @param {object} metadata - Milestone metadata
   * @returns {Promise<object>} Queued retry record
   */
  async queueMilestone(bloodUnitID, milestoneType, metadata) {
    try {
      console.log(`📥 Queuing ${milestoneType} milestone for retry: ${bloodUnitID}`);
      
      const retryRecord = await BlockchainRetry.create({
        bloodUnitID,
        milestoneType,
        metadata,
        attempts: 0,
        lastAttempt: null,
        status: 'pending'
      });
      
      console.log(`✅ Milestone queued for retry (ID: ${retryRecord._id})`);
      
      return retryRecord;
    } catch (error) {
      console.error('❌ Failed to queue milestone:', error.message);
      throw error;
    }
  }

  /**
   * Process the retry queue - attempt to resubmit failed milestones
   * @returns {Promise<object>} Processing results
   */
  async processRetryQueue() {
    // Prevent concurrent processing
    if (this.isProcessing) {
      console.log('⏭️  Retry queue already being processed, skipping...');
      return { skipped: true };
    }

    this.isProcessing = true;
    console.log('🔄 Processing blockchain retry queue...');

    try {
      // Find all pending retry records
      const pendingRetries = await BlockchainRetry.find({ status: 'pending' });
      
      if (pendingRetries.length === 0) {
        console.log('✅ No pending retries in queue');
        return { processed: 0, succeeded: 0, failed: 0 };
      }

      console.log(`📋 Found ${pendingRetries.length} pending retries`);

      let succeeded = 0;
      let failed = 0;

      for (const retry of pendingRetries) {
        try {
          // Check if retry is too old (>24 hours)
          const age = Date.now() - retry.createdAt.getTime();
          if (age > this.maxRetryAge) {
            console.log(`⚠️  Retry ${retry._id} is older than 24 hours, sending alert...`);
            await this.sendAdminAlert(retry);
            
            // Mark as failed after 24 hours
            retry.status = 'failed';
            retry.error = 'Exceeded 24-hour retry window';
            await retry.save();
            failed++;
            continue;
          }

          // Attempt to record milestone on blockchain
          let result;
          switch (retry.milestoneType) {
            case 'Donation':
              result = await blockchainService.recordDonationMilestone(
                retry.bloodUnitID,
                retry.metadata
              );
              break;
            case 'Transfer':
              result = await blockchainService.recordTransferMilestone(
                retry.bloodUnitID,
                retry.metadata
              );
              break;
            case 'Usage':
              result = await blockchainService.recordUsageMilestone(
                retry.bloodUnitID,
                retry.metadata
              );
              break;
            default:
              throw new Error(`Unknown milestone type: ${retry.milestoneType}`);
          }

          // Success! Update BloodUnit with transaction hash
          await this.updateBloodUnitWithTxHash(
            retry.bloodUnitID,
            retry.milestoneType,
            result.transactionHash
          );

          // Mark retry as completed
          retry.status = 'completed';
          retry.transactionHash = result.transactionHash;
          await retry.save();

          console.log(`✅ Retry successful for ${retry.bloodUnitID} (${retry.milestoneType})`);
          succeeded++;

        } catch (error) {
          // Update retry record with error
          retry.attempts += 1;
          retry.lastAttempt = new Date();
          retry.error = error.message;
          await retry.save();

          console.error(`❌ Retry failed for ${retry.bloodUnitID}: ${error.message}`);
          failed++;
        }
      }

      console.log(`✅ Retry queue processed: ${succeeded} succeeded, ${failed} failed`);
      
      return {
        processed: pendingRetries.length,
        succeeded,
        failed
      };

    } catch (error) {
      console.error('❌ Error processing retry queue:', error.message);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Update BloodUnit with transaction hash after successful retry
   * @param {string} bloodUnitID - Blood unit identifier
   * @param {string} milestoneType - Type of milestone
   * @param {string} transactionHash - Blockchain transaction hash
   */
  async updateBloodUnitWithTxHash(bloodUnitID, milestoneType, transactionHash) {
    try {
      const bloodUnit = await BloodUnit.findOne({ bloodUnitID });
      
      if (!bloodUnit) {
        console.warn(`⚠️  BloodUnit ${bloodUnitID} not found for tx hash update`);
        return;
      }

      switch (milestoneType) {
        case 'Donation':
          bloodUnit.donationTxHash = transactionHash;
          break;
        case 'Transfer':
          bloodUnit.transferTxHashes.push(transactionHash);
          break;
        case 'Usage':
          bloodUnit.usageTxHash = transactionHash;
          break;
      }

      await bloodUnit.save();
      console.log(`✅ Updated BloodUnit ${bloodUnitID} with tx hash`);
    } catch (error) {
      console.error(`❌ Failed to update BloodUnit with tx hash: ${error.message}`);
    }
  }

  /**
   * Send alert email to admin when retry fails for 24 hours
   * @param {object} retry - Retry record
   */
  async sendAdminAlert(retry) {
    try {
      // TODO: Implement email service integration
      console.log(`📧 ADMIN ALERT: Blockchain retry failed for 24 hours`);
      console.log(`   Blood Unit ID: ${retry.bloodUnitID}`);
      console.log(`   Milestone Type: ${retry.milestoneType}`);
      console.log(`   Attempts: ${retry.attempts}`);
      console.log(`   Last Error: ${retry.error}`);
      console.log(`   Created: ${retry.createdAt}`);
      
      // When email service is implemented, send email here
      // await emailService.sendAdminAlert({ ... });
      
    } catch (error) {
      console.error('❌ Failed to send admin alert:', error.message);
    }
  }

  /**
   * Start the retry queue processor (runs every 5 minutes)
   */
  startRetryProcessor() {
    console.log('🚀 Starting blockchain retry queue processor...');
    console.log(`⏰ Will run every ${this.retryInterval / 1000 / 60} minutes`);
    
    // Run immediately on start
    this.processRetryQueue().catch(err => {
      console.error('❌ Initial retry queue processing failed:', err.message);
    });
    
    // Then run every 5 minutes
    this.intervalId = setInterval(() => {
      this.processRetryQueue().catch(err => {
        console.error('❌ Retry queue processing failed:', err.message);
      });
    }, this.retryInterval);
  }

  /**
   * Stop the retry queue processor
   */
  stopRetryProcessor() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('🛑 Retry queue processor stopped');
    }
  }
}

// Create singleton instance
const retryService = new RetryService();

module.exports = retryService;
