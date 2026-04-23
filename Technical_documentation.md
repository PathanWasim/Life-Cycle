# 🩸 LifeChain - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [User Roles & Features](#user-roles--features)
5. [Complete Workflow](#complete-workflow)
6. [Testing Guide](#testing-guide)
7. [Demo Credentials](#demo-credentials)
8. [Blockchain Configuration](#blockchain-configuration)
9. [API Documentation](#api-documentation)
10. [Deployment Information](#deployment-information)

---

## 1. Project Overview

### What is LifeChain?

LifeChain is an **Intelligent Blood Supply Management System** that combines traditional database operations with blockchain verification to ensure transparency, medical compliance, and efficient blood distribution.

### Key Highlights

- **Medical Compliance**: Enforces 56-day donation rule and health criteria validation
- **Blockchain Verification**: Immutable audit trail on Polygon Amoy testnet
- **AI-Powered**: Demand prediction, donor recommendations, and expiry alerts
- **Location-Based Matching**: Smart donor filtering for emergency requests
- **Digital Certificates**: Verifiable PDF certificates with QR codes
- **Role-Based Access**: Separate interfaces for donors, hospitals, and admins

### Problem Statement

Traditional blood supply management faces challenges:
- Lack of transparency in blood tracking
- Inefficient donor-hospital matching
- Manual inventory management
- No predictive analytics for demand
- Paper-based certificates prone to fraud

### Solution

LifeChain provides:
- Blockchain-verified blood supply chain
- AI-powered demand forecasting
- Automated donor recommendations
- Real-time inventory management
- Digital certificates with blockchain verification

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Donor   │  │ Hospital │  │  Admin   │  │  Login   │  │
│  │Dashboard │  │Dashboard │  │  Panel   │  │ Register │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │  Donor   │  │ Hospital │  │  Admin   │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Services Layer                          │  │
│  │  • Blockchain Service  • Email Service              │  │
│  │  • AI Service          • Certificate Service        │  │
│  │  • Retry Service       • Email Mapping Service      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   MongoDB    │    │  Blockchain  │    │ AI Service   │
│    Atlas     │    │   (Polygon   │    │   (Flask)    │
│  (Database)  │    │    Amoy)     │    │   Python     │
└──────────────┘    └──────────────┘    └──────────────┘
```


### Component Breakdown

#### Frontend (React + Vite)
- **Port**: 5173
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Context API (AuthContext)
- **Routing**: React Router v6
- **HTTP Client**: Axios

#### Backend (Node.js + Express)
- **Port**: 5000
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **Rate Limiting**: 500 requests per 15 minutes
- **Email**: Nodemailer with Gmail SMTP

#### Blockchain (Solidity + Hardhat)
- **Network**: Polygon Amoy Testnet (Chain ID: 80002)
- **Contract Address**: `0xD14cd2fB4c97E980A6e93ee4C813787a23c1B009`
- **Deployer Address**: `0x6cdE23078190764Cc14380Fc138cefBa1918E890`
- **Solidity Version**: 0.8.20
- **Framework**: Hardhat
- **Library**: Ethers.js v6

#### AI Service (Python + Flask)
- **Port**: 5001
- **Framework**: Flask
- **ML Library**: Scikit-learn
- **Data Processing**: Pandas, NumPy
- **Features**:
  - Demand prediction (7-day forecast)
  - Donor recommendations (AI-ranked)
  - Expiry alerts

---

## 3. Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.x | Web framework |
| MongoDB | Atlas | Database |
| Mongoose | 7.x | ODM for MongoDB |
| JWT | 9.x | Authentication |
| Bcrypt | 5.x | Password hashing |
| Nodemailer | 6.x | Email service |
| Ethers.js | 6.x | Blockchain interaction |
| Express-rate-limit | 6.x | Rate limiting |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Vite | 4.x | Build tool |
| React Router | 6.x | Routing |
| Axios | 1.x | HTTP client |
| Tailwind CSS | 3.x | Styling |
| React Icons | 4.x | Icons |

### Blockchain Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Solidity | 0.8.20 | Smart contract language |
| Hardhat | 2.x | Development framework |
| Ethers.js | 6.x | Blockchain library |
| Polygon Amoy | Testnet | Blockchain network |

### AI Service Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.9+ | Programming language |
| Flask | 2.x | Web framework |
| Scikit-learn | 1.x | Machine learning |
| Pandas | 2.x | Data processing |
| NumPy | 1.x | Numerical computing |

---

## 4. User Roles & Features

### 4.1 Donor Role

#### Features Available:

1. **Profile Management**
   - View personal information
   - Blood group display
   - Age, weight, location
   - Eligibility status (real-time calculation)
   - Days since last donation
   - Next eligible donation date

2. **Donation History**
   - View all past donations
   - Blood unit ID for each donation
   - Collection date and hospital
   - Current status (Collected, Stored, Transferred, Used)
   - Blockchain transaction hash
   - Link to Polygon Amoy explorer

3. **Digital Certificates**
   - Download PDF certificate for each donation
   - Certificate includes:
     - Donor name and blood group
     - Donation date and hospital
     - Blood unit ID
     - QR code for verification
     - Blockchain transaction hash

4. **Eligibility Checking**
   - Automatic eligibility calculation
   - Requirements checked:
     - Age: 18-60 years
     - Weight: ≥50 kg
     - 56-day rule (must wait 56 days between donations)
   - Clear status messages

#### Donor Dashboard Sections:
- Profile Overview
- Donation History Table
- Certificate Downloads


### 4.2 Hospital Role

#### Features Available:

1. **Record Donation**
   - Search donor by email
   - Verify donor eligibility
   - Record blood collection
   - Generate unique blood unit ID
   - Automatic blockchain recording
   - Update donor's last donation date

2. **Inventory Management**
   - View all blood units
   - Filter by blood group
   - Filter by status (Collected, Stored, Transferred, Used)
   - See expiry dates (42 days from collection)
   - Color-coded expiry alerts:
     - Green: >7 days remaining
     - Yellow: 3-7 days remaining
     - Red: <3 days remaining
   - Real-time inventory updates

3. **Transfer Blood**
   - Transfer blood units to other hospitals
   - Select from verified hospitals dropdown
   - Automatic blockchain recording
   - Transfer history tracking
   - Real-time inventory updates

4. **Record Usage**
   - Mark blood units as used
   - Link to patient ID
   - Automatic blockchain recording
   - Remove from available inventory

5. **Emergency Requests**
   - Create emergency blood requests
   - Specify blood group, quantity, urgency
   - AI-powered donor recommendations
   - Automatic email notifications to top 10 donors
   - Track request status (Active, Fulfilled)
   - View notified donors

6. **Demand Prediction (AI)**
   - 7-day demand forecast
   - Based on last 30 days of usage data
   - Confidence score
   - Current inventory comparison
   - Actionable recommendations
   - Shortage alerts

#### Hospital Dashboard Sections:
- Record Donation
- Inventory Management
- Transfer Blood
- Record Usage
- Emergency Requests
- Demand Prediction

---

### 4.3 Admin Role

#### Features Available:

1. **System Statistics**
   - Total donors count
   - Verified hospitals count
   - Total blood units
   - Active emergency requests
   - Blood units by status breakdown
   - Blood units by blood group breakdown

2. **Hospital Verification**
   - View pending hospital registrations
   - Approve or reject hospitals
   - Only verified hospitals can record donations

3. **System Monitoring**
   - View all blood units across hospitals
   - Monitor emergency requests
   - Track blockchain transaction status
   - System health monitoring

#### Admin Panel Sections:
- System Statistics
- Pending Hospitals
- All Blood Units
- Emergency Requests

---

## 5. Complete Workflow

### 5.1 User Registration & Login

#### Donor Registration:
1. Navigate to `/register`
2. Select role: "Donor"
3. Fill in details:
   - Name
   - Email
   - Password
   - Blood Group (A+, A-, B+, B-, AB+, AB-, O+, O-)
   - Date of Birth
   - Weight (kg)
   - City
   - Pincode
4. System generates wallet address
5. Account created → Redirect to login

#### Hospital Registration:
1. Navigate to `/register`
2. Select role: "Hospital"
3. Fill in details:
   - Hospital Name
   - Email
   - Password
   - City
   - Pincode
4. System generates wallet address
5. Account created with `isVerified: false`
6. Admin must verify before hospital can record donations

#### Login:
1. Navigate to `/login`
2. Enter email and password
3. System validates credentials
4. JWT token generated
5. Redirect based on role:
   - Donor → `/donor/dashboard`
   - Hospital → `/hospital/dashboard`
   - Admin → `/admin/panel`

---

### 5.2 Blood Donation Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  BLOOD DONATION WORKFLOW                    │
└─────────────────────────────────────────────────────────────┘

Step 1: Hospital searches for donor
   ↓
Step 2: System checks donor eligibility
   • Age: 18-60 years ✓
   • Weight: ≥50 kg ✓
   • 56-day rule ✓
   ↓
Step 3: Hospital records donation
   • Blood group verification
   • Collection date
   • Generate blood unit ID
   ↓
Step 4: Save to MongoDB
   • Create BloodUnit document
   • Status: "Collected"
   • Expiry: Collection date + 42 days
   ↓
Step 5: Record on blockchain
   • Call smart contract recordDonation()
   • Store transaction hash
   • If fails → Queue for retry
   ↓
Step 6: Update donor record
   • Set lastDonationDate
   • Recalculate eligibility
   ↓
Step 7: Success response
   • Blood unit ID
   • Blockchain transaction hash
   • Expiry date
```


### 5.3 Blood Transfer Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  BLOOD TRANSFER WORKFLOW                    │
└─────────────────────────────────────────────────────────────┘

Step 1: Hospital selects blood unit to transfer
   ↓
Step 2: System validates
   • Hospital owns the blood unit ✓
   • Blood unit not expired ✓
   • Destination hospital verified ✓
   • Not transferring to same hospital ✓
   ↓
Step 3: Update blood unit
   • Change currentHospitalID
   • Status: "Transferred"
   • Add to transferHistory[]
   ↓
Step 4: Save to MongoDB
   ↓
Step 5: Record on blockchain
   • Call smart contract recordTransfer()
   • Store transaction hash
   • If fails → Queue for retry
   ↓
Step 6: Success response
   • Transfer details
   • Blockchain transaction hash
   • Updated inventory
```

---

### 5.4 Blood Usage Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   BLOOD USAGE WORKFLOW                      │
└─────────────────────────────────────────────────────────────┘

Step 1: Hospital selects blood unit to use
   ↓
Step 2: System validates
   • Hospital owns the blood unit ✓
   • Blood unit not expired ✓
   • Blood unit not already used ✓
   ↓
Step 3: Enter patient ID
   ↓
Step 4: Update blood unit
   • Status: "Used"
   • Set usageDate
   • Set patientID
   ↓
Step 5: Save to MongoDB
   ↓
Step 6: Record on blockchain
   • Call smart contract recordUsage()
   • Store transaction hash
   • If fails → Queue for retry
   ↓
Step 7: Success response
   • Usage details
   • Blockchain transaction hash
   • Removed from available inventory
```

---

### 5.5 Emergency Request Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                EMERGENCY REQUEST WORKFLOW                   │
└─────────────────────────────────────────────────────────────┘

Step 1: Hospital creates emergency request
   • Blood group
   • Quantity needed
   • City & Pincode
   • Urgency level (Low, Medium, High, Critical)
   • Notes
   ↓
Step 2: Save to MongoDB
   • Create EmergencyRequest document
   • Status: "Active"
   ↓
Step 3: Find eligible donors
   • Match blood group
   • Match location (city OR pincode)
   • Check eligibility (age, weight, 56-day rule)
   ↓
Step 4: AI ranks donors
   • Call AI service /api/recommend-donors
   • Factors:
     - Location proximity (city/pincode match)
     - Donation frequency (prefers 2-4 times/year)
     - Days since last donation
   • Returns suitability scores
   ↓
Step 5: Select top 10 donors
   ↓
Step 6: Send email notifications
   • Email to each of top 10 donors
   • Includes:
     - Blood group needed
     - Quantity
     - Hospital name and location
     - Urgency level
     - Contact information
   ↓
Step 7: Update emergency request
   • Add notifiedDonors[] array
   ↓
Step 8: Success response
   • Request ID
   • Number of donors notified
   • Top donors list with scores
```

---

### 5.6 Demand Prediction Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                DEMAND PREDICTION WORKFLOW                   │
└─────────────────────────────────────────────────────────────┘

Step 1: Hospital selects blood group
   ↓
Step 2: Query historical usage data
   • Last 30 days
   • Filter by hospital and blood group
   • Status: "Used"
   ↓
Step 3: Format data for AI
   • Group by date
   • Fill missing dates with 0
   • Create time series
   ↓
Step 4: Call AI service
   • POST /api/predict-demand
   • Send historical data
   ↓
Step 5: AI generates predictions
   • 7-day forecast
   • Uses linear regression
   • Returns predicted demand per day
   • Confidence score
   ↓
Step 6: Get current inventory
   • Count available units
   • Filter by blood group
   • Exclude expired units
   ↓
Step 7: Generate recommendation
   • Compare inventory vs predicted demand
   • If inventory ≥ 120% of demand → "Sufficient"
   • If inventory ≥ 100% of demand → "Adequate"
   • If inventory < 100% of demand → "⚠️ Shortage expected"
   ↓
Step 8: Return results
   • 7-day predictions
   • Current inventory
   • Total predicted demand
   • Recommendation
   • Confidence score
```

---

## 6. Testing Guide

### 6.1 Pre-Testing Setup

#### Start All Services:

1. **Backend** (Terminal 1):
```bash
cd backend
npm start
```
Expected output: `✅ LifeChain Backend Server running on port 5000`

2. **Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
Expected output: `Local: http://localhost:5173`

3. **AI Service** (Terminal 3):
```bash
cd ai-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```
Expected output: `Running on http://localhost:5001`

4. **Verify All Services**:
```bash
# Backend health check
curl http://localhost:5000/api/health

# AI service health check
curl http://localhost:5001/api/health
```


### 6.2 Testing Scenarios

#### Scenario 1: Donor Login & Profile View

**Steps:**
1. Open `http://localhost:5173`
2. Click "Login"
3. Enter credentials:
   - Email: `sample.donor1@example.com`
   - Password: `SamplePass123!`
4. Click "Login"

**Expected Results:**
- ✅ Redirected to `/donor/dashboard`
- ✅ Profile displayed with:
  - Name: Sample Donor 1
  - Blood Group: A-
  - Age: 29 years
  - Weight: 56 kg
  - Location: Mumbai, 400001
  - Eligibility Status: "Eligible" (green badge)
- ✅ Donation history table (may be empty or have records)

---

#### Scenario 2: Hospital Records Donation

**Steps:**
1. Logout from donor account
2. Login as Hospital 1:
   - Email: `sample.hospital1@example.com`
   - Password: `HospitalPass123!`
3. Click "Record Donation" tab
4. Enter donor email: `sample.donor2@example.com`
5. Click "Search Donor"
6. Verify donor details appear:
   - Name: Sample Donor 2
   - Blood Group: B+
   - Eligibility: Eligible
7. Select Blood Group: B+
8. Select Collection Date: Today
9. Click "Record Donation"

**Expected Results:**
- ✅ Success message: "Blood donation recorded successfully"
- ✅ Blood Unit ID displayed (e.g., BU-1773172321120-dc67bb70)
- ✅ Blockchain status: "Pending" or "Recorded"
- ✅ Expiry date: 42 days from today
- ✅ Days until expiry: 42

**Verify in Database:**
```bash
cd backend
node check-donor-donations.js
```

---

#### Scenario 3: View Inventory

**Steps:**
1. Still logged in as Hospital 1
2. Click "Inventory" tab

**Expected Results:**
- ✅ List of blood units displayed
- ✅ Columns visible:
  - Blood Unit ID
  - Blood Group
  - Donor Name
  - Collection Date
  - Expiry Date
  - Days Left (color-coded)
  - Status
  - Actions
- ✅ Filter dropdowns work:
  - Blood Group filter
  - Status filter
- ✅ Color coding:
  - Green: >7 days
  - Yellow: 3-7 days
  - Red: <3 days

---

#### Scenario 4: Transfer Blood

**Steps:**
1. Still logged in as Hospital 1
2. Click "Transfer Blood" tab
3. Select a blood unit from dropdown (status: Collected or Stored)
4. Select destination: "Metro Medical Center (Hospital 2)"
5. Click "Transfer Blood"

**Expected Results:**
- ✅ Success message: "Blood unit transferred successfully!"
- ✅ Shows: From City General Hospital → To Metro Medical Center
- ✅ Blockchain status: "Pending" or "Recorded"
- ✅ Inventory automatically refreshes
- ✅ Transferred unit removed from inventory

**Verify Transfer:**
1. Go to "Inventory" tab
2. Transferred unit should not be visible
3. Logout and login as Hospital 2
4. Check Hospital 2's inventory
5. Transferred unit should appear there

---

#### Scenario 5: Record Blood Usage

**Steps:**
1. Login as Hospital 1
2. Click "Record Usage" tab
3. Select a blood unit from dropdown
4. Enter Patient ID: `PAT-DEMO-001`
5. Click "Record Usage"

**Expected Results:**
- ✅ Success message: "Blood usage recorded successfully!"
- ✅ Blood Unit ID and Patient ID displayed
- ✅ Blockchain status: "Pending" or "Recorded"
- ✅ Inventory refreshes
- ✅ Used unit removed from available inventory

---

#### Scenario 6: Create Emergency Request

**Steps:**
1. Login as Hospital 1
2. Click "Emergency Requests" tab
3. Scroll to "Create Emergency Request" form
4. Fill in:
   - Blood Group: O+
   - Quantity: 3
   - Urgency: Critical
   - Notes: "Urgent need for surgery patient"
5. Click "Create Request"

**Expected Results:**
- ✅ Success message
- ✅ Shows: "X donors notified"
- ✅ New request appears in active requests list
- ✅ Request details visible:
  - Request ID
  - Blood Group: O+
  - Quantity: 3
  - Urgency: Critical
  - Status: Active
  - Created Date

**Verify Emails Sent:**
- Check real email inboxes (ns7499244144@gmail.com, etc.)
- Should receive emergency request emails

---

#### Scenario 7: Demand Prediction

**Steps:**
1. Login as Hospital 1
2. Click "Demand Prediction" tab
3. Select Blood Group: O-
4. Click "Get Prediction"

**Expected Results:**
- ✅ 7-day forecast table displayed
- ✅ Columns:
  - Day
  - Predicted Demand
- ✅ Current Inventory count
- ✅ Historical Data Points used
- ✅ Confidence Score (e.g., 75.5%)
- ✅ Recommendation message:
  - "Inventory is sufficient" (green)
  - OR "⚠️ Shortage expected" (red)

**Note:** If insufficient data, will show error message

---

#### Scenario 8: Donor Views Donation History

**Steps:**
1. Logout from hospital
2. Login as Donor 3:
   - Email: `sample.donor3@example.com`
   - Password: `SamplePass123!`
3. Press Ctrl + Shift + R (hard refresh)

**Expected Results:**
- ✅ Profile displayed
- ✅ Donation history table with 2-3 donations
- ✅ Columns:
  - Date
  - Blood Group
  - Hospital
  - Status
  - Blockchain
  - Certificate
- ✅ "Download Certificate" button for each donation

**Test Certificate Download:**
1. Click "Download Certificate" for any donation
2. PDF should download
3. Open PDF and verify:
   - Donor name
   - Blood group
   - Donation date
   - Hospital name
   - Blood Unit ID
   - QR code

---

#### Scenario 9: Admin Panel

**Steps:**
1. Logout from donor
2. Login as Admin:
   - Email: `admin@lifechain.com`
   - Password: `Admin@123456`
3. Click "System Statistics" tab

**Expected Results:**
- ✅ Statistics displayed:
  - Total Donors: 25+
  - Verified Hospitals: 11+
  - Total Blood Units: 65+
  - Active Emergency Requests: 5+
- ✅ Blood Units by Status chart
- ✅ Blood Units by Blood Group chart
- ✅ "Pending Hospitals" tab available

---

### 6.3 Testing Commands

#### Reset Demo Data:
```bash
cd backend
node prepare-for-demo.js
node reset-test-donors.js
```

#### Check Donor Donations:
```bash
cd backend
node check-donor-donations.js
```

#### Verify Demo Credentials:
```bash
cd backend
node verify-demo-credentials.js
```

#### Check Current Inventory:
```bash
cd backend
node check-current-inventory.js
```

#### Test Email Workflow:
```bash
cd backend
node test-email-workflow.js
```

#### Test Emergency Request:
```bash
cd backend
node test-emergency-request.js
```

---

## 7. Demo Credentials

### 👤 Donors (3)

| Name | Email | Password | Blood Group | Age | Weight | Location |
|------|-------|----------|-------------|-----|--------|----------|
| Sample Donor 1 | sample.donor1@example.com | SamplePass123! | A- | 29 | 56 kg | Mumbai, 400001 |
| Sample Donor 2 | sample.donor2@example.com | SamplePass123! | B+ | 35 | 65 kg | Mumbai, 400001 |
| Sample Donor 3 | sample.donor3@example.com | SamplePass123! | B- | 42 | 78 kg | Mumbai, 400001 |

### 🏥 Hospitals (2)

| Name | Email | Password | Location | Status |
|------|-------|----------|----------|--------|
| City General Hospital | sample.hospital1@example.com | HospitalPass123! | Mumbai, 500001 | ✅ Verified |
| Metro Medical Center | sample.hospital2@example.com | HospitalPass123! | Delhi, 110001 | ✅ Verified |

### 👨‍💼 Admin (1)

| Role | Email | Password |
|------|-------|----------|
| System Administrator | admin@lifechain.com | Admin@123456 |


### Email Mapping (Real Emails for Notifications)

| Demo Email | Real Email (for notifications) |
|------------|-------------------------------|
| admin@lifechain.com | sabalen666@gmail.com |
| sample.hospital1@example.com | nileshsabale8869@gmail.com |
| sample.hospital2@example.com | nilesh.sabale.dev@gmail.com |
| sample.donor1@example.com | ns7499244144@gmail.com |
| sample.donor2@example.com | kingmaker0633@gmail.com |
| sample.donor3@example.com | userns3106@gmail.com |

**Note:** Login uses demo emails, but notifications are sent to real emails.

---

## 8. Blockchain Configuration

### Network Details

| Parameter | Value |
|-----------|-------|
| Network Name | Polygon Amoy Testnet |
| Chain ID | 80002 |
| RPC URL | https://rpc-amoy.polygon.technology |
| Currency Symbol | MATIC |
| Block Explorer | https://amoy.polygonscan.com |

### Smart Contract

| Parameter | Value |
|-----------|-------|
| Contract Address | `0xD14cd2fB4c97E980A6e93ee4C813787a23c1B009` |
| Deployer Address | `0x6cdE23078190764Cc14380Fc138cefBa1918E890` |
| Deployment Date | 2026-02-28 |
| Block Number | 34567259 |
| Solidity Version | 0.8.20 |

### Get Testnet MATIC

**Your Wallet Address for Receiving MATIC:**
```
0x6cdE23078190764Cc14380Fc138cefBa1918E890
```

**How to Get Free MATIC:**
1. Visit: https://faucet.polygon.technology/
2. Select "Polygon Amoy" network
3. Enter your address: `0x6cdE23078190764Cc14380Fc138cefBa1918E890`
4. Complete captcha
5. Click "Submit"
6. Wait 1-2 minutes for tokens to arrive

**Check Balance:**
- Visit: https://amoy.polygonscan.com/address/0x6cdE23078190764Cc14380Fc138cefBa1918E890
- Or check in MetaMask

### Smart Contract Functions

#### 1. recordDonation
```solidity
function recordDonation(
    string memory bloodUnitID,
    string memory metadata
) public
```
Records a blood donation milestone on blockchain.

**Metadata Format:**
```json
{
  "donorID": "65f1234567890abcdef12345",
  "hospitalID": "65f9876543210fedcba98765",
  "bloodGroup": "A+",
  "timestamp": "2026-03-14T10:30:00.000Z"
}
```

#### 2. recordTransfer
```solidity
function recordTransfer(
    string memory bloodUnitID,
    string memory metadata
) public
```
Records a blood transfer milestone on blockchain.

**Metadata Format:**
```json
{
  "fromHospitalID": "65f9876543210fedcba98765",
  "toHospitalID": "65f1111111111111111111111",
  "bloodGroup": "B+",
  "timestamp": "2026-03-14T11:00:00.000Z"
}
```

#### 3. recordUsage
```solidity
function recordUsage(
    string memory bloodUnitID,
    string memory metadata
) public
```
Records a blood usage milestone on blockchain.

**Metadata Format:**
```json
{
  "hospitalID": "65f9876543210fedcba98765",
  "patientID": "PAT-DEMO-001",
  "bloodGroup": "O-",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

#### 4. getMilestones
```solidity
function getMilestones(string memory bloodUnitID) 
    public 
    view 
    returns (Milestone[] memory)
```
Retrieves all milestones for a blood unit.

#### 5. getMilestoneCount
```solidity
function getMilestoneCount(string memory bloodUnitID) 
    public 
    view 
    returns (uint256)
```
Returns the number of milestones for a blood unit.

### Blockchain Retry Queue

If blockchain recording fails (low MATIC, network issues), the system:
1. Saves the transaction to MongoDB
2. Queues it in the retry queue
3. Retries every 5 minutes automatically
4. Updates the blood unit with transaction hash when successful

**Check Retry Queue:**
```bash
cd backend
node check-retry-queue.js
```

**Clear Retry Queue:**
```bash
cd backend
node clear-retry-queue.js
```

---

## 9. API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

### 9.1 Auth Routes

#### POST /auth/register
Register a new user (Donor, Hospital, or Admin).

**Request Body:**
```json
{
  "email": "donor@example.com",
  "password": "Password123!",
  "role": "Donor",
  "name": "John Doe",
  "bloodGroup": "A+",
  "dateOfBirth": "1995-01-15",
  "weight": 70,
  "city": "Mumbai",
  "pincode": "400001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1234567890abcdef12345",
      "email": "donor@example.com",
      "role": "Donor",
      "name": "John Doe"
    }
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "sample.donor1@example.com",
  "password": "SamplePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1234567890abcdef12345",
      "email": "sample.donor1@example.com",
      "role": "Donor",
      "name": "Sample Donor 1"
    }
  }
}
```

---

### 9.2 Donor Routes

#### GET /donor/profile
Get donor profile with eligibility information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65f1234567890abcdef12345",
    "name": "Sample Donor 1",
    "email": "sample.donor1@example.com",
    "bloodGroup": "A-",
    "age": 29,
    "weight": 56,
    "city": "Mumbai",
    "pincode": "400001",
    "lastDonationDate": "2026-01-15T10:00:00.000Z",
    "daysSinceLastDonation": 58,
    "eligibilityStatus": "Eligible",
    "nextEligibleDate": null
  }
}
```

#### GET /donor/donations
Get donor's donation history.

**Response:**
```json
{
  "success": true,
  "message": "Donation history retrieved successfully",
  "data": {
    "donations": [
      {
        "bloodUnitID": "BU-1773172321120-dc67bb70",
        "bloodGroup": "A-",
        "collectionDate": "2026-01-15T10:00:00.000Z",
        "expiryDate": "2026-02-26T10:00:00.000Z",
        "status": "Used",
        "originalHospital": {
          "name": "City General Hospital",
          "city": "Mumbai"
        },
        "donationTxHash": "0x1234567890abcdef...",
        "blockchainExplorerURL": "https://amoy.polygonscan.com/tx/0x1234..."
      }
    ],
    "total": 1
  }
}
```

#### GET /donor/certificate/:bloodUnitID
Download donation certificate PDF.

**Response:** PDF file download

---

### 9.3 Hospital Routes

#### POST /hospital/donate
Record a blood donation.

**Request Body:**
```json
{
  "donorEmail": "sample.donor2@example.com",
  "bloodGroup": "B+",
  "collectionDate": "2026-03-14"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blood donation recorded successfully",
  "data": {
    "bloodUnitID": "BU-1773172321120-dc67bb70",
    "donorName": "Sample Donor 2",
    "bloodGroup": "B+",
    "collectionDate": "2026-03-14T00:00:00.000Z",
    "expiryDate": "2026-04-25T00:00:00.000Z",
    "status": "Collected",
    "daysUntilExpiry": 42,
    "blockchainTxHash": "0xabcdef1234567890...",
    "blockchainStatus": "Recorded"
  }
}
```

#### GET /hospital/inventory
Get hospital's blood inventory.

**Query Parameters:**
- `bloodGroup` (optional): Filter by blood group
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "message": "Inventory retrieved successfully",
  "data": {
    "inventory": [
      {
        "bloodUnitID": "BU-1773172321120-dc67bb70",
        "bloodGroup": "B+",
        "donorName": "Sample Donor 2",
        "collectionDate": "2026-03-14T00:00:00.000Z",
        "expiryDate": "2026-04-25T00:00:00.000Z",
        "daysUntilExpiry": 42,
        "isExpired": false,
        "status": "Collected",
        "originalHospital": "City General Hospital"
      }
    ],
    "summary": {
      "total": 1,
      "byBloodGroup": { "B+": 1 },
      "byStatus": { "Collected": 1 }
    }
  }
}
```

#### POST /hospital/transfer
Transfer blood unit to another hospital.

**Request Body:**
```json
{
  "bloodUnitID": "BU-1773172321120-dc67bb70",
  "destinationHospitalID": "65f9876543210fedcba98765"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blood unit transferred successfully",
  "data": {
    "bloodUnitID": "BU-1773172321120-dc67bb70",
    "bloodGroup": "B+",
    "fromHospital": "City General Hospital",
    "toHospital": "Metro Medical Center",
    "transferDate": "2026-03-14T12:00:00.000Z",
    "status": "Transferred",
    "blockchainTxHash": "0x9876543210fedcba...",
    "blockchainStatus": "Recorded"
  }
}
```

#### POST /hospital/use
Record blood unit usage.

**Request Body:**
```json
{
  "bloodUnitID": "BU-1773172321120-dc67bb70",
  "patientID": "PAT-DEMO-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blood usage recorded successfully",
  "data": {
    "bloodUnitID": "BU-1773172321120-dc67bb70",
    "bloodGroup": "B+",
    "patientID": "PAT-DEMO-001",
    "usageDate": "2026-03-14T13:00:00.000Z",
    "status": "Used",
    "blockchainTxHash": "0xfedcba0987654321...",
    "blockchainStatus": "Recorded"
  }
}
```


#### POST /hospital/emergency-request
Create emergency blood request.

**Request Body:**
```json
{
  "bloodGroup": "O+",
  "quantity": 3,
  "city": "Mumbai",
  "pincode": "400001",
  "urgencyLevel": "Critical",
  "notes": "Urgent need for surgery patient"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emergency request created and donors notified",
  "data": {
    "requestID": "65f1234567890abcdef12345",
    "bloodGroup": "O+",
    "quantity": 3,
    "location": { "city": "Mumbai", "pincode": "400001" },
    "urgencyLevel": "Critical",
    "notifiedDonors": 10,
    "topDonors": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210",
        "suitabilityScore": 0.95
      }
    ],
    "aiServiceStatus": "available"
  }
}
```

#### GET /hospital/predict-demand/:bloodGroup
Get 7-day demand prediction for a blood group.

**Response:**
```json
{
  "success": true,
  "message": "Demand prediction generated successfully",
  "data": {
    "bloodGroup": "O-",
    "currentInventory": 5,
    "historicalDataPoints": 30,
    "predictions": [
      { "day": 1, "predictedDemand": 2 },
      { "day": 2, "predictedDemand": 3 },
      { "day": 3, "predictedDemand": 2 },
      { "day": 4, "predictedDemand": 4 },
      { "day": 5, "predictedDemand": 3 },
      { "day": 6, "predictedDemand": 2 },
      { "day": 7, "predictedDemand": 3 }
    ],
    "confidence": 0.755,
    "totalPredictedDemand": 19,
    "recommendation": "⚠️ Inventory shortage expected. Current: 5 units, Predicted 7-day demand: 19 units. Shortage: 14 units.",
    "aiServiceStatus": "available"
  }
}
```

---

### 9.4 Admin Routes

#### GET /admin/statistics
Get system-wide statistics.

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalDonors": 25,
    "verifiedHospitals": 11,
    "totalBloodUnits": 65,
    "activeEmergencyRequests": 5,
    "bloodUnitsByStatus": {
      "Collected": 3,
      "Stored": 19,
      "Transferred": 5,
      "Used": 38
    },
    "bloodUnitsByBloodGroup": {
      "A+": 12,
      "A-": 8,
      "B+": 15,
      "B-": 6,
      "AB+": 4,
      "AB-": 3,
      "O+": 10,
      "O-": 7
    }
  }
}
```

#### GET /admin/pending-hospitals
Get list of hospitals pending verification.

**Response:**
```json
{
  "success": true,
  "message": "Pending hospitals retrieved successfully",
  "data": {
    "hospitals": [
      {
        "id": "65f1234567890abcdef12345",
        "hospitalName": "New Hospital",
        "email": "newhospital@example.com",
        "city": "Delhi",
        "pincode": "110001",
        "createdAt": "2026-03-14T10:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

#### PATCH /admin/verify-hospital/:hospitalID
Verify or reject a hospital.

**Request Body:**
```json
{
  "action": "approve"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hospital verified successfully",
  "data": {
    "hospitalID": "65f1234567890abcdef12345",
    "hospitalName": "New Hospital",
    "isVerified": true
  }
}
```

---

### 9.5 Blockchain Routes

#### GET /blockchain/milestones/:bloodUnitID
Get all blockchain milestones for a blood unit.

**Response:**
```json
{
  "success": true,
  "message": "Milestones retrieved successfully",
  "data": {
    "bloodUnitID": "BU-1773172321120-dc67bb70",
    "milestones": [
      {
        "type": "Donation",
        "actor": "0x1234567890abcdef...",
        "timestamp": "2026-03-14T10:00:00.000Z",
        "metadata": {
          "donorID": "65f1234567890abcdef12345",
          "hospitalID": "65f9876543210fedcba98765",
          "bloodGroup": "B+"
        }
      },
      {
        "type": "Transfer",
        "actor": "0x9876543210fedcba...",
        "timestamp": "2026-03-14T12:00:00.000Z",
        "metadata": {
          "fromHospitalID": "65f9876543210fedcba98765",
          "toHospitalID": "65f1111111111111111111111",
          "bloodGroup": "B+"
        }
      }
    ],
    "totalMilestones": 2
  }
}
```

---

## 10. Deployment Information

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lifechain

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=24h

# Blockchain Configuration (Polygon Amoy Testnet)
BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your-wallet-private-key
CONTRACT_ADDRESS=0xD14cd2fB4c97E980A6e93ee4C813787a23c1B009

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI Microservice
AI_SERVICE_URL=http://localhost:5001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

#### AI Service (.env)
```env
FLASK_ENV=development
PORT=5001
```

#### Blockchain (.env)
```env
# Polygon Amoy Testnet RPC URL
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology

# Your MetaMask wallet private key
PRIVATE_KEY=your-wallet-private-key

# Deployed Smart Contract Address
CONTRACT_ADDRESS=0xD14cd2fB4c97E980A6e93ee4C813787a23c1B009

# Optional: PolygonScan API key for contract verification
POLYGONSCAN_API_KEY=optional-for-verification
```

---

### Database Schema

#### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['Donor', 'Hospital', 'Admin'], required),
  walletAddress: String (required),
  
  // Donor fields
  name: String,
  bloodGroup: String (enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  dateOfBirth: Date,
  weight: Number,
  city: String,
  pincode: String,
  lastDonationDate: Date,
  eligibilityStatus: String,
  
  // Hospital fields
  hospitalName: String,
  isVerified: Boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

#### BloodUnit Collection
```javascript
{
  _id: ObjectId,
  bloodUnitID: String (unique, required),
  donorID: ObjectId (ref: 'User', required),
  bloodGroup: String (required),
  collectionDate: Date (required),
  expiryDate: Date (required),
  status: String (enum: ['Collected', 'Stored', 'Transferred', 'Used']),
  originalHospitalID: ObjectId (ref: 'User', required),
  currentHospitalID: ObjectId (ref: 'User', required),
  
  transferHistory: [{
    fromHospitalID: ObjectId (ref: 'User'),
    toHospitalID: ObjectId (ref: 'User'),
    transferDate: Date,
    transferredBy: ObjectId (ref: 'User'),
    blockchainTxHash: String
  }],
  
  usageDate: Date,
  patientID: String,
  
  donationTxHash: String,
  transferTxHashes: [String],
  usageTxHash: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

#### EmergencyRequest Collection
```javascript
{
  _id: ObjectId,
  hospitalID: ObjectId (ref: 'User', required),
  bloodGroup: String (required),
  quantity: Number (required),
  city: String (required),
  pincode: String (required),
  urgencyLevel: String (enum: ['Low', 'Medium', 'High', 'Critical']),
  status: String (enum: ['Active', 'Fulfilled', 'Cancelled']),
  notes: String,
  notifiedDonors: [ObjectId] (ref: 'User'),
  createdDate: Date,
  fulfillmentDate: Date
}
```

#### BlockchainRetryQueue Collection
```javascript
{
  _id: ObjectId,
  bloodUnitID: String (required),
  milestoneType: String (enum: ['Donation', 'Transfer', 'Usage'], required),
  metadata: Object (required),
  retryCount: Number (default: 0),
  lastRetryAt: Date,
  status: String (enum: ['Pending', 'Processing', 'Completed', 'Failed']),
  error: String,
  createdAt: Date
}
```

---

### Project Structure

```
LifeChain/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/                 # (Future: Controller logic)
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication
│   │   └── roleCheck.js             # Role-based access control
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── BloodUnit.js             # Blood unit schema
│   │   ├── EmergencyRequest.js      # Emergency request schema
│   │   └── BlockchainRetryQueue.js  # Retry queue schema
│   ├── routes/
│   │   ├── auth.js                  # Auth routes
│   │   ├── donor.js                 # Donor routes
│   │   ├── hospital.js              # Hospital routes
│   │   ├── admin.js                 # Admin routes
│   │   └── blockchain.js            # Blockchain routes
│   ├── services/
│   │   ├── blockchainService.js     # Blockchain interaction
│   │   ├── emailService.js          # Email sending
│   │   ├── aiService.js             # AI service integration
│   │   ├── certificateService.js    # PDF certificate generation
│   │   ├── retryService.js          # Blockchain retry logic
│   │   └── emailMapping.js          # Demo to real email mapping
│   ├── jobs/
│   │   └── expiryAlerts.js          # Scheduled expiry alerts
│   ├── utils/
│   │   └── blockchainParser.js      # Blockchain data parsing
│   ├── .env                         # Environment variables
│   ├── server.js                    # Main server file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── HospitalDashboard.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── Unauthorized.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios instance
│   │   ├── App.jsx                  # Main app component
│   │   ├── index.css                # Tailwind styles
│   │   └── main.jsx                 # Entry point
│   ├── .env                         # Environment variables
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── blockchain/
│   ├── contracts/
│   │   └── BloodChain.sol           # Smart contract
│   ├── scripts/
│   │   ├── deploy.js                # Deployment script
│   │   └── verify-setup.js          # Verification script
│   ├── artifacts/                   # Compiled contracts
│   ├── cache/                       # Hardhat cache
│   ├── .env                         # Environment variables
│   ├── hardhat.config.js            # Hardhat configuration
│   ├── deployment-info.json         # Deployment details
│   └── package.json
│
├── ai-service/
│   ├── models/
│   │   ├── demand_predictor.py      # Demand prediction model
│   │   ├── donor_ranker.py          # Donor ranking model
│   │   └── trained_models/          # Saved models
│   ├── services/
│   │   └── alert_service.py         # Expiry alert service
│   ├── utils/
│   │   └── data_generator.py        # Synthetic data generation
│   ├── data/
│   │   ├── blood_usage_history.csv
│   │   └── donor_history.csv
│   ├── .env                         # Environment variables
│   ├── app.py                       # Flask application
│   ├── requirements.txt             # Python dependencies
│   ├── setup.py                     # Setup script
│   └── README.md
│
├── docs/
│   ├── MONGODB_SETUP.md
│   ├── METAMASK_SETUP.md
│   ├── BLOCKCHAIN_SETUP_COMPLETE.md
│   └── PROGRESS.md
│
├── .gitignore
├── README.md
└── Review_01.md                     # This file
```

---

## 11. Key Features Summary

### ✅ Implemented Features

1. **User Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Donor, Hospital, Admin)
   - Password hashing with bcrypt
   - Protected routes

2. **Donor Management**
   - Profile management
   - Eligibility checking (age, weight, 56-day rule)
   - Donation history tracking
   - Digital certificate generation

3. **Hospital Operations**
   - Record blood donations
   - Inventory management with filters
   - Blood transfer between hospitals
   - Blood usage recording
   - Emergency request creation
   - AI-powered demand prediction

4. **Blockchain Integration**
   - Smart contract deployed on Polygon Amoy
   - Donation milestone recording
   - Transfer milestone recording
   - Usage milestone recording
   - Automatic retry queue for failed transactions
   - Transaction hash storage and verification

5. **AI-Powered Features**
   - 7-day demand prediction using linear regression
   - AI-ranked donor recommendations for emergencies
   - Location-based donor matching
   - Expiry alert system

6. **Email Notifications**
   - Emergency request notifications to donors
   - Email mapping (demo emails → real emails)
   - Gmail SMTP integration

7. **Admin Panel**
   - System-wide statistics
   - Hospital verification
   - Blood unit monitoring
   - Emergency request tracking

8. **Security Features**
   - Rate limiting (500 requests per 15 minutes)
   - CORS configuration
   - Security headers
   - Input validation
   - Error handling

---

## 12. Testing Checklist

### Pre-Demo Checklist

- [ ] All services running (Backend, Frontend, AI Service)
- [ ] MongoDB connected
- [ ] Blockchain RPC accessible
- [ ] Demo credentials verified
- [ ] Email service configured
- [ ] Browser cache cleared
- [ ] Rate limit reset (restart backend)

### Feature Testing Checklist

#### Donor Features
- [ ] Donor login works
- [ ] Profile displays correctly
- [ ] Eligibility status calculated
- [ ] Donation history visible
- [ ] Certificate download works
- [ ] PDF certificate has QR code

#### Hospital Features
- [ ] Hospital login works
- [ ] Record donation works
- [ ] Donor eligibility checked
- [ ] Blockchain recording works
- [ ] Inventory displays correctly
- [ ] Filters work (blood group, status)
- [ ] Transfer blood works
- [ ] Record usage works
- [ ] Emergency request creation works
- [ ] Email notifications sent
- [ ] Demand prediction works
- [ ] AI service responds

#### Admin Features
- [ ] Admin login works
- [ ] Statistics display correctly
- [ ] Pending hospitals visible
- [ ] Hospital verification works

#### Blockchain Features
- [ ] Donation recorded on blockchain
- [ ] Transfer recorded on blockchain
- [ ] Usage recorded on blockchain
- [ ] Transaction hashes stored
- [ ] Retry queue works
- [ ] Can view on Polygon Amoy explorer

---

## 13. Troubleshooting

### Common Issues

#### 1. Rate Limit Error
**Error:** "Too many requests from this IP"
**Solution:** Restart backend server
```bash
cd backend
# Press Ctrl+C to stop
npm start
```

#### 2. Blockchain Pending
**Issue:** Blockchain status shows "Pending"
**Cause:** Low MATIC balance or network congestion
**Solution:** 
- Get free MATIC from faucet
- Wait for retry queue to process (every 5 minutes)
- Check retry queue: `node check-retry-queue.js`

#### 3. Page Not Loading
**Solution:** Hard refresh (Ctrl + Shift + R)

#### 4. Data Not Showing
**Solution:** 
- Check if all services are running
- Verify MongoDB connection
- Check browser console for errors
- Restart backend if needed

#### 5. Email Not Sending
**Check:**
- SMTP credentials in backend/.env
- Email mapping in emailMapping.js
- Check spam folder

#### 6. AI Service Not Working
**Check:**
- AI service running on port 5001
- Python virtual environment activated
- All dependencies installed
- Check AI service logs

---

## 14. Future Enhancements

### Planned Features

1. **Mobile App**
   - React Native mobile application
   - Push notifications for donors
   - QR code scanning for certificates

2. **Advanced Analytics**
   - Blood usage trends
   - Donor retention analysis
   - Hospital performance metrics
   - Predictive shortage alerts

3. **Enhanced AI**
   - Deep learning models
   - Seasonal demand patterns
   - Multi-factor donor scoring
   - Automated inventory optimization

4. **Additional Features**
   - Blood camp management
   - Donor rewards program
   - Real-time blood availability map
   - Integration with hospital EMR systems

5. **Production Readiness**
   - Deploy to mainnet (Polygon PoS)
   - Cloud hosting (AWS/Azure)
   - CI/CD pipeline
   - Automated testing
   - Performance optimization
   - Security audit

---

## 15. Contact & Support

### Project Information

- **Project Name:** LifeChain
- **Version:** 1.0.0
- **Author:** Nilesh Sabale
- **GitHub:** https://github.com/nilesh-sabale
- **License:** ISC

### Support Channels

- **Email:** sabalen666@gmail.com
- **Issues:** GitHub Issues
- **Documentation:** This file (Review_01.md)

---

## 16. Conclusion

LifeChain successfully demonstrates a hybrid approach to blood supply management by combining:

1. **Traditional Database** (MongoDB) for fast queries and complex relationships
2. **Blockchain** (Polygon Amoy) for immutable audit trails and transparency
3. **AI/ML** (Python Flask) for predictive analytics and intelligent recommendations
4. **Modern Web Stack** (React + Node.js) for responsive user experience

The system enforces medical compliance (56-day rule, eligibility criteria), provides real-time inventory management, enables efficient donor-hospital matching, and maintains a transparent, blockchain-verified supply chain.

**Key Achievements:**
- ✅ Complete end-to-end blood donation workflow
- ✅ Blockchain integration with automatic retry
- ✅ AI-powered demand prediction and donor recommendations
- ✅ Role-based access control for 3 user types
- ✅ Digital certificates with QR codes
- ✅ Email notifications for emergency requests
- ✅ Real-time inventory management
- ✅ Comprehensive testing and documentation

**This project serves as a proof-of-concept for modernizing blood supply management using blockchain and AI technologies.**

---

**Document Version:** 1.0  
**Last Updated:** March 14, 2026  
**Total Pages:** 40+

---

**🩸 Thank you for reviewing LifeChain! 🩸**
