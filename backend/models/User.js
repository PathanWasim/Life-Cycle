const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Common fields for all users
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['Donor', 'Hospital', 'Admin'], 
    required: true 
  },
  walletAddress: { 
    type: String, 
    required: true 
  },
  
  // Donor-specific fields
  name: { 
    type: String, 
    required: function() { return this.role === 'Donor'; } 
  },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function() { return this.role === 'Donor'; }
  },
  dateOfBirth: { 
    type: Date,
    required: function() { return this.role === 'Donor'; }
  },
  weight: { 
    type: Number, // in kg
    required: function() { return this.role === 'Donor'; }
  },
  city: { 
    type: String,
    required: function() { return this.role === 'Donor' || this.role === 'Hospital'; }
  },
  pincode: { 
    type: String,
    required: function() { return this.role === 'Donor' || this.role === 'Hospital'; }
  },
  lastDonationDate: { 
    type: Date, 
    default: null 
  },
  eligibilityStatus: { 
    type: String, 
    default: 'Eligible' 
  },
  
  // Hospital-specific fields
  hospitalName: { 
    type: String, 
    required: function() { return this.role === 'Hospital'; } 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Virtual field for age calculation
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Method to check donor eligibility
// Requirements: Age 18-60, Weight ≥50kg, 56-day rule
userSchema.methods.checkEligibility = function() {
  if (this.role !== 'Donor') return 'N/A';
  
  // Check age (18-60 years)
  const age = this.age;
  if (!age || age < 18) return 'Ineligible - Age (Must be 18 or older)';
  if (age > 60) return 'Ineligible - Age (Must be 60 or younger)';
  
  // Check weight (minimum 50kg)
  if (!this.weight || this.weight < 50) return 'Ineligible - Weight (Must be at least 50kg)';
  
  // Check 56-day rule (must wait 56 days between donations)
  if (this.lastDonationDate) {
    const daysSinceLastDonation = Math.floor(
      (Date.now() - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastDonation < 56) {
      const daysRemaining = 56 - daysSinceLastDonation;
      return `Ineligible - Must wait ${daysRemaining} more days (56-day rule)`;
    }
  }
  
  return 'Eligible';
};

// Method to calculate days since last donation
userSchema.methods.daysSinceLastDonation = function() {
  if (!this.lastDonationDate) return null;
  return Math.floor(
    (Date.now() - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
  );
};

// Indexes for performance
userSchema.index({ role: 1 });
userSchema.index({ bloodGroup: 1, city: 1 });
userSchema.index({ bloodGroup: 1, pincode: 1 });
userSchema.index({ isVerified: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
