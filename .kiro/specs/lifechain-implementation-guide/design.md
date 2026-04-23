# LifeChain Design Document

## Overview

LifeChain is an intelligent blood supply management system that combines traditional database operations with selective blockchain verification. This design document provides comprehensive technical architecture, blockchain concept explanations, and step-by-step implementation guidance for developers with limited blockchain experience.

### System Architecture

LifeChain consists of four main components:

1. **Backend API (Node.js + Express)**: RESTful API handling authentication, business logic, and data orchestration
2. **Database (MongoDB Atlas)**: Persistent storage for users, blood units, and operational data
3. **Blockchain Layer (Polygon Amoy Testnet)**: Immutable audit trail for three critical milestones (Donation, Transfer, Usage)
4. **AI Microservice (Flask + Python)**: Independent service for demand prediction, donor recommendations, and expiry alerts

### Why Blockchain?

**What is Blockchain?**
Blockchain is a distributed ledger technology where data is stored in "blocks" that are cryptographically linked together in a "chain". Once data is written to the blockchain, it cannot be altered or deleted - it's permanent and transparent.

**Why Use Blockchain for Blood Supply Chain?**
- **Immutability**: Donation, transfer, and usage records cannot be tampered with
- **Transparency**: Anyone can verify the authenticity of blood supply chain events
- **Trust**: Hospitals, donors, and regulators can independently verify records
- **Audit Trail**: Complete history of blood unit journey from donation to usage

**Why Only 3 Milestones?**
Recording every operation on blockchain would be slow and expensive. We selectively record only the three most critical events:
1. **Donation**: Proof that blood was collected from a verified donor
2. **Transfer**: Proof that blood moved between hospitals
3. **Usage**: Proof that blood was used for a patient

Routine operations (status updates, inventory queries) remain in MongoDB for performance.

### What is Polygon Amoy Testnet?

**Polygon Amoy** is a test blockchain network that mimics the real Polygon blockchain but uses fake cryptocurrency (test MATIC) that has no real-world value. It's perfect for development because:
- **Free to use**: Test MATIC tokens are free from faucets
- **No risk**: Mistakes don't cost real money
- **Fast**: Transactions confirm in 2-5 seconds
- **Ethereum-compatible**: Uses same tools as Ethereum (Hardhat, Ethers.js)

**Key Concepts:**
- **Wallet Address**: A unique identifier (like 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb) that represents an account on the blockchain
- **Private Key**: A secret password that controls the wallet (NEVER share this)
- **Transaction**: An operation that changes blockchain state (costs gas fees)
- **Gas Fees**: Small amounts of MATIC paid to process transactions (free on testnet)
- **Smart Contract**: Code that runs on the blockchain (like a program that can't be changed once deployed)

### Technology Stack

**Backend:**
- Node.js 18+ with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for emails
- PDFKit for certificate generation

**Blockchain:**
- Hardhat (development framework)
- Ethers.js v6 (blockchain interaction library)
- Solidity 0.8.x (smart contract language)
- Polygon Amoy Testnet RPC

**AI Microservice:**
- Python 3.9+ with Flask
- Scikit-learn for ML models
- Pandas for data processing
- NumPy for numerical operations

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- Axios for HTTP requests
- React Router for navigation

**Deployment:**
- Frontend: Vercel (free tier)
- Backend: Render (free tier)
- AI Service: Render (free tier)
- Database: MongoDB Atlas (free tier)
- Blockchain: Polygon Amoy (free testnet)

## Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend (React)"
        A[Donor Dashboard]
        B[Hospital Dashboard]
        C[Admin Panel]
    end
    
    subgraph "Backend API (Express)"
        D[Authentication Middleware]
        E[Route Handlers]
        F[Business Logic]
        G[Blockchain Service]
        H[Email Service]
    end
    
    subgraph "Data Layer"
        I[(MongoDB Atlas)]
        J[Blockchain Service Layer]
    end
    
    subgraph "Blockchain (Polygon Amoy)"
        K[Smart Contract]
        L[Milestone Events]
    end
    
    subgraph "AI Microservice (Flask)"
        M[Demand Prediction]
        N[Donor Recommendations]
        O[Expiry Alerts]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> I
    F --> G
    F --> H
    F --> M
    F --> N
    F --> O
    G --> J
    J --> K
    K --> L
    
    style K fill:#f9f,stroke:#333,stroke-width:4px
    style I fill:#bbf,stroke:#333,stroke-width:2px
    style M fill:#bfb,stroke:#333,stroke-width:2px
```

### Data Flow Patterns

**Pattern 1: Authentication Flow**
```
User Login → Backend validates credentials → Generate JWT → Return token → 
Frontend stores token → Include token in all subsequent requests → 
Backend verifies token → Grant access to protected resources
```

**Pattern 2: Blood Donation with Blockchain**
```
Hospital records donation → Validate donor eligibility → 
Create Blood_Unit in MongoDB → Record milestone on blockchain → 
Update donor's lastDonationDate → Return success with transaction hash
```

**Pattern 3: Emergency Request with AI**
```
Hospital creates emergency request → Query eligible donors by location → 
Send donor list to AI service → AI ranks donors by suitability → 
Send notifications to top 10 donors → Return request confirmation
```

**Pattern 4: Blockchain Retry Logic**
```
Blockchain transaction fails → Store milestone in retry queue → 
Schedule retry in 5 minutes → Attempt resubmission → 
If success: update Blood_Unit with txHash → If fail: retry up to 24 hours → 
After 24 hours: alert administrators
```

### Hybrid Storage Strategy

**MongoDB (Off-Chain) - Fast, Mutable:**
- User profiles (donors, hospitals, admins)
- Blood unit metadata (status, location, expiry)
- Emergency requests
- Transfer history details
- Email logs and notifications

**Blockchain (On-Chain) - Slow, Immutable:**
- Donation milestone (donor → hospital)
- Transfer milestone (hospital → hospital)
- Usage milestone (hospital → patient)

This hybrid approach provides transparency for critical events while maintaining system performance.


## Components and Interfaces

### Component 1: Backend API Server

**Technology:** Node.js 18+ with Express.js

**Responsibilities:**
- Handle HTTP requests and responses
- Authenticate and authorize users
- Validate input data
- Orchestrate business logic
- Interact with MongoDB
- Communicate with blockchain
- Send emails and notifications
- Generate PDF certificates

**File Structure:**
```
backend/
├── server.js                 # Entry point, Express app setup
├── config/
│   ├── db.js                # MongoDB connection
│   └── blockchain.js        # Blockchain provider setup
├── models/
│   ├── User.js              # Donor, Hospital, Admin schemas
│   ├── BloodUnit.js         # Blood unit schema
│   ├── EmergencyRequest.js  # Emergency request schema
│   └── BlockchainRetry.js   # Retry queue schema
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── roleCheck.js         # Role-based access control
│   └── rateLimiter.js       # API rate limiting
├── routes/
│   ├── auth.js              # Registration, login
│   ├── donor.js             # Donor endpoints
│   ├── hospital.js          # Hospital endpoints
│   └── admin.js             # Admin endpoints
├── services/
│   ├── blockchainService.js # Smart contract interactions
│   ├── emailService.js      # Email sending
│   ├── aiService.js         # AI microservice communication
│   └── certificateService.js # PDF generation
├── utils/
│   ├── validators.js        # Input validation
│   └── helpers.js           # Utility functions
└── .env                     # Environment variables
```


**Environment Variables (.env):**
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lifechain
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=24h

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your-wallet-private-key-from-metamask
CONTRACT_ADDRESS=deployed-smart-contract-address

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# AI Microservice
AI_SERVICE_URL=http://localhost:5001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Key Dependencies (package.json):**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "nodemailer": "^6.9.7",
    "pdfkit": "^0.14.0",
    "qrcode": "^1.5.3",
    "ethers": "^6.9.0",
    "axios": "^1.6.2"
  }
}
```


### Component 2: Blockchain Layer

**Technology:** Hardhat + Solidity + Ethers.js

**Responsibilities:**
- Deploy smart contract to Polygon Amoy
- Record donation, transfer, and usage milestones
- Emit events for each milestone
- Provide milestone verification
- Handle transaction failures gracefully

**File Structure:**
```
blockchain/
├── contracts/
│   └── BloodChain.sol       # Smart contract
├── scripts/
│   ├── deploy.js            # Deployment script
│   └── verify.js            # Contract verification
├── test/
│   └── BloodChain.test.js   # Smart contract tests
├── hardhat.config.js        # Hardhat configuration
└── .env                     # Blockchain environment variables
```

**Smart Contract Interface (BloodChain.sol):**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BloodChain {
    // Milestone types
    enum MilestoneType { Donation, Transfer, Usage }
    
    // Milestone structure
    struct Milestone {
        string bloodUnitID;
        MilestoneType milestoneType;
        address actor;
        string metadata; // JSON string with additional data
        uint256 timestamp;
    }
    
    // Mapping: bloodUnitID => array of milestones
    mapping(string => Milestone[]) public bloodUnitMilestones;
    
    // Events
    event DonationRecorded(string bloodUnitID, address donor, uint256 timestamp);
    event TransferRecorded(string bloodUnitID, address fromHospital, address toHospital, uint256 timestamp);
    event UsageRecorded(string bloodUnitID, address hospital, uint256 timestamp);
    
    // Functions
    function recordDonation(string memory bloodUnitID, string memory metadata) public;
    function recordTransfer(string memory bloodUnitID, string memory metadata) public;
    function recordUsage(string memory bloodUnitID, string memory metadata) public;
    function getMilestones(string memory bloodUnitID) public view returns (Milestone[] memory);
}
```


**Blockchain Environment Variables:**
```
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your-wallet-private-key
POLYGONSCAN_API_KEY=optional-for-verification
```

**How to Get Test MATIC:**
1. Create a MetaMask wallet
2. Switch network to Polygon Amoy Testnet
3. Copy your wallet address
4. Visit faucet: https://faucet.polygon.technology/
5. Request test MATIC (free, instant)

**Hardhat Configuration (hardhat.config.js):**
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: process.env.POLYGON_AMOY_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80002
    }
  }
};
```

**Key Dependencies (package.json):**
```json
{
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "hardhat": "^2.19.0",
    "dotenv": "^16.3.1"
  },
  "dependencies": {
    "ethers": "^6.9.0"
  }
}
```


### Component 3: AI Microservice

**Technology:** Python 3.9+ with Flask

**Responsibilities:**
- Predict blood demand for next 7 days
- Recommend donors for emergency requests
- Generate expiry alerts
- Train and update ML models

**File Structure:**
```
ai-service/
├── app.py                   # Flask application entry point
├── models/
│   ├── demand_predictor.py  # Demand prediction model
│   ├── donor_ranker.py      # Donor recommendation model
│   └── trained_models/      # Saved model files
├── services/
│   ├── prediction_service.py
│   ├── recommendation_service.py
│   └── alert_service.py
├── utils/
│   ├── data_processor.py    # Data preprocessing
│   └── validators.py        # Input validation
├── requirements.txt         # Python dependencies
└── .env                     # AI service environment variables
```

**API Endpoints:**
```
POST /api/predict-demand
POST /api/recommend-donors
POST /api/check-expiry
GET /api/health
```

**Environment Variables:**
```
FLASK_PORT=5001
MODEL_PATH=./models/trained_models
BACKEND_API_URL=http://localhost:5000
```

**Key Dependencies (requirements.txt):**
```
Flask==3.0.0
scikit-learn==1.3.2
pandas==2.1.3
numpy==1.26.2
joblib==1.3.2
python-dotenv==1.0.0
requests==2.31.0
```


### Component 4: Frontend Application

**Technology:** React 18 with Vite

**Responsibilities:**
- Provide user interfaces for donors, hospitals, and admins
- Handle user authentication
- Display dashboards and data visualizations
- Communicate with backend API
- Download certificates

**File Structure:**
```
frontend/
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Entry point
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── shared/          # Reusable components
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── DonorDashboard.jsx
│   │   ├── HospitalDashboard.jsx
│   │   └── AdminPanel.jsx
│   ├── services/
│   │   ├── api.js           # Axios configuration
│   │   └── auth.js          # Authentication helpers
│   ├── context/
│   │   └── AuthContext.jsx  # Global auth state
│   └── utils/
│       └── helpers.js
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── .env
```

**Environment Variables (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

**Key Dependencies (package.json):**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "tailwindcss": "^3.3.5"
  }
}
```


## Data Models

### MongoDB Schemas

**User Schema (models/User.js):**
```javascript
const userSchema = new mongoose.Schema({
  // Common fields
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // Hashed with bcrypt
  role: { type: String, enum: ['Donor', 'Hospital', 'Admin'], required: true },
  walletAddress: { type: String, required: true },
  
  // Donor-specific fields
  name: { type: String, required: function() { return this.role === 'Donor'; } },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  dateOfBirth: { type: Date },
  weight: { type: Number }, // in kg
  city: { type: String },
  pincode: { type: String },
  lastDonationDate: { type: Date, default: null },
  eligibilityStatus: { type: String, default: 'Eligible' },
  
  // Hospital-specific fields
  hospitalName: { type: String, required: function() { return this.role === 'Hospital'; } },
  isVerified: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now }
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

// Method to check eligibility
userSchema.methods.checkEligibility = function() {
  if (this.role !== 'Donor') return 'N/A';
  
  const age = this.age;
  if (age < 18 || age > 60) return 'Ineligible - Age';
  if (this.weight < 50) return 'Ineligible - Weight';
  
  if (this.lastDonationDate) {
    const daysSinceLastDonation = Math.floor(
      (Date.now() - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastDonation < 56) return 'Ineligible - 56 Day Rule';
  }
  
  return 'Eligible';
};
```


**BloodUnit Schema (models/BloodUnit.js):**
```javascript
const bloodUnitSchema = new mongoose.Schema({
  bloodUnitID: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `BU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  donorID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
    required: true 
  },
  collectionDate: { type: Date, required: true, default: Date.now },
  expiryDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Collected', 'Stored', 'Transferred', 'Used'], 
    default: 'Collected' 
  },
  originalHospitalID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentHospitalID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Transfer history
  transferHistory: [{
    fromHospitalID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toHospitalID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transferDate: { type: Date },
    transferredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Usage information
  usageDate: { type: Date },
  patientID: { type: String },
  
  // Blockchain references
  donationTxHash: { type: String },
  transferTxHashes: [{ type: String }],
  usageTxHash: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate expiry date
bloodUnitSchema.pre('save', function(next) {
  if (this.isNew && !this.expiryDate) {
    const expiry = new Date(this.collectionDate);
    expiry.setDate(expiry.getDate() + 42); // Blood expires in 42 days
    this.expiryDate = expiry;
  }
  next();
});

// Method to check if expired
bloodUnitSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

// Method to get days until expiry
bloodUnitSchema.methods.daysUntilExpiry = function() {
  const now = new Date();
  const diffTime = this.expiryDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
```


**EmergencyRequest Schema (models/EmergencyRequest.js):**
```javascript
const emergencyRequestSchema = new mongoose.Schema({
  hospitalID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
    required: true 
  },
  quantity: { type: Number, required: true, min: 1 },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  urgencyLevel: { type: String, enum: ['Critical', 'High', 'Medium'], default: 'High' },
  status: { type: String, enum: ['Active', 'Fulfilled', 'Cancelled'], default: 'Active' },
  createdDate: { type: Date, default: Date.now },
  fulfillmentDate: { type: Date },
  notifiedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notes: { type: String }
});
```

**BlockchainRetry Schema (models/BlockchainRetry.js):**
```javascript
const blockchainRetrySchema = new mongoose.Schema({
  bloodUnitID: { type: String, required: true },
  milestoneType: { type: String, enum: ['Donation', 'Transfer', 'Usage'], required: true },
  metadata: { type: Object, required: true },
  attempts: { type: Number, default: 0 },
  lastAttempt: { type: Date },
  error: { type: String },
  status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
```


### Database Indexes

For optimal query performance, create the following indexes:

```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ bloodGroup: 1, city: 1 });
db.users.createIndex({ bloodGroup: 1, pincode: 1 });
db.users.createIndex({ isVerified: 1 });

// BloodUnit indexes
db.bloodunits.createIndex({ bloodUnitID: 1 }, { unique: true });
db.bloodunits.createIndex({ currentHospitalID: 1, status: 1 });
db.bloodunits.createIndex({ bloodGroup: 1, status: 1 });
db.bloodunits.createIndex({ expiryDate: 1 });
db.bloodunits.createIndex({ donorID: 1 });

// EmergencyRequest indexes
db.emergencyrequests.createIndex({ hospitalID: 1, status: 1 });
db.emergencyrequests.createIndex({ bloodGroup: 1, city: 1, status: 1 });
db.emergencyrequests.createIndex({ createdDate: -1 });

// BlockchainRetry indexes
db.blockchainretries.createIndex({ status: 1, attempts: 1 });
db.blockchainretries.createIndex({ createdAt: 1 });
```


### API Endpoints Specification

**Authentication Endpoints:**

```
POST /api/auth/register
Description: Register a new donor or hospital
Request Body:
{
  "role": "Donor" | "Hospital",
  "email": "user@example.com",
  "password": "securePassword123",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  
  // Donor-specific fields
  "name": "John Doe",
  "bloodGroup": "O+",
  "dateOfBirth": "1995-05-15",
  "weight": 70,
  "city": "Mumbai",
  "pincode": "400001",
  
  // Hospital-specific fields
  "hospitalName": "City General Hospital"
}
Response (201):
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "Donor",
    "name": "John Doe"
  }
}
```

```
POST /api/auth/login
Description: Authenticate user and receive JWT token
Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123"
}
Response (200):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "Donor",
    "name": "John Doe"
  }
}
```


**Donor Endpoints:**

```
GET /api/donor/profile
Description: Get donor profile with eligibility status
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "donor": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "bloodGroup": "O+",
    "age": 28,
    "weight": 70,
    "city": "Mumbai",
    "pincode": "400001",
    "lastDonationDate": "2024-01-15T10:30:00Z",
    "eligibilityStatus": "Eligible",
    "daysSinceLastDonation": 60
  }
}
```

```
GET /api/donor/donations
Description: Get donor's donation history
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "donations": [
    {
      "bloodUnitID": "BU-1705315800000-abc123xyz",
      "bloodGroup": "O+",
      "collectionDate": "2024-01-15T10:30:00Z",
      "hospital": "City General Hospital",
      "status": "Used",
      "donationTxHash": "0x1234567890abcdef..."
    }
  ]
}
```

```
GET /api/donor/certificate/:bloodUnitID
Description: Download donation certificate as PDF
Headers: Authorization: Bearer <token>
Response (200): PDF file download
```


**Hospital Endpoints:**

```
POST /api/hospital/donate
Description: Record a blood donation
Headers: Authorization: Bearer <token>
Request Body:
{
  "donorID": "507f1f77bcf86cd799439011",
  "bloodGroup": "O+",
  "collectionDate": "2024-03-15T10:30:00Z"
}
Response (201):
{
  "success": true,
  "message": "Donation recorded successfully",
  "bloodUnit": {
    "bloodUnitID": "BU-1710500000000-xyz789abc",
    "donorID": "507f1f77bcf86cd799439011",
    "bloodGroup": "O+",
    "collectionDate": "2024-03-15T10:30:00Z",
    "expiryDate": "2024-04-26T10:30:00Z",
    "status": "Collected",
    "donationTxHash": "0xabcdef1234567890..."
  }
}
```

```
GET /api/hospital/inventory
Description: Get hospital's blood inventory
Headers: Authorization: Bearer <token>
Query Parameters: ?bloodGroup=O+&status=Stored
Response (200):
{
  "success": true,
  "inventory": [
    {
      "bloodUnitID": "BU-1710500000000-xyz789abc",
      "bloodGroup": "O+",
      "collectionDate": "2024-03-15T10:30:00Z",
      "expiryDate": "2024-04-26T10:30:00Z",
      "daysUntilExpiry": 15,
      "status": "Stored",
      "isExpired": false
    }
  ],
  "summary": {
    "total": 45,
    "byBloodGroup": {
      "O+": 12,
      "A+": 8,
      "B+": 10,
      "AB+": 5,
      "O-": 4,
      "A-": 3,
      "B-": 2,
      "AB-": 1
    }
  }
}
```


```
POST /api/hospital/transfer
Description: Transfer blood unit to another hospital
Headers: Authorization: Bearer <token>
Request Body:
{
  "bloodUnitID": "BU-1710500000000-xyz789abc",
  "destinationHospitalID": "507f1f77bcf86cd799439022"
}
Response (200):
{
  "success": true,
  "message": "Transfer completed successfully",
  "bloodUnit": {
    "bloodUnitID": "BU-1710500000000-xyz789abc",
    "currentHospitalID": "507f1f77bcf86cd799439022",
    "status": "Transferred",
    "transferTxHash": "0x9876543210fedcba..."
  }
}
```

```
POST /api/hospital/use
Description: Record blood usage for a patient
Headers: Authorization: Bearer <token>
Request Body:
{
  "bloodUnitID": "BU-1710500000000-xyz789abc",
  "patientID": "PAT-2024-001"
}
Response (200):
{
  "success": true,
  "message": "Blood usage recorded successfully",
  "bloodUnit": {
    "bloodUnitID": "BU-1710500000000-xyz789abc",
    "status": "Used",
    "usageDate": "2024-03-20T14:30:00Z",
    "patientID": "PAT-2024-001",
    "usageTxHash": "0xfedcba0987654321..."
  }
}
```

```
POST /api/hospital/emergency-request
Description: Create emergency blood request
Headers: Authorization: Bearer <token>
Request Body:
{
  "bloodGroup": "O+",
  "quantity": 3,
  "city": "Mumbai",
  "pincode": "400001",
  "urgencyLevel": "Critical",
  "notes": "Accident victim, multiple injuries"
}
Response (201):
{
  "success": true,
  "message": "Emergency request created and donors notified",
  "request": {
    "id": "507f1f77bcf86cd799439033",
    "bloodGroup": "O+",
    "quantity": 3,
    "status": "Active",
    "notifiedDonors": 10
  }
}
```


```
GET /api/hospital/predict-demand/:bloodGroup
Description: Get AI-powered demand prediction
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "prediction": {
    "bloodGroup": "O+",
    "predictedDemand": [
      { "day": 1, "units": 5 },
      { "day": 2, "units": 6 },
      { "day": 3, "units": 4 },
      { "day": 4, "units": 7 },
      { "day": 5, "units": 5 },
      { "day": 6, "units": 6 },
      { "day": 7, "units": 5 }
    ],
    "confidence": 0.85,
    "recommendation": "Maintain current stock levels"
  }
}
```

```
GET /api/hospital/search-donors
Description: Search eligible donors by location
Headers: Authorization: Bearer <token>
Query Parameters: ?bloodGroup=O+&city=Mumbai&pincode=400001
Response (200):
{
  "success": true,
  "donors": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "bloodGroup": "O+",
      "city": "Mumbai",
      "pincode": "400001",
      "eligibilityStatus": "Eligible",
      "lastDonationDate": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 15
}
```


**Admin Endpoints:**

```
GET /api/admin/pending-hospitals
Description: Get list of unverified hospitals
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "hospitals": [
    {
      "id": "507f1f77bcf86cd799439022",
      "hospitalName": "City General Hospital",
      "email": "admin@cityhospital.com",
      "city": "Mumbai",
      "pincode": "400001",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "createdAt": "2024-03-10T08:00:00Z"
    }
  ]
}
```

```
POST /api/admin/verify-hospital/:hospitalID
Description: Approve hospital registration
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "message": "Hospital verified successfully",
  "hospital": {
    "id": "507f1f77bcf86cd799439022",
    "hospitalName": "City General Hospital",
    "isVerified": true
  }
}
```

```
DELETE /api/admin/reject-hospital/:hospitalID
Description: Reject and delete hospital registration
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "message": "Hospital registration rejected"
}
```

```
GET /api/admin/statistics
Description: Get system-wide statistics
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "stats": {
    "totalDonors": 1250,
    "totalHospitals": 45,
    "totalBloodUnits": 3420,
    "activeEmergencyRequests": 8,
    "bloodUnitsByStatus": {
      "Collected": 120,
      "Stored": 890,
      "Transferred": 340,
      "Used": 2070
    }
  }
}
```


**Blockchain Endpoints:**

```
GET /api/blockchain/milestones/:bloodUnitID
Description: Get all blockchain milestones for a blood unit
Response (200):
{
  "success": true,
  "bloodUnitID": "BU-1710500000000-xyz789abc",
  "milestones": [
    {
      "type": "Donation",
      "timestamp": "2024-03-15T10:30:00Z",
      "txHash": "0xabcdef1234567890...",
      "donor": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "hospital": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      "bloodGroup": "O+"
    },
    {
      "type": "Transfer",
      "timestamp": "2024-03-18T14:20:00Z",
      "txHash": "0x9876543210fedcba...",
      "fromHospital": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      "toHospital": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12"
    },
    {
      "type": "Usage",
      "timestamp": "2024-03-20T14:30:00Z",
      "txHash": "0xfedcba0987654321...",
      "hospital": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
      "patientID": "PAT-2024-001"
    }
  ]
}
```

```
GET /api/blockchain/verify/:txHash
Description: Verify a specific blockchain transaction
Response (200):
{
  "success": true,
  "transaction": {
    "hash": "0xabcdef1234567890...",
    "blockNumber": 12345678,
    "timestamp": "2024-03-15T10:30:00Z",
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "status": "confirmed",
    "data": {
      "bloodUnitID": "BU-1710500000000-xyz789abc",
      "milestoneType": "Donation",
      "bloodGroup": "O+"
    }
  }
}
```


**Health Check Endpoint:**

```
GET /api/health
Description: Check system health and component status
Response (200):
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-03-15T10:30:00Z",
  "components": {
    "database": {
      "status": "connected",
      "responseTime": "15ms"
    },
    "blockchain": {
      "status": "connected",
      "network": "Polygon Amoy",
      "blockNumber": 12345678,
      "responseTime": "250ms"
    },
    "aiService": {
      "status": "connected",
      "responseTime": "120ms"
    }
  },
  "uptime": "72h 15m 30s"
}
```

### AI Microservice API Endpoints

```
POST /api/predict-demand
Description: Predict blood demand for next 7 days
Request Body:
{
  "hospitalID": "507f1f77bcf86cd799439022",
  "bloodGroup": "O+",
  "historicalData": [
    { "date": "2024-03-01", "usage": 5 },
    { "date": "2024-03-02", "usage": 6 },
    // ... more historical data
  ]
}
Response (200):
{
  "success": true,
  "predictions": [
    { "day": 1, "units": 5, "confidence": 0.85 },
    { "day": 2, "units": 6, "confidence": 0.83 },
    // ... 7 days total
  ],
  "recommendation": "Maintain current stock levels"
}
```


```
POST /api/recommend-donors
Description: Rank donors for emergency requests
Request Body:
{
  "bloodGroup": "O+",
  "location": {
    "city": "Mumbai",
    "pincode": "400001"
  },
  "eligibleDonors": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "city": "Mumbai",
      "pincode": "400001",
      "lastDonationDate": "2024-01-15",
      "totalDonations": 5
    }
    // ... more donors
  ]
}
Response (200):
{
  "success": true,
  "rankedDonors": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "suitabilityScore": 0.92,
      "factors": {
        "proximity": 0.95,
        "donationFrequency": 0.88,
        "timeSinceLastDonation": 0.93
      }
    }
    // ... top 10 donors
  ]
}
```

```
POST /api/check-expiry
Description: Identify blood units expiring soon
Request Body:
{
  "bloodUnits": [
    {
      "bloodUnitID": "BU-1710500000000-xyz789abc",
      "bloodGroup": "O+",
      "expiryDate": "2024-03-22",
      "currentHospitalID": "507f1f77bcf86cd799439022"
    }
    // ... more blood units
  ]
}
Response (200):
{
  "success": true,
  "expiringUnits": [
    {
      "bloodUnitID": "BU-1710500000000-xyz789abc",
      "bloodGroup": "O+",
      "daysUntilExpiry": 5,
      "priority": "high",
      "hospitalID": "507f1f77bcf86cd799439022"
    }
  ]
}
```

