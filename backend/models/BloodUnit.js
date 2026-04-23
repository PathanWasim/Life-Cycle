const mongoose = require('mongoose');

const bloodUnitSchema = new mongoose.Schema({
  bloodUnitID: { 
    type: String, 
    required: true, 
    unique: true,
    default: function() {
      return `BU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  },
  donorID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
    required: true 
  },
  collectionDate: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  expiryDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Collected', 'Stored', 'Transferred', 'Used'], 
    default: 'Collected' 
  },
  originalHospitalID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  currentHospitalID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Transfer history
  transferHistory: [{
    fromHospitalID: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    toHospitalID: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    transferDate: { 
      type: Date 
    },
    transferredBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    blockchainTxHash: {
      type: String
    }
  }],
  
  // Usage information
  usageDate: { 
    type: Date 
  },
  patientID: { 
    type: String 
  },
  
  // Campaign integration
  campaignID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Campaign',
    default: null
  },
  campaignDonation: { 
    type: Boolean, 
    default: false 
  },
  
  // Blockchain transaction references
  donationTxHash: { 
    type: String 
  },
  transferTxHashes: [{ 
    type: String 
  }],
  usageTxHash: { 
    type: String 
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate expiry date (42 days from collection)
bloodUnitSchema.pre('save', async function() {
  if (this.isNew && !this.expiryDate) {
    const expiry = new Date(this.collectionDate);
    expiry.setDate(expiry.getDate() + 42); // Blood expires in 42 days
    this.expiryDate = expiry;
  }
});

// Method to check if blood unit is expired
bloodUnitSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

// Method to get days until expiry
bloodUnitSchema.methods.daysUntilExpiry = function() {
  const now = new Date();
  const diffTime = this.expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Indexes for performance
bloodUnitSchema.index({ currentHospitalID: 1, status: 1 });
bloodUnitSchema.index({ bloodGroup: 1, status: 1 });
bloodUnitSchema.index({ expiryDate: 1 });
bloodUnitSchema.index({ donorID: 1 });
bloodUnitSchema.index({ campaignID: 1 });
bloodUnitSchema.index({ campaignDonation: 1, status: 1 });

const BloodUnit = mongoose.model('BloodUnit', bloodUnitSchema);

module.exports = BloodUnit;
