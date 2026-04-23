const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  campaignID: { 
    type: String, 
    required: true, 
    unique: true,
    default: function() {
      return `CAMP-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    }
  },
  creatorHospitalID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Campaign Details
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 1000
  },
  venue: {
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200
    },
    address: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 500
    },
    city: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 100
    },
    pincode: { 
      type: String, 
      required: true,
      trim: true,
      match: /^[0-9]{6}$/
    }
  },
  
  // Schedule
  campaignDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day
        return date >= today; // Allow today or future dates
      },
      message: 'Campaign date cannot be in the past'
    }
  },
  startTime: { 
    type: String, 
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    default: '09:00'
  },
  endTime: { 
    type: String, 
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    default: '17:00'
  },
  
  // Blood Requirements
  bloodGroupsNeeded: [{ 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  }],
  targetQuantity: { 
    type: Number, 
    required: true, 
    min: 1,
    max: 500
  },
  
  // Status Management
  status: { 
    type: String, 
    enum: ['Draft', 'Active', 'Completed', 'Cancelled'], 
    default: 'Draft' 
  },
  
  // Invitation Tracking
  invitationsSent: { 
    type: Number, 
    default: 0 
  },
  invitedDonorIDs: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Analytics
  registeredCount: { 
    type: Number, 
    default: 0 
  },
  attendedCount: { 
    type: Number, 
    default: 0 
  },
  verifiedDonations: { 
    type: Number, 
    default: 0 
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Pre-save validation for time logic
campaignSchema.pre('save', function() {
  // Validate that endTime is after startTime
  const startHour = parseInt(this.startTime.split(':')[0]);
  const startMinute = parseInt(this.startTime.split(':')[1]);
  const endHour = parseInt(this.endTime.split(':')[0]);
  const endMinute = parseInt(this.endTime.split(':')[1]);
  
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  
  if (endTotalMinutes <= startTotalMinutes) {
    throw new Error('End time must be after start time');
  }
  
  // Ensure bloodGroupsNeeded is not empty
  if (!this.bloodGroupsNeeded || this.bloodGroupsNeeded.length === 0) {
    throw new Error('At least one blood group must be specified');
  }
});

// Method to check if campaign is active
campaignSchema.methods.isActive = function() {
  return this.status === 'Active';
};

// Method to check if campaign is today
campaignSchema.methods.isToday = function() {
  const today = new Date();
  const campaignDate = new Date(this.campaignDate);
  return today.toDateString() === campaignDate.toDateString();
};

// Method to check if campaign has passed
campaignSchema.methods.hasPassed = function() {
  const now = new Date();
  const campaignDateTime = new Date(this.campaignDate);
  const [endHour, endMinute] = this.endTime.split(':').map(Number);
  campaignDateTime.setHours(endHour, endMinute, 0, 0);
  return now > campaignDateTime;
};

// Method to validate status transitions
campaignSchema.methods.canTransitionTo = function(newStatus) {
  const validTransitions = {
    'Draft': ['Active', 'Cancelled'],
    'Active': ['Completed', 'Cancelled'],
    'Completed': [],
    'Cancelled': []
  };
  
  return validTransitions[this.status].includes(newStatus);
};

// Method to calculate collection rate
campaignSchema.methods.getCollectionRate = function() {
  if (this.registeredCount === 0) return 0;
  return Math.round((this.verifiedDonations / this.registeredCount) * 100);
};

// Method to calculate attendance rate
campaignSchema.methods.getAttendanceRate = function() {
  if (this.registeredCount === 0) return 0;
  return Math.round((this.attendedCount / this.registeredCount) * 100);
};

// Method to check if target is met
campaignSchema.methods.isTargetMet = function() {
  return this.verifiedDonations >= this.targetQuantity;
};

// Indexes for performance
campaignSchema.index({ creatorHospitalID: 1, status: 1 });
campaignSchema.index({ 'venue.city': 1, status: 1, campaignDate: 1 });
campaignSchema.index({ 'venue.pincode': 1, status: 1, campaignDate: 1 });
campaignSchema.index({ bloodGroupsNeeded: 1, status: 1 });
campaignSchema.index({ campaignDate: 1, status: 1 });
campaignSchema.index({ status: 1, campaignDate: 1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;