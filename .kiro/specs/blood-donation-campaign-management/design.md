# Design Document: Blood Donation Campaign Management

## Introduction

This design document outlines the technical implementation for the Blood Donation Campaign Management feature, which extends the existing LifeChain blood supply management system. The feature enables hospitals to organize blood donation campaigns, allows donors to discover and register for campaigns, and provides public visibility into regional blood availability.

## System Architecture Overview

The campaign management feature integrates with the existing LifeChain architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  + Campaign Management (Hospitals)                          │
│  + Campaign Discovery (Donors)                              │
│  + Public Blood Search (Unauthenticated)                    │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                   BACKEND (Node.js/Express)                 │
│  + Campaign CRUD APIs                                       │
│  + Registration & Attendance APIs                           │
│  + Invitation System                                        │
│  + Public Blood Availability API                            │
└─────┬──────────────┬──────────────┬────────────────────────┘
      │              │              │
      ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│ MongoDB  │  │Blockchain│  │ Email Service│
│+ Campaigns│  │ (Existing)│  │ (Existing)   │
│+ CampaignP│  │          │  │              │
└──────────┘  └──────────┘  └──────────────┘
```

## Database Design

### New Collections

#### 1. Campaigns Collection

```javascript
{
  _id: ObjectId,
  campaignID: String, // "CAMP-{timestamp}-{random}"
  creatorHospitalID: ObjectId, // ref: 'User'
  
  // Campaign Details
  title: String,
  description: String,
  venue: {
    name: String,
    address: String,
    city: String,
    pincode: String
  },
  
  // Schedule
  campaignDate: Date,
  startTime: String, // "09:00"
  endTime: String,   // "17:00"
  
  // Blood Requirements
  bloodGroupsNeeded: [String], // ['A+', 'B+', 'O+']
  targetQuantity: Number,
  
  // Status Management
  status: String, // 'Draft', 'Active', 'Completed', 'Cancelled'
  
  // Invitation Tracking
  invitationsSent: Number,
  invitedDonorIDs: [ObjectId], // ref: 'User'
  
  // Analytics
  registeredCount: Number,
  attendedCount: Number,
  verifiedDonations: Number,
  
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. CampaignParticipants Collection

```javascript
{
  _id: ObjectId,
  campaignID: ObjectId, // ref: 'Campaign'
  donorID: ObjectId,    // ref: 'User'
  
  // Registration
  registrationDate: Date,
  registrationSource: String, // 'invitation', 'discovery', 'direct'
  
  // Attendance Tracking
  attendanceStatus: String, // 'Registered', 'Marked Done by Donor', 'Verified by Hospital', 'Absent'
  
  // Donation Details (when verified)
  donationVerified: Boolean,
  bloodUnitID: String, // Links to BloodUnit
  verificationDate: Date,
  verifiedByHospitalID: ObjectId,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Modified Collections

#### BloodUnit Collection (Add Campaign Reference)

```javascript
// Add to existing BloodUnit schema:
{
  // ... existing fields ...
  campaignID: ObjectId, // ref: 'Campaign' (optional)
  campaignDonation: Boolean, // true if collected during campaign
}
```

## API Design

### Campaign Management APIs

#### 1. Create Campaign
```
POST /api/hospital/campaigns
Authorization: Bearer {token}
Role: Hospital (verified)

Request Body:
{
  "title": "Community Blood Drive - March 2026",
  "description": "Annual blood donation campaign",
  "venue": {
    "name": "City Community Center",
    "address": "123 Main Street",
    "city": "Mumbai",
    "pincode": "400001"
  },
  "campaignDate": "2026-03-20",
  "startTime": "09:00",
  "endTime": "17:00",
  "bloodGroupsNeeded": ["A+", "B+", "O+", "AB+"],
  "targetQuantity": 50
}

Response:
{
  "success": true,
  "message": "Campaign created successfully",
  "data": {
    "campaignID": "CAMP-1773172321120-abc123",
    "status": "Draft",
    "createdAt": "2026-03-15T10:00:00Z"
  }
}
```

#### 2. Update Campaign Status
```
PATCH /api/hospital/campaigns/{campaignID}/status
Authorization: Bearer {token}
Role: Hospital (creator only)

Request Body:
{
  "status": "Active"
}

Response:
{
  "success": true,
  "message": "Campaign activated and invitations sent",
  "data": {
    "campaignID": "CAMP-1773172321120-abc123",
    "status": "Active",
    "invitationsSent": 25,
    "eligibleDonorsFound": 25
  }
}
```

#### 3. Get Hospital Campaigns
```
GET /api/hospital/campaigns?status=Active&page=1&limit=10
Authorization: Bearer {token}
Role: Hospital

Response:
{
  "success": true,
  "data": {
    "campaigns": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### Campaign Discovery APIs

#### 4. Get Active Campaigns (Donors)
```
GET /api/campaigns/active?city=Mumbai&bloodGroup=A+&page=1
Authorization: Bearer {token} (optional)
Role: Any

Response:
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "campaignID": "CAMP-1773172321120-abc123",
        "title": "Community Blood Drive",
        "venue": {
          "name": "City Community Center",
          "address": "123 Main Street",
          "city": "Mumbai"
        },
        "campaignDate": "2026-03-20",
        "startTime": "09:00",
        "endTime": "17:00",
        "bloodGroupsNeeded": ["A+", "B+"],
        "targetQuantity": 50,
        "registeredCount": 15,
        "hospital": {
          "name": "City General Hospital",
          "city": "Mumbai"
        },
        "isRegistered": false // if authenticated
      }
    ]
  }
}
```

### Registration APIs

#### 5. Register for Campaign
```
POST /api/campaigns/{campaignID}/register
Authorization: Bearer {token}
Role: Donor

Response:
{
  "success": true,
  "message": "Successfully registered for campaign",
  "data": {
    "campaignID": "CAMP-1773172321120-abc123",
    "registrationDate": "2026-03-15T10:30:00Z",
    "attendanceStatus": "Registered"
  }
}
```

#### 6. Mark Donation as Done
```
POST /api/campaigns/{campaignID}/mark-done
Authorization: Bearer {token}
Role: Donor

Response:
{
  "success": true,
  "message": "Donation marked as completed",
  "data": {
    "attendanceStatus": "Marked Done by Donor",
    "awaitingVerification": true
  }
}
```

### Attendance Management APIs

#### 7. Get Campaign Participants
```
GET /api/hospital/campaigns/{campaignID}/participants
Authorization: Bearer {token}
Role: Hospital (creator only)

Response:
{
  "success": true,
  "data": {
    "participants": [
      {
        "donorID": "...",
        "donorName": "John Doe",
        "donorEmail": "john@example.com",
        "bloodGroup": "A+",
        "registrationDate": "2026-03-15T10:30:00Z",
        "attendanceStatus": "Marked Done by Donor",
        "canVerify": true
      }
    ],
    "summary": {
      "registered": 20,
      "markedDone": 5,
      "verified": 3,
      "absent": 2
    }
  }
}
```

#### 8. Verify Donation
```
POST /api/hospital/campaigns/{campaignID}/verify-donation
Authorization: Bearer {token}
Role: Hospital (creator only)

Request Body:
{
  "donorID": "...",
  "bloodGroup": "A+",
  "collectionDate": "2026-03-20"
}

Response:
{
  "success": true,
  "message": "Donation verified and blood unit created",
  "data": {
    "bloodUnitID": "BU-1773172321120-xyz789",
    "attendanceStatus": "Verified by Hospital",
    "blockchainTxHash": "0x1234..."
  }
}
```

### Public Blood Availability API

#### 9. Search Regional Blood Availability
```
GET /api/public/blood-availability?city=Mumbai&bloodGroup=A+
No Authorization Required

Response:
{
  "success": true,
  "data": {
    "location": {
      "city": "Mumbai",
      "pincode": null
    },
    "bloodGroup": "A+",
    "availability": [
      {
        "hospitalName": "City General Hospital",
        "hospitalPhone": "+91-22-12345678",
        "hospitalEmail": "contact@citygeneral.com",
        "availableUnits": 15,
        "bloodGroup": "A+",
        "lastUpdated": "2026-03-15T10:00:00Z"
      }
    ],
    "totalUnits": 45,
    "hospitalsWithStock": 3
  }
}
```

## Business Logic Implementation

### 1. Automatic Invitation System

```javascript
// When campaign status changes from 'Draft' to 'Active'
async function sendCampaignInvitations(campaignID) {
  const campaign = await Campaign.findById(campaignID)
    .populate('creatorHospitalID');
  
  // Find eligible donors
  const eligibleDonors = await User.find({
    role: 'Donor',
    bloodGroup: { $in: campaign.bloodGroupsNeeded },
    $or: [
      { city: campaign.venue.city },
      { pincode: campaign.venue.pincode }
    ]
  });
  
  // Filter by eligibility (age, weight, 56-day rule)
  const trulyEligible = eligibleDonors.filter(donor => 
    donor.checkEligibility() === 'Eligible'
  );
  
  // Send invitation emails
  const invitationPromises = trulyEligible.map(donor => 
    emailService.sendCampaignInvitation(donor, campaign)
  );
  
  await Promise.all(invitationPromises);
  
  // Update campaign with invitation stats
  campaign.invitationsSent = trulyEligible.length;
  campaign.invitedDonorIDs = trulyEligible.map(d => d._id);
  await campaign.save();
  
  return {
    invitationsSent: trulyEligible.length,
    eligibleDonorsFound: trulyEligible.length
  };
}
```

### 2. Eligibility Validation

```javascript
// Enhanced eligibility check for campaign registration
function validateCampaignEligibility(donor, campaign) {
  // Basic eligibility
  const basicEligibility = donor.checkEligibility();
  if (basicEligibility !== 'Eligible') {
    return { eligible: false, reason: basicEligibility };
  }
  
  // Campaign-specific checks
  if (!campaign.bloodGroupsNeeded.includes(donor.bloodGroup)) {
    return { 
      eligible: false, 
      reason: `Blood group ${donor.bloodGroup} not needed for this campaign` 
    };
  }
  
  // Check if campaign date is in future
  if (new Date(campaign.campaignDate) <= new Date()) {
    return { 
      eligible: false, 
      reason: 'Campaign date has passed' 
    };
  }
  
  // Check if already registered
  const existingRegistration = await CampaignParticipant.findOne({
    campaignID: campaign._id,
    donorID: donor._id
  });
  
  if (existingRegistration) {
    return { 
      eligible: false, 
      reason: 'Already registered for this campaign' 
    };
  }
  
  return { eligible: true };
}
```

### 3. Donation Verification Process

```javascript
// Verify campaign donation and create blood unit
async function verifyCampaignDonation(campaignID, donorID, hospitalID, bloodGroup, collectionDate) {
  // Find participant record
  const participant = await CampaignParticipant.findOne({
    campaignID,
    donorID,
    attendanceStatus: 'Marked Done by Donor'
  });
  
  if (!participant) {
    throw new Error('Participant not found or not marked as done');
  }
  
  // Create blood unit (same as regular donation)
  const bloodUnitID = `BU-${Date.now()}-${uuidv4().substring(0, 8)}`;
  const expiryDate = new Date(collectionDate);
  expiryDate.setDate(expiryDate.getDate() + 42);
  
  const bloodUnit = new BloodUnit({
    bloodUnitID,
    donorID,
    bloodGroup,
    collectionDate: new Date(collectionDate),
    expiryDate,
    status: 'Collected',
    originalHospitalID: hospitalID,
    currentHospitalID: hospitalID,
    campaignID, // Link to campaign
    campaignDonation: true
  });
  
  await bloodUnit.save();
  
  // Update participant record
  participant.attendanceStatus = 'Verified by Hospital';
  participant.donationVerified = true;
  participant.bloodUnitID = bloodUnitID;
  participant.verificationDate = new Date();
  participant.verifiedByHospitalID = hospitalID;
  await participant.save();
  
  // Update donor's last donation date
  const donor = await User.findById(donorID);
  donor.lastDonationDate = new Date(collectionDate);
  await donor.save();
  
  // Update campaign statistics
  await Campaign.findByIdAndUpdate(campaignID, {
    $inc: { verifiedDonations: 1 }
  });
  
  // Record on blockchain (same as regular donation)
  const metadata = {
    donorID: donorID.toString(),
    hospitalID: hospitalID.toString(),
    campaignID: campaignID.toString(),
    bloodGroup,
    timestamp: new Date(collectionDate).toISOString()
  };
  
  const blockchainResult = await blockchainService.recordDonationMilestone(
    bloodUnitID, 
    metadata
  );
  
  // Update blood unit with transaction hash
  bloodUnit.donationTxHash = blockchainResult.transactionHash;
  await bloodUnit.save();
  
  return {
    bloodUnitID,
    blockchainTxHash: blockchainResult.transactionHash,
    participant
  };
}
```

### 4. Regional Blood Availability

```javascript
// Get blood availability for a region
async function getRegionalBloodAvailability(city, pincode, bloodGroup) {
  // Build hospital query
  const hospitalQuery = {};
  if (city) hospitalQuery.city = city;
  if (pincode) hospitalQuery.pincode = pincode;
  
  // Find hospitals in region
  const hospitals = await User.find({
    role: 'Hospital',
    isVerified: true,
    ...hospitalQuery
  });
  
  const hospitalIDs = hospitals.map(h => h._id);
  
  // Build blood unit query
  const bloodQuery = {
    currentHospitalID: { $in: hospitalIDs },
    status: { $in: ['Collected', 'Stored', 'Transferred'] },
    expiryDate: { $gt: new Date() } // Not expired
  };
  
  if (bloodGroup) {
    bloodQuery.bloodGroup = bloodGroup;
  }
  
  // Aggregate blood units by hospital and blood group
  const availability = await BloodUnit.aggregate([
    { $match: bloodQuery },
    {
      $group: {
        _id: {
          hospitalID: '$currentHospitalID',
          bloodGroup: '$bloodGroup'
        },
        count: { $sum: 1 },
        lastUpdated: { $max: '$updatedAt' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.hospitalID',
        foreignField: '_id',
        as: 'hospital'
      }
    },
    {
      $unwind: '$hospital'
    },
    {
      $project: {
        hospitalName: '$hospital.hospitalName',
        hospitalPhone: '$hospital.phone',
        hospitalEmail: '$hospital.email',
        bloodGroup: '$_id.bloodGroup',
        availableUnits: '$count',
        lastUpdated: '$lastUpdated'
      }
    }
  ]);
  
  // Calculate totals
  const totalUnits = availability.reduce((sum, item) => sum + item.availableUnits, 0);
  const hospitalsWithStock = [...new Set(availability.map(item => item.hospitalName))].length;
  
  return {
    availability,
    totalUnits,
    hospitalsWithStock
  };
}
```

## Email Templates

### 1. Campaign Invitation Email

```html
Subject: Blood Donation Campaign Invitation - {campaignTitle}

Dear {donorName},

You're invited to participate in a blood donation campaign!

Campaign Details:
• Title: {campaignTitle}
• Date: {campaignDate}
• Time: {startTime} - {endTime}
• Venue: {venueName}, {venueAddress}
• Blood Groups Needed: {bloodGroupsNeeded}
• Organized by: {hospitalName}

Your blood group ({donorBloodGroup}) is needed for this campaign.

Register Now: {registrationLink}

Contact Information:
Hospital: {hospitalName}
Phone: {hospitalPhone}
Email: {hospitalEmail}

Thank you for considering to donate blood and save lives!

Best regards,
LifeChain Team
```

### 2. Registration Confirmation Email

```html
Subject: Campaign Registration Confirmed - {campaignTitle}

Dear {donorName},

Your registration for the blood donation campaign has been confirmed!

Campaign Details:
• Title: {campaignTitle}
• Date: {campaignDate}
• Time: {startTime} - {endTime}
• Venue: {venueName}, {venueAddress}
• Your Blood Group: {donorBloodGroup}

Important Reminders:
• Please bring a valid ID
• Ensure you're well-rested and hydrated
• Have a light meal before donation
• Arrive on time

On the day of the campaign, you can mark your donation as completed through your donor dashboard.

Contact: {hospitalPhone} | {hospitalEmail}

Thank you for your commitment to saving lives!

Best regards,
LifeChain Team
```

### 3. Campaign Reminder Email (24 hours before)

```html
Subject: Reminder: Blood Donation Campaign Tomorrow - {campaignTitle}

Dear {donorName},

This is a friendly reminder about the blood donation campaign you registered for:

Tomorrow's Campaign:
• Title: {campaignTitle}
• Date: {campaignDate}
• Time: {startTime} - {endTime}
• Venue: {venueName}, {venueAddress}

Pre-Donation Checklist:
✓ Get a good night's sleep
✓ Eat a healthy breakfast
✓ Drink plenty of water
✓ Bring valid ID
✓ Avoid alcohol and smoking

We look forward to seeing you tomorrow!

Contact: {hospitalPhone} | {hospitalEmail}

Thank you for your commitment to saving lives!

Best regards,
LifeChain Team
```

## Frontend Components Design

### 1. Hospital Campaign Management

#### CampaignDashboard.jsx
```jsx
// Main dashboard showing all hospital campaigns
- Campaign list with status filters
- Quick stats (total campaigns, active, completed)
- Create new campaign button
- Search and filter functionality
```

#### CreateCampaign.jsx
```jsx
// Form to create new campaign
- Campaign details form
- Venue information
- Date/time selection
- Blood group selection (multi-select)
- Target quantity input
- Save as draft or activate immediately
```

#### CampaignDetails.jsx
```jsx
// Detailed view of a campaign
- Campaign information display
- Participant list with attendance status
- Verification actions for "Marked Done" participants
- Campaign analytics
- Status management (activate, complete, cancel)
```

### 2. Donor Campaign Discovery

#### CampaignDiscovery.jsx
```jsx
// Browse active campaigns
- Campaign cards with key information
- Location-based filtering
- Blood group filtering
- Date range filtering
- Registration buttons
```

#### CampaignCard.jsx
```jsx
// Individual campaign display
- Campaign title and description
- Venue and date/time
- Hospital information
- Registration status
- Register/Cancel registration buttons
```

#### MyRegistrations.jsx
```jsx
// Donor's registered campaigns
- List of registered campaigns
- Attendance status
- "Mark as Done" button (on campaign day)
- Campaign details
```

### 3. Public Blood Search

#### PublicBloodSearch.jsx
```jsx
// Unauthenticated blood availability search
- Location search (city/pincode)
- Blood group filter
- Hospital contact information
- Real-time availability data
- Emergency contact details
```

## Security Considerations

### 1. Access Control
- Campaign creation: Only verified hospitals
- Campaign modification: Only creator hospital
- Participant verification: Only creator hospital
- Public blood search: No authentication required
- Registration: Only eligible donors

### 2. Data Validation
- Campaign dates must be in future
- Blood groups must be valid
- Venue information required
- Eligibility checks before registration
- Duplicate registration prevention

### 3. Rate Limiting
- Campaign creation: 10 per day per hospital
- Registration attempts: 5 per minute per user
- Public search: 100 per minute per IP
- Email sending: Existing limits apply

## Performance Considerations

### 1. Database Indexing
```javascript
// Campaigns collection indexes
db.campaigns.createIndex({ "creatorHospitalID": 1, "status": 1 })
db.campaigns.createIndex({ "venue.city": 1, "status": 1, "campaignDate": 1 })
db.campaigns.createIndex({ "bloodGroupsNeeded": 1, "status": 1 })

// CampaignParticipants collection indexes
db.campaignparticipants.createIndex({ "campaignID": 1, "attendanceStatus": 1 })
db.campaignparticipants.createIndex({ "donorID": 1, "campaignID": 1 }, { unique: true })
```

### 2. Caching Strategy
- Public blood availability: Cache for 5 minutes
- Active campaigns list: Cache for 2 minutes
- Campaign details: Cache for 1 minute
- Hospital verification status: Cache for 30 minutes

### 3. Pagination
- Campaign lists: 10 items per page
- Participant lists: 20 items per page
- Public search results: 15 items per page

## Testing Strategy

### 1. Unit Tests
- Campaign CRUD operations
- Eligibility validation logic
- Email sending functionality
- Regional blood availability calculation

### 2. Integration Tests
- Complete campaign workflow
- Registration and verification process
- Invitation system end-to-end
- Public API functionality

### 3. Load Testing
- Concurrent campaign registrations
- Mass invitation sending
- Public search under load
- Database performance under scale

## Deployment Considerations

### 1. Database Migration
```javascript
// Add campaign fields to existing BloodUnit schema
db.bloodunits.updateMany(
  {},
  {
    $set: {
      campaignID: null,
      campaignDonation: false
    }
  }
)
```

### 2. Environment Variables
```
# Campaign-specific settings
CAMPAIGN_INVITATION_BATCH_SIZE=50
CAMPAIGN_MAX_PARTICIPANTS=200
CAMPAIGN_REMINDER_HOURS=24
PUBLIC_SEARCH_CACHE_TTL=300
```

### 3. Monitoring
- Campaign creation rate
- Registration success rate
- Email delivery rate
- Public API response times
- Database query performance

## Future Enhancements

### 1. Advanced Features
- Campaign templates for recurring events
- Multi-day campaigns
- Campaign collaboration between hospitals
- Donor loyalty program integration

### 2. Analytics
- Campaign effectiveness metrics
- Donor engagement analytics
- Regional demand patterns
- Predictive campaign planning

### 3. Mobile Features
- Push notifications for nearby campaigns
- QR code check-in at venues
- Offline campaign information
- Location-based campaign discovery

This design provides a comprehensive foundation for implementing the blood donation campaign management feature while maintaining consistency with the existing LifeChain architecture and ensuring scalability for future enhancements.