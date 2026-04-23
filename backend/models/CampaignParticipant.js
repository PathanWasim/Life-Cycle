const mongoose = require('mongoose');

const campaignParticipantSchema = new mongoose.Schema({
  campaignID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Campaign', 
    required: true 
  },
  donorID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Registration Details
  registrationDate: { 
    type: Date, 
    default: Date.now 
  },
  registrationSource: { 
    type: String, 
    enum: ['invitation', 'discovery', 'direct'], 
    default: 'discovery' 
  },
  
  // Attendance Tracking
  attendanceStatus: { 
    type: String, 
    enum: ['Registered', 'Marked Done by Donor', 'Verified by Hospital', 'Absent'], 
    default: 'Registered' 
  },
  
  // Donation Details (when verified)
  donationVerified: { 
    type: Boolean, 
    default: false 
  },
  bloodUnitID: { 
    type: String,
    default: null
  },
  verificationDate: { 
    type: Date,
    default: null
  },
  verifiedByHospitalID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  
  // Additional tracking
  markedDoneDate: { 
    type: Date,
    default: null
  },
  markedAbsentDate: { 
    type: Date,
    default: null
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate registrations
campaignParticipantSchema.index({ campaignID: 1, donorID: 1 }, { unique: true });

// Additional indexes for performance
campaignParticipantSchema.index({ campaignID: 1, attendanceStatus: 1 });
campaignParticipantSchema.index({ donorID: 1, registrationDate: -1 });
campaignParticipantSchema.index({ attendanceStatus: 1 });

// Method to check if participant can mark as done
campaignParticipantSchema.methods.canMarkAsDone = function() {
  return this.attendanceStatus === 'Registered';
};

// Method to check if participant can be verified
campaignParticipantSchema.methods.canBeVerified = function() {
  return this.attendanceStatus === 'Marked Done by Donor';
};

// Method to check if participant can be marked absent
campaignParticipantSchema.methods.canBeMarkedAbsent = function() {
  return ['Registered', 'Marked Done by Donor'].includes(this.attendanceStatus);
};

// Method to update attendance status with validation
campaignParticipantSchema.methods.updateAttendanceStatus = function(newStatus, additionalData = {}) {
  const validTransitions = {
    'Registered': ['Marked Done by Donor', 'Absent'],
    'Marked Done by Donor': ['Verified by Hospital', 'Absent'],
    'Verified by Hospital': [],
    'Absent': []
  };
  
  if (!validTransitions[this.attendanceStatus].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.attendanceStatus} to ${newStatus}`);
  }
  
  this.attendanceStatus = newStatus;
  
  // Set additional fields based on status
  switch (newStatus) {
    case 'Marked Done by Donor':
      this.markedDoneDate = new Date();
      break;
    case 'Verified by Hospital':
      this.donationVerified = true;
      this.verificationDate = new Date();
      if (additionalData.bloodUnitID) {
        this.bloodUnitID = additionalData.bloodUnitID;
      }
      if (additionalData.verifiedByHospitalID) {
        this.verifiedByHospitalID = additionalData.verifiedByHospitalID;
      }
      break;
    case 'Absent':
      this.markedAbsentDate = new Date();
      break;
  }
  
  return this;
};

// Method to get status display information
campaignParticipantSchema.methods.getStatusInfo = function() {
  const statusInfo = {
    'Registered': {
      color: 'blue',
      icon: '📝',
      description: 'Registered for campaign'
    },
    'Marked Done by Donor': {
      color: 'yellow',
      icon: '✋',
      description: 'Donor marked donation as completed'
    },
    'Verified by Hospital': {
      color: 'green',
      icon: '✅',
      description: 'Donation verified by hospital'
    },
    'Absent': {
      color: 'red',
      icon: '❌',
      description: 'Did not attend campaign'
    }
  };
  
  return statusInfo[this.attendanceStatus] || {
    color: 'gray',
    icon: '❓',
    description: 'Unknown status'
  };
};

// Static method to get participation statistics for a campaign
campaignParticipantSchema.statics.getCampaignStats = async function(campaignID) {
  const stats = await this.aggregate([
    { $match: { campaignID: new mongoose.Types.ObjectId(campaignID) } },
    {
      $group: {
        _id: '$attendanceStatus',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    registered: 0,
    markedDone: 0,
    verified: 0,
    absent: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    switch (stat._id) {
      case 'Registered':
        result.registered = stat.count;
        break;
      case 'Marked Done by Donor':
        result.markedDone = stat.count;
        break;
      case 'Verified by Hospital':
        result.verified = stat.count;
        break;
      case 'Absent':
        result.absent = stat.count;
        break;
    }
    result.total += stat.count;
  });
  
  return result;
};

// Static method to get donor's campaign history
campaignParticipantSchema.statics.getDonorHistory = async function(donorID, limit = 10) {
  return this.find({ donorID })
    .populate('campaignID', 'title campaignDate venue status')
    .sort({ registrationDate: -1 })
    .limit(limit);
};

const CampaignParticipant = mongoose.model('CampaignParticipant', campaignParticipantSchema);

module.exports = CampaignParticipant;