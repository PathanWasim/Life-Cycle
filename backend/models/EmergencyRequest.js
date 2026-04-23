const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
  hospitalID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  city: { 
    type: String, 
    required: true 
  },
  pincode: { 
    type: String, 
    required: true 
  },
  urgencyLevel: { 
    type: String, 
    enum: ['Critical', 'High', 'Medium'], 
    default: 'High' 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Fulfilled', 'Cancelled'], 
    default: 'Active' 
  },
  createdDate: { 
    type: Date, 
    default: Date.now 
  },
  fulfillmentDate: { 
    type: Date 
  },
  notifiedDonors: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  notes: { 
    type: String 
  }
}, {
  timestamps: true
});

// Indexes for performance
emergencyRequestSchema.index({ hospitalID: 1, status: 1 });
emergencyRequestSchema.index({ bloodGroup: 1, city: 1, status: 1 });
emergencyRequestSchema.index({ createdDate: -1 });

const EmergencyRequest = mongoose.model('EmergencyRequest', emergencyRequestSchema);

module.exports = EmergencyRequest;
