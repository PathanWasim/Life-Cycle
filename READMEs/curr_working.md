# LifeChain Blood Supply Management System - Complete Workflow Guide

## 🎯 System Overview

LifeChain is a blockchain-powered blood supply management system that tracks blood donations from collection to usage. The system has three main user roles, each with specific responsibilities and capabilities.

---

## 👥 USER ROLES & THEIR FUNCTIONALITY

### 1. 🩸 DONOR ROLE

**Who**: Individuals who donate blood

**Login Credentials (Test)**:
- Email: sample.donor1@example.com
- Password: SamplePass123!
- Hospital Names:
  - Hospital 1: City General Hospital
  - Hospital 2: Metro Medical Center

**Dashboard Access**: `/donor/dashboard`

#### Donor Capabilities:

##### A. View Profile & Eligibility Status
- **What**: See personal information and donation eligibility
- **Details Shown**:
  - Name, Email, Blood Group
  - Age, Weight, City, Pincode
  - Eligibility Status (Eligible/Ineligible)
  - Days since last donation
  - Next eligible donation date
- **Eligibility Rules**:
  - Age: Must be 18-60 years old
  - Weight: Must be ≥50 kg
  - 56-Day Rule: Must wait 56 days between donations
  - Status: "Eligible" (green) or "Ineligible" (red) with reason

##### B. View Donation History
- **What**: See all past blood donations
- **Information Displayed**:
  - Donation Date
  - Blood Group donated
  - Hospital where donated
  - Blood Unit ID
  - Current Status (Collected, Stored, Transferred, Used)
  - Blockchain Transaction Link
- **Features**:
  - Click blockchain link to view transaction on Polygon Amoy Explorer
  - See complete journey of donated blood
  - Track if blood was transferred or used

##### C. Download Donation Certificates
- **What**: Get PDF certificate for each donation
- **Certificate Contains**:
  - Donor Name and Blood Group
  - Donation Date
  - Hospital Name
  - Blood Unit ID
  - Blockchain Transaction Hash
  - QR Code for verification
- **How**: Click "Download Certificate" button next to each donation
- **Use Case**: Proof of donation for records or incentives

##### D. Receive Emergency Request Notifications
- **What**: Get email when hospital needs your blood type urgently
- **Notification Contains**:
  - Hospital name and location
  - Blood group needed
  - Quantity required
  - Urgency level (Critical/High/Medium)
  - Contact information
- **AI-Powered**: System ranks donors by suitability and notifies top 10

---

### 2. 🏥 HOSPITAL ROLE

**Who**: Blood banks and hospitals that collect, store, and use blood

**Login Credentials (Test)**:
- Hospital 1: sample.hospital1@example.com / HospitalPass123!
- Hospital 2: sample.hospital2@example.com / HospitalPass123!

**Dashboard Access**: `/hospital/dashboard`

**Important**: Hospitals must be verified by admin before accessing features

#### Hospital Capabilities:

##### A. View Blood Inventory
- **What**: See all blood units currently in hospital's possession
- **Information Displayed**:
  - Blood Unit ID
  - Blood Group
  - Collection Date
  - Expiry Date (42 days from collection)
  - Days Until Expiry (color-coded: red <3 days, yellow 3-7 days, green >7 days)
  - Status (Collected, Stored, Transferred, Used)
  - Donor Name
  - Original Hospital
- **Filters Available**:
  - Filter by Blood Group (A+, A-, B+, B-, AB+, AB-, O+, O-)
  - Filter by Status
- **Summary Statistics**:
  - Total units in inventory
  - Breakdown by blood group
  - Breakdown by status

##### B. Record Blood Donation
- **What**: Register a new blood donation from a donor
- **Process**:
  1. Enter donor email to search
  2. System checks donor eligibility
  3. Select blood group (must match donor's blood group)
  4. Enter collection date
  5. Submit to create blood unit
- **What Happens**:
  - Blood Unit created with unique ID (e.g., BU-1773254525408-c30533a8)
  - Status set to "Collected"
  - Expiry date calculated (collection date + 42 days)
  - Blockchain milestone recorded (Donation)
  - Donor's last donation date updated
  - Blood unit appears in hospital's inventory
- **Blockchain**: Transaction hash returned and stored
- **Restrictions**: Only verified hospitals can record donations

##### C. Transfer Blood to Another Hospital
- **What**: Send blood unit to another hospital
- **Process**:
  1. Select blood unit from inventory (dropdown)
  2. Select destination hospital (dropdown shows verified hospitals only)
  3. Submit transfer
- **What Happens**:
  - Blood unit's currentHospitalID updated to destination hospital
  - Status changed to "Transferred"
  - Transfer history recorded with date and hospitals
  - Blockchain milestone recorded (Transfer)
  - Blood unit removed from sender's inventory
  - Blood unit appears in receiver's inventory
- **Restrictions**:
  - Cannot transfer expired blood
  - Cannot transfer to same hospital
  - Cannot transfer to unverified hospital
  - Only owner hospital can transfer

##### D. Record Blood Usage
- **What**: Mark blood unit as used for a patient
- **Process**:
  1. Select blood unit from inventory
  2. Enter patient ID
  3. Submit usage record
- **What Happens**:
  - Status changed to "Used"
  - Usage date recorded
  - Patient ID stored
  - Blockchain milestone recorded (Usage)
  - Blood unit removed from inventory (status = Used)
- **Restrictions**:
  - Cannot use expired blood
  - Only owner hospital can record usage

##### E. Create Emergency Blood Request
- **What**: Request urgent blood from donors in your area
- **Process**:
  1. Select blood group needed
  2. Enter quantity required
  3. Select urgency level (Critical/High/Medium)
  4. Add optional notes
  5. Submit request
- **What Happens**:
  - System finds eligible donors with matching blood group in your city/pincode
  - AI ranks donors by suitability (proximity, donation frequency, time since last donation)
  - Top 10 donors receive email notifications
  - Emergency request saved with status "Active"
- **Features**:
  - View all active emergency requests
  - Mark request as "Fulfilled" when blood received
  - See number of donors notified

##### F. View Demand Prediction (AI-Powered)
- **What**: Predict blood demand for next 7 days
- **Process**:
  1. Select blood group
  2. Click "Predict Demand"
- **What You Get**:
  - 7-day forecast of blood usage
  - Confidence score
  - Current inventory vs predicted demand
  - Recommendation (sufficient/adequate/shortage)
- **AI Model**: Uses historical usage data and machine learning
- **Use Case**: Plan blood collection and prevent shortages

##### G. Receive Expiry Alerts
- **What**: Daily email alerts for blood units expiring soon
- **Alert Contains**:
  - Blood Unit ID
  - Blood Group
  - Days until expiry
  - Priority level (High: 1-3 days, Medium: 4-7 days)
- **Schedule**: Automated daily at 08:00 UTC
- **Purpose**: Prevent blood wastage

---

### 3. 👨‍💼 ADMIN ROLE

**Who**: System administrators who manage hospitals

**Login Credentials (Test)**:
- Email: admin@lifechain.com
- Password: Admin@123456

**Dashboard Access**: `/admin/panel`

#### Admin Capabilities:

##### A. Verify Pending Hospitals
- **What**: Approve or reject hospital registration requests
- **Pending Hospitals Display**:
  - Hospital Name
  - Email
  - City, Pincode
  - Wallet Address (for blockchain)
  - Registration Date
- **Actions Available**:
  - **Approve**: 
    - Sets hospital's isVerified = true
    - Sends verification email to hospital
    - Hospital can now access all features
  - **Reject**:
    - Sends rejection email to hospital
    - Deletes hospital account from database
- **Why Important**: Prevents unauthorized hospitals from accessing system

##### B. View System Statistics
- **What**: Monitor overall system health and usage
- **Statistics Displayed**:
  - Total Donors registered
  - Total Hospitals registered
  - Total Blood Units in system
  - Active Emergency Requests
  - Blood Units by Status (pie chart):
    - Collected
    - Stored
    - Transferred
    - Used
  - Blood Units by Blood Group (bar chart)
- **Auto-Refresh**: Updates every 30 seconds
- **Use Case**: System monitoring and reporting

---

## 🔄 COMPLETE BLOOD SUPPLY CHAIN WORKFLOW

### Step-by-Step Process:

#### 1. **Donor Registration**
- Donor creates account with personal details
- System calculates eligibility based on age, weight
- Donor can view profile and eligibility status

#### 2. **Hospital Registration**
- Hospital creates account with facility details
- Account status: "Pending Verification"
- Hospital cannot access features until verified

#### 3. **Admin Verification**
- Admin reviews hospital registration
- Admin approves hospital
- Hospital receives verification email
- Hospital can now access all features

#### 4. **Blood Donation Recording**
- Hospital logs in and goes to "Record Donation"
- Hospital searches for donor by email
- System checks donor eligibility:
  - ✅ Eligible: Proceed with donation
  - ❌ Ineligible: Show reason (age/weight/56-day rule)
- Hospital records donation with blood group and date
- System creates Blood Unit with unique ID
- **Blockchain**: Donation milestone recorded on Polygon Amoy
- Blood unit appears in hospital's inventory

#### 5. **Blood Storage**
- Hospital can optionally change status from "Collected" to "Stored"
- This is for internal tracking only (no blockchain recording)

#### 6. **Blood Transfer (Optional)**
- Hospital 1 decides to transfer blood to Hospital 2
- Hospital 1 selects blood unit and destination hospital
- System validates:
  - Blood not expired
  - Destination hospital is verified
  - Hospital 1 owns the blood unit
- Transfer executed:
  - currentHospitalID updated to Hospital 2
  - Status changed to "Transferred"
  - Transfer history recorded
- **Blockchain**: Transfer milestone recorded
- Blood unit removed from Hospital 1's inventory
- Blood unit appears in Hospital 2's inventory

#### 7. **Blood Usage**
- Hospital (1 or 2) uses blood for patient
- Hospital selects blood unit and enters patient ID
- System validates:
  - Blood not expired
  - Hospital owns the blood unit
- Usage recorded:
  - Status changed to "Used"
  - Usage date and patient ID stored
- **Blockchain**: Usage milestone recorded
- Blood unit removed from inventory (status = Used)

#### 8. **Certificate Generation**
- Donor logs in and views donation history
- Donor clicks "Download Certificate" for any donation
- System generates PDF certificate with:
  - Donation details
  - Blockchain transaction hash
  - QR code for verification
- Donor downloads certificate as proof

#### 9. **Blockchain Verification**
- Anyone can verify blood unit journey on blockchain
- Click blockchain transaction link in donor history
- View on Polygon Amoy Explorer:
  - Donation milestone (when collected)
  - Transfer milestone (if transferred)
  - Usage milestone (when used)
- All milestones are permanent and tamper-proof

---

## 🚨 EMERGENCY REQUEST WORKFLOW

### Scenario: Hospital needs O+ blood urgently

#### 1. **Hospital Creates Emergency Request**
- Hospital logs in and goes to "Emergency Requests"
- Fills form:
  - Blood Group: O+
  - Quantity: 2 units
  - Urgency: Critical
  - Notes: "Accident victim needs immediate transfusion"
- Submits request

#### 2. **System Finds Eligible Donors**
- Searches for donors with:
  - Blood Group = O+
  - City or Pincode matches hospital
  - Eligibility status = "Eligible"

#### 3. **AI Ranks Donors**
- AI model calculates suitability score based on:
  - **Proximity**: Same city/pincode (higher score)
  - **Donation Frequency**: 2-4 donations/year (optimal)
  - **Time Since Last Donation**: 60-90 days (ideal)
- Ranks donors by score (highest first)

#### 4. **Top 10 Donors Notified**
- System sends email to top 10 donors
- Email contains:
  - Hospital name and location
  - Blood group needed (O+)
  - Quantity (2 units)
  - Urgency level (Critical)
  - Hospital contact information
- Donors can contact hospital to donate

#### 5. **Hospital Fulfills Request**
- Once blood received, hospital marks request as "Fulfilled"
- Request status changes from "Active" to "Fulfilled"
- Fulfillment date recorded

---

## 🤖 AI-POWERED FEATURES

### 1. **Demand Prediction**
- **Input**: Blood group, historical usage data (last 30 days)
- **AI Model**: Linear Regression / Random Forest
- **Output**: 7-day forecast of blood usage
- **Use Case**: Hospital plans blood collection to prevent shortages

### 2. **Donor Recommendations**
- **Input**: Blood group, location, list of eligible donors
- **AI Model**: Weighted scoring algorithm
- **Factors**:
  - Proximity score (city/pincode match)
  - Donation frequency score (2-4/year optimal)
  - Time since last donation score (60-90 days ideal)
- **Output**: Ranked list of top 10 most suitable donors
- **Use Case**: Emergency requests notify best donors first

### 3. **Expiry Alerts**
- **Input**: All blood units in system
- **AI Service**: Checks expiry dates daily
- **Output**: List of units expiring within 7 days
- **Priority**:
  - High: 1-3 days until expiry
  - Medium: 4-7 days until expiry
- **Action**: Email sent to hospital with expiring units
- **Use Case**: Prevent blood wastage

---

## 🔗 BLOCKCHAIN INTEGRATION

### What Gets Recorded on Blockchain:

#### 1. **Donation Milestone**
- **When**: Blood unit is collected from donor
- **Data Stored**:
  - Blood Unit ID
  - Donor ID
  - Hospital ID
  - Blood Group
  - Timestamp
- **Transaction Hash**: Stored in BloodUnit.donationTxHash

#### 2. **Transfer Milestone**
- **When**: Blood unit is transferred between hospitals
- **Data Stored**:
  - Blood Unit ID
  - From Hospital ID
  - To Hospital ID
  - Timestamp
- **Transaction Hash**: Stored in BloodUnit.transferTxHashes array

#### 3. **Usage Milestone**
- **When**: Blood unit is used for patient
- **Data Stored**:
  - Blood Unit ID
  - Hospital ID
  - Patient ID
  - Timestamp
- **Transaction Hash**: Stored in BloodUnit.usageTxHash

### Why Blockchain?
- **Transparency**: Anyone can verify blood journey
- **Immutability**: Records cannot be altered or deleted
- **Trust**: Donors can see their blood was used properly
- **Audit Trail**: Complete history from donation to usage

### Blockchain Network:
- **Network**: Polygon Amoy Testnet
- **Explorer**: https://amoy.polygonscan.com/
- **Gas Fees**: Free (test MATIC)
- **Smart Contract**: BloodChain.sol

---

## 📊 DATA FLOW SUMMARY

```
DONOR REGISTERS
    ↓
HOSPITAL REGISTERS → ADMIN VERIFIES → HOSPITAL VERIFIED
    ↓
DONOR DONATES BLOOD → HOSPITAL RECORDS DONATION
    ↓
BLOOD UNIT CREATED → BLOCKCHAIN: Donation Milestone
    ↓
BLOOD IN HOSPITAL 1 INVENTORY
    ↓
HOSPITAL 1 TRANSFERS TO HOSPITAL 2 → BLOCKCHAIN: Transfer Milestone
    ↓
BLOOD IN HOSPITAL 2 INVENTORY
    ↓
HOSPITAL 2 USES BLOOD FOR PATIENT → BLOCKCHAIN: Usage Milestone
    ↓
BLOOD UNIT STATUS = USED (Removed from inventory)
    ↓
DONOR DOWNLOADS CERTIFICATE WITH BLOCKCHAIN PROOF
```

---

## 🔐 SECURITY & ACCESS CONTROL

### Role-Based Access:
- **Donor**: Can only view own profile and donations
- **Hospital**: Can only manage own inventory and operations
- **Admin**: Can view all data and manage hospitals

### Authentication:
- JWT tokens with 24-hour expiration
- Passwords hashed with bcrypt (10 salt rounds)
- Protected routes require valid token

### Authorization:
- Middleware checks user role before allowing access
- Hospitals must be verified to access features
- Donors cannot access hospital/admin features

---

## 📝 TEST CREDENTIALS SUMMARY

### Donors:
- sample.donor1@example.com / SamplePass123!
- sample.donor2@example.com / SamplePass123!
- sample.donor3@example.com / SamplePass123!

### Hospitals:
- **City General Hospital**: sample.hospital1@example.com / HospitalPass123!
- **Metro Medical Center**: sample.hospital2@example.com / HospitalPass123!

### Admin:
- admin@lifechain.com / Admin@123456

---

## 🎯 KEY FEATURES SUMMARY

### For Donors:
✅ Check eligibility status
✅ View donation history
✅ Download certificates
✅ Receive emergency notifications
✅ Track blood journey on blockchain

### For Hospitals:
✅ Manage blood inventory
✅ Record donations
✅ Transfer blood between hospitals
✅ Record blood usage
✅ Create emergency requests
✅ AI-powered demand prediction
✅ Receive expiry alerts

### For Admins:
✅ Verify hospitals
✅ View system statistics
✅ Monitor system health

### System-Wide:
✅ Blockchain transparency
✅ AI-powered recommendations
✅ Email notifications
✅ Role-based access control
✅ Complete audit trail

---

## 📖 REFERENCE DOCUMENTS

- **DEMO_CREDENTIALS.md** - Complete testing guide
- **TASK_31_FINAL_SUMMARY.md** - Testing completion status
- **START_DEMO_NOW.md** - Quick startup instructions
- **TRANSFER_BUG_FIXED.md** - Transfer issue resolution

---

This document provides a complete understanding of the LifeChain system workflow, roles, and functionality. Use it as a reference for demonstrations, training, or system documentation.
