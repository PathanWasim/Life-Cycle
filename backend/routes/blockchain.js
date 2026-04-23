const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');
const blockchainParser = require('../utils/blockchainParser');

/**
 * @route   GET /api/blockchain/milestones/:bloodUnitID
 * @desc    Get all blockchain milestones for a blood unit
 * @access  Public
 */
router.get('/milestones/:bloodUnitID', async (req, res) => {
  try {
    const { bloodUnitID } = req.params;
    
    // Validate blood unit ID format
    if (!bloodUnitID || !bloodUnitID.startsWith('BU-')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood unit ID format'
      });
    }
    
    console.log(`📝 Fetching milestones for ${bloodUnitID}...`);
    
    // Get milestones from blockchain
    const rawMilestones = await blockchainService.getMilestones(bloodUnitID);
    
    if (!rawMilestones || rawMilestones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No milestones found for this blood unit'
      });
    }
    
    console.log(`✅ Found ${rawMilestones.length} milestones`);
    
    // Parse and format milestones
    const parsedMilestones = rawMilestones.map(milestone => {
      try {
        return blockchainParser.parseMilestone(milestone);
      } catch (error) {
        console.error('Error parsing milestone:', error);
        return null;
      }
    }).filter(m => m !== null);
    
    // Sort chronologically
    const sortedMilestones = blockchainParser.sortMilestones(parsedMilestones);
    
    // Verify chronological order
    const isChronological = sortedMilestones.every((milestone, index) => {
      if (index === 0) return true;
      const prevTimestamp = sortedMilestones[index - 1].timestamp;
      return milestone.timestamp >= prevTimestamp;
    });
    
    if (!isChronological) {
      console.warn('⚠️  Milestones are not in chronological order');
    }
    
    res.json({
      success: true,
      message: 'Milestones retrieved successfully',
      data: {
        bloodUnitID,
        milestones: sortedMilestones,
        totalMilestones: sortedMilestones.length,
        isChronological
      }
    });
    
  } catch (error) {
    console.error('Error retrieving milestones:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving milestones',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/blockchain/verify/:txHash
 * @desc    Verify a blockchain transaction
 * @access  Public
 */
router.get('/verify/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    
    // Validate transaction hash format
    if (!txHash || !txHash.startsWith('0x') || txHash.length !== 66) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction hash format'
      });
    }
    
    console.log(`🔍 Verifying transaction: ${txHash}`);
    
    // Get transaction details from blockchain
    const provider = blockchainService.provider;
    const transaction = await provider.getTransaction(txHash);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found on blockchain'
      });
    }
    
    // Get transaction receipt for confirmation status
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return res.status(200).json({
        success: true,
        message: 'Transaction found but not yet confirmed',
        data: {
          txHash,
          status: 'Pending',
          from: transaction.from,
          to: transaction.to,
          blockNumber: null,
          confirmations: 0
        }
      });
    }
    
    // Get current block number for confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;
    
    // Parse event logs
    const contract = blockchainService.contract;
    const events = [];
    
    for (const log of receipt.logs) {
      try {
        // Try to parse log with contract interface
        const parsedLog = contract.interface.parseLog({
          topics: log.topics,
          data: log.data
        });
        
        if (parsedLog) {
          events.push({
            eventName: parsedLog.name,
            args: Object.keys(parsedLog.args)
              .filter(key => isNaN(key)) // Filter out numeric keys
              .reduce((obj, key) => {
                const value = parsedLog.args[key];
                obj[key] = typeof value === 'bigint' ? value.toString() : value;
                return obj;
              }, {})
          });
        }
      } catch (e) {
        // Log is not from our contract, skip it
      }
    }
    
    console.log(`✅ Transaction verified: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
    
    res.json({
      success: true,
      message: 'Transaction verified successfully',
      data: {
        txHash,
        status: receipt.status === 1 ? 'Success' : 'Failed',
        from: blockchainParser.formatAddress(transaction.from),
        to: blockchainParser.formatAddress(transaction.to),
        blockNumber: receipt.blockNumber,
        confirmations,
        timestamp: blockchainParser.formatTimestamp(
          (await provider.getBlock(receipt.blockNumber)).timestamp
        ),
        gasUsed: receipt.gasUsed.toString(),
        events,
        explorerUrl: `https://amoy.polygonscan.com/tx/${txHash}`
      }
    });
    
  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying transaction',
      error: error.message
    });
  }
});

module.exports = router;
