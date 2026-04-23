const mongoose = require('mongoose');

const blockchainRetrySchema = new mongoose.Schema({
  bloodUnitID: { 
    type: String, 
    required: true 
  },
  milestoneType: { 
    type: String, 
    enum: ['Donation', 'Transfer', 'Usage'], 
    required: true 
  },
  metadata: { 
    type: Object, 
    required: true 
  },
  attempts: { 
    type: Number, 
    default: 0 
  },
  lastAttempt: { 
    type: Date 
  },
  error: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes for performance
blockchainRetrySchema.index({ status: 1, attempts: 1 });
blockchainRetrySchema.index({ createdAt: 1 });

const BlockchainRetry = mongoose.model('BlockchainRetry', blockchainRetrySchema);

module.exports = BlockchainRetry;
