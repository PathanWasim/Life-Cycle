# Implementation Plan: LifeChain Blood Supply Management System

## Overview

This implementation plan breaks down the LifeChain system into progressive, educational steps. Each task includes detailed explanations of blockchain concepts to help developers with limited blockchain experience. The implementation follows a logical dependency order: environment setup → database → blockchain foundation → backend core → blood management → AI service → advanced features → frontend → testing & deployment.

## Tasks

- [x] 1. Project Setup and Environment Configuration
  - Initialize all project directories (backend, blockchain, ai-service, frontend)
  - Set up MongoDB Atlas free tier account and create database cluster
  - Install Node.js 18+, Python 3.9+, and MetaMask browser extension
  - Create .env files for each component with placeholder values
  - Initialize Git repository with appropriate .gitignore files
  - _Requirements: 20.4, 20.5_
  - _What is this?_ This task sets up the foundational structure for all components. MongoDB Atlas is a cloud database service with a free tier perfect for development. MetaMask is a browser wallet that will let you interact with the blockchain.

- [x] 2. Set up MongoDB schemas and database connection
  - [x] 2.1 Create User schema with donor, hospital, and admin fields
    - Implement User model in backend/models/User.js with role-based fields
    - Add virtual field for age calculation
    - Add checkEligibility() method for donor eligibility validation
    - _Requirements: 16.1, 16.2, 3.1, 3.2, 3.3, 3.4_
  
  - [x] 2.2 Create BloodUnit schema with blockchain reference fields
    - Implement BloodUnit model in backend/models/BloodUnit.js
    - Add pre-save hook to calculate expiry date (42 days from collection)
    - Add isExpired() and daysUntilExpiry() methods
    - _Requirements: 16.3, 4.3, 22.1, 22.2_
  
  - [x] 2.3 Create EmergencyRequest and BlockchainRetry schemas
    - Implement EmergencyRequest model in backend/models/EmergencyRequest.js
    - Implement BlockchainRetry model in backend/models/BlockchainRetry.js for retry queue
    - _Requirements: 16.4, 21.1_
  
  - [x] 2.4 Set up database connection and indexes
    - Create backend/config/db.js with MongoDB connection logic
    - Add database indexes for optimal query performance (email, bloodGroup, city, pincode, status)
    - Test connection with health check
    - _Requirements: 16.5, 16.6, 24.2_


- [x] 3. Blockchain Foundation Setup (Educational)
  - [x] 3.1 Set up MetaMask wallet and get test MATIC
    - Install MetaMask browser extension
    - Create a new wallet and securely save the seed phrase (NEVER share this)
    - Switch network to Polygon Amoy Testnet (Network ID: 80002, RPC: https://rpc-amoy.polygon.technology)
    - Visit https://faucet.polygon.technology/ and request free test MATIC tokens
    - Copy your wallet address (starts with 0x) for environment variables
    - _Requirements: 14.1, 20.5_
    - _What is this?_ MetaMask is a cryptocurrency wallet that stores your private keys. The Polygon Amoy Testnet is a test blockchain where transactions are free. Test MATIC is fake cryptocurrency used to pay for blockchain transactions (called "gas fees"). Your wallet address is like your bank account number - it's public and safe to share. Your private key is like your password - NEVER share it.
  
  - [x] 3.2 Initialize Hardhat project for smart contract development
    - Create blockchain/ directory and initialize npm project
    - Install Hardhat and dependencies (@nomicfoundation/hardhat-toolbox, ethers, dotenv)
    - Run npx hardhat init and select "Create a JavaScript project"
    - Configure hardhat.config.js with Polygon Amoy network settings
    - Create .env file with POLYGON_AMOY_RPC and PRIVATE_KEY (export from MetaMask: Settings → Security & Privacy → Show Private Key)
    - _Requirements: 14.2_
    - _What is this?_ Hardhat is a development framework for writing, testing, and deploying smart contracts. Think of it like a local development server for blockchain code. The private key lets Hardhat sign transactions on your behalf.
  
  - [x] 3.3 Write BloodChain smart contract in Solidity
    - Create blockchain/contracts/BloodChain.sol
    - Define Milestone struct with bloodUnitID, milestoneType, actor, metadata, timestamp
    - Define MilestoneType enum (Donation, Transfer, Usage)
    - Implement recordDonation() function that stores milestone and emits DonationRecorded event
    - Implement recordTransfer() function that stores milestone and emits TransferRecorded event
    - Implement recordUsage() function that stores milestone and emits UsageRecorded event
    - Implement getMilestones() view function to retrieve all milestones for a bloodUnitID
    - _Requirements: 14.1, 14.5, 4.5, 6.4, 7.3_
    - _What is this?_ A smart contract is code that runs on the blockchain. Solidity is the programming language for Ethereum-compatible blockchains. Once deployed, this code cannot be changed - it's permanent. Events are like logs that get stored on the blockchain and can be queried later.
  
  - [ ]* 3.4 Write unit tests for smart contract
    - Create blockchain/test/BloodChain.test.js using Hardhat's testing framework
    - Test recordDonation() creates milestone and emits event
    - Test recordTransfer() creates milestone and emits event
    - Test recordUsage() creates milestone and emits event
    - Test getMilestones() returns correct milestone array
    - Run tests with: npx hardhat test
    - _Requirements: 14.1_
  
  - [x] 3.5 Deploy smart contract to Polygon Amoy testnet
    - Create blockchain/scripts/deploy.js deployment script
    - Deploy contract using: npx hardhat run scripts/deploy.js --network amoy
    - Save the deployed contract address (will be printed in console)
    - Add CONTRACT_ADDRESS to backend .env file
    - Verify deployment on Polygon Amoy explorer: https://amoy.polygonscan.com/
    - _Requirements: 14.1, 14.4, 20.5_
    - _What is this?_ Deploying means uploading your smart contract code to the blockchain. Once deployed, it gets a permanent address (like 0x1234...). Anyone can interact with it using this address. The blockchain explorer is like a search engine for blockchain data - you can see all transactions and contracts.

- [x] 4. Checkpoint - Verify blockchain setup
  - Ensure MetaMask is connected to Polygon Amoy
  - Verify you have test MATIC in your wallet (check on https://amoy.polygonscan.com/)
  - Confirm smart contract is deployed and visible on explorer
  - Test calling a smart contract function manually using Hardhat console
  - Ask the user if questions arise about blockchain concepts


- [x] 5. Backend Core - Authentication and Middleware
  - [x] 5.1 Set up Express server with basic configuration
    - Create backend/server.js with Express app initialization
    - Configure CORS middleware to allow frontend requests
    - Add express.json() middleware for parsing JSON request bodies
    - Add express-rate-limit middleware (100 requests per 15 minutes per IP)
    - Set up error handling middleware
    - Start server on PORT from environment variables
    - _Requirements: 17.1, 17.2, 17.5, 17.6, 20.2_
  
  - [x] 5.2 Implement authentication middleware
    - Create backend/middleware/auth.js for JWT token verification
    - Extract token from Authorization header (Bearer <token>)
    - Verify token using jsonwebtoken library and JWT_SECRET
    - Attach decoded user data to req.user
    - Return 401 error if token is invalid or expired
    - _Requirements: 1.5_
  
  - [x] 5.3 Implement role-based access control middleware
    - Create backend/middleware/roleCheck.js
    - Accept allowed roles as parameter (e.g., roleCheck(['Donor', 'Hospital']))
    - Verify req.user.role matches one of the allowed roles
    - Return 403 error if role is not authorized
    - _Requirements: 1.6_
  
  - [x] 5.4 Create authentication routes (register and login)
    - Create backend/routes/auth.js
    - Implement POST /api/auth/register endpoint
    - Hash password with bcrypt (10 salt rounds) before saving
    - Create user with role-specific fields (donor vs hospital)
    - Generate JWT token with 24-hour expiration
    - Implement POST /api/auth/login endpoint
    - Compare password with bcrypt.compare()
    - Return JWT token and user data (excluding password)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 5.5 Write unit tests for authentication
    - Test successful donor registration
    - Test successful hospital registration
    - Test login with valid credentials
    - Test login with invalid credentials
    - Test JWT token verification
    - Test role-based access control

- [x] 6. Blockchain Service Integration
  - [x] 6.1 Create blockchain service for smart contract interaction
    - Create backend/services/blockchainService.js
    - Initialize Ethers.js provider with BLOCKCHAIN_RPC_URL
    - Create wallet instance with PRIVATE_KEY
    - Load deployed contract using CONTRACT_ADDRESS and ABI
    - Implement recordDonationMilestone(bloodUnitID, metadata) function
    - Implement recordTransferMilestone(bloodUnitID, metadata) function
    - Implement recordUsageMilestone(bloodUnitID, metadata) function
    - Implement getMilestones(bloodUnitID) function
    - Add error handling for blockchain transaction failures
    - _Requirements: 14.3, 14.6, 4.5, 6.4, 7.3_
    - _What is this?_ Ethers.js is a JavaScript library that lets your backend talk to the blockchain. The provider connects to the blockchain network. The wallet signs transactions. The contract instance lets you call smart contract functions like regular JavaScript functions.
  
  - [x] 6.2 Implement blockchain retry queue mechanism
    - Create backend/services/retryService.js
    - Implement queueMilestone(bloodUnitID, milestoneType, metadata) to save failed milestones
    - Implement processRetryQueue() to attempt resubmission every 5 minutes
    - Update BloodUnit with transaction hash on successful retry
    - Remove from queue after successful submission
    - Send admin alert email after 24 hours of failures
    - Set up cron job or setInterval to run processRetryQueue() every 5 minutes
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_


- [x] 7. Donor Eligibility Validation Logic
  - [x] 7.1 Implement eligibility validation in User model
    - Enhance checkEligibility() method to check age (18-60 years)
    - Check weight (≥50 kg)
    - Check 56-day rule (lastDonationDate must be >56 days ago or null)
    - Return appropriate eligibility status string
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 7.2 Create donor profile endpoint with eligibility calculation
    - Create backend/routes/donor.js
    - Implement GET /api/donor/profile endpoint
    - Require authentication and donor role
    - Calculate eligibility status using checkEligibility()
    - Calculate days since last donation
    - Return donor profile with eligibility information
    - _Requirements: 3.5, 3.6_
  
  - [ ]* 7.3 Write unit tests for eligibility validation
    - Test age validation (under 18, 18-60, over 60)
    - Test weight validation (under 50kg, 50kg and above)
    - Test 56-day rule (within 56 days, exactly 56 days, over 56 days, null)
    - Test combined eligibility scenarios

- [x] 8. Blood Donation Recording with Blockchain
  - [x] 8.1 Implement blood donation endpoint
    - Add POST /api/hospital/donate to backend/routes/hospital.js
    - Require authentication and verified hospital role
    - Validate donor exists and is eligible (call checkEligibility())
    - Create BloodUnit with auto-generated bloodUnitID
    - Set status to "Collected", calculate expiryDate (collectionDate + 42 days)
    - Set originalHospitalID and currentHospitalID to requesting hospital
    - Save BloodUnit to MongoDB
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 8.2 Integrate blockchain milestone recording for donations
    - After saving BloodUnit, call blockchainService.recordDonationMilestone()
    - Pass bloodUnitID, donorID, hospitalID, bloodGroup, timestamp as metadata
    - If successful, update BloodUnit.donationTxHash with transaction hash
    - If blockchain fails, queue milestone in BlockchainRetry collection
    - Update donor's lastDonationDate to collectionDate
    - Return success response with BloodUnit and transaction hash
    - _Requirements: 4.5, 4.6, 4.7, 21.1_
  
  - [ ]* 8.3 Write integration tests for donation recording
    - Test successful donation with blockchain recording
    - Test donation with ineligible donor (should fail)
    - Test donation by unverified hospital (should fail)
    - Test blockchain failure triggers retry queue

- [x] 9. Blood Inventory Management
  - [x] 9.1 Implement hospital inventory endpoint
    - Add GET /api/hospital/inventory to backend/routes/hospital.js
    - Require authentication and verified hospital role
    - Query BloodUnit where currentHospitalID matches hospital and status != "Used"
    - Support filtering by bloodGroup query parameter
    - Support filtering by status query parameter
    - Calculate daysUntilExpiry for each unit
    - Return inventory with summary statistics (total, by blood group)
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [x] 9.2 Implement blood unit status update endpoint
    - Add PATCH /api/hospital/blood-unit/:bloodUnitID/status to backend/routes/hospital.js
    - Allow status change from "Collected" to "Stored" (no blockchain recording)
    - Verify hospital owns the blood unit (currentHospitalID matches)
    - Update status in MongoDB only
    - _Requirements: 5.4_


- [x] 10. Blood Transfer Between Hospitals
  - [x] 10.1 Implement blood transfer endpoint
    - Add POST /api/hospital/transfer to backend/routes/hospital.js
    - Require authentication and verified hospital role
    - Validate bloodUnitID exists and currentHospitalID matches requesting hospital
    - Validate destinationHospitalID exists and is a verified hospital
    - Check blood unit is not expired (call isExpired() method)
    - Update currentHospitalID to destinationHospitalID
    - Set status to "Transferred"
    - Append transfer record to transferHistory array
    - Save BloodUnit to MongoDB
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 22.1_
  
  - [x] 10.2 Integrate blockchain milestone recording for transfers
    - After saving transfer, call blockchainService.recordTransferMilestone()
    - Pass bloodUnitID, fromHospitalID, toHospitalID, timestamp as metadata
    - If successful, append transaction hash to BloodUnit.transferTxHashes array
    - If blockchain fails, queue milestone in BlockchainRetry collection
    - Return success response with updated BloodUnit and transaction hash
    - _Requirements: 6.4, 6.5, 21.1_
  
  - [ ]* 10.3 Write integration tests for blood transfer
    - Test successful transfer with blockchain recording
    - Test transfer of expired blood unit (should fail)
    - Test transfer by non-owner hospital (should fail)
    - Test transfer to unverified hospital (should fail)

- [x] 11. Blood Usage Recording
  - [x] 11.1 Implement blood usage endpoint
    - Add POST /api/hospital/use to backend/routes/hospital.js
    - Require authentication and verified hospital role
    - Validate bloodUnitID exists and currentHospitalID matches requesting hospital
    - Check blood unit is not expired (call isExpired() method)
    - Set status to "Used"
    - Record usageDate and patientID
    - Save BloodUnit to MongoDB
    - _Requirements: 7.1, 7.2, 7.5, 22.2_
  
  - [x] 11.2 Integrate blockchain milestone recording for usage
    - After saving usage, call blockchainService.recordUsageMilestone()
    - Pass bloodUnitID, hospitalID, patientID, timestamp as metadata
    - If successful, update BloodUnit.usageTxHash with transaction hash
    - If blockchain fails, queue milestone in BlockchainRetry collection
    - Return success response with updated BloodUnit and transaction hash
    - _Requirements: 7.3, 7.4, 21.1_
  
  - [ ]* 11.3 Write integration tests for blood usage
    - Test successful usage recording with blockchain
    - Test usage of expired blood unit (should fail)
    - Test usage by non-owner hospital (should fail)
    - Test used blood unit excluded from inventory queries

- [x] 12. Checkpoint - Test blood supply chain flow
  - Test complete flow: register donor → record donation → check inventory → transfer blood → record usage
  - Verify all three blockchain milestones are recorded on Polygon Amoy
  - Check blockchain explorer to see transaction history
  - Verify retry queue handles blockchain failures gracefully
  - Ask the user if questions arise


- [x] 13. AI Microservice - Setup and Foundation
  - [x] 13.1 Initialize Flask application
    - Create ai-service/ directory and Python virtual environment
    - Install dependencies: Flask, scikit-learn, pandas, numpy, joblib, python-dotenv, requests
    - Create ai-service/app.py with Flask app initialization
    - Configure CORS to allow backend requests
    - Set up error handling middleware
    - Create .env file with FLASK_PORT and BACKEND_API_URL
    - _Requirements: 20.3_
  
  - [x] 13.2 Create synthetic training data generator
    - Create ai-service/utils/data_generator.py
    - Generate synthetic historical blood usage data (simulate 6 months of data)
    - Include patterns: weekday vs weekend usage, seasonal trends, blood group distribution
    - Generate synthetic donor data with location, donation frequency, last donation date
    - Save generated data to CSV files for model training
    - _Requirements: 8.5_
    - _What is this?_ Since we don't have real hospital data, we create realistic fake data that mimics real-world patterns. This lets us train and test the AI models.
  
  - [x] 13.3 Implement demand prediction model
    - Create ai-service/models/demand_predictor.py
    - Use scikit-learn's LinearRegression or RandomForestRegressor
    - Train model on synthetic historical usage data
    - Implement predict_demand(blood_group, historical_data) function
    - Return 7-day forecast with confidence scores
    - Save trained model to ai-service/models/trained_models/
    - _Requirements: 8.1, 8.2, 8.5_
  
  - [x] 13.4 Create demand prediction API endpoint
    - Add POST /api/predict-demand to ai-service/app.py
    - Accept hospitalID, bloodGroup, and historicalData in request body
    - Load trained model and generate predictions
    - Calculate confidence score based on data quality
    - Return predictions array with 7-day forecast
    - Add error handling for missing or invalid data
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 14. AI Microservice - Donor Recommendations
  - [x] 14.1 Implement donor ranking algorithm
    - Create ai-service/models/donor_ranker.py
    - Calculate proximity score based on city/pincode matching
    - Calculate donation frequency score (prefer 2-4 donations per year)
    - Calculate time-since-last-donation score (prefer 60-90 days)
    - Combine scores into overall suitability score (weighted average)
    - Implement rank_donors(blood_group, location, eligible_donors) function
    - _Requirements: 15.1, 15.2, 15.4_
  
  - [x] 14.2 Create donor recommendation API endpoint
    - Add POST /api/recommend-donors to ai-service/app.py
    - Accept bloodGroup, location, and eligibleDonors in request body
    - Call donor ranking algorithm
    - Sort donors by suitability score (descending)
    - Return top 10 donors with scores and factor breakdown
    - _Requirements: 15.1, 15.2, 15.3_

- [x] 15. AI Microservice - Expiry Alerts
  - [x] 15.1 Implement expiry checking service
    - Create ai-service/services/alert_service.py
    - Implement check_expiry(blood_units) function
    - Identify units expiring within 7 days
    - Calculate priority based on days until expiry (1-3 days = high, 4-7 days = medium)
    - Return list of expiring units with priority levels
    - _Requirements: 9.2, 9.3_
  
  - [x] 15.2 Create expiry check API endpoint
    - Add POST /api/check-expiry to ai-service/app.py
    - Accept array of blood units in request body
    - Call expiry checking service
    - Return expiring units with priority and hospital information
    - _Requirements: 9.1, 9.2_
  
  - [x] 15.3 Add health check endpoint for AI service
    - Add GET /api/health to ai-service/app.py
    - Return service status, model availability, and response time
    - _Requirements: 24.4_


- [x] 16. Backend - AI Service Integration
  - [x] 16.1 Create AI service communication module
    - Create backend/services/aiService.js
    - Implement predictDemand(hospitalID, bloodGroup, historicalData) function using Axios
    - Implement recommendDonors(bloodGroup, location, eligibleDonors) function
    - Implement checkExpiry(bloodUnits) function
    - Add error handling and fallback responses when AI service is unavailable
    - _Requirements: 8.1, 8.4, 15.1_
  
  - [x] 16.2 Add demand prediction endpoint to hospital routes
    - Add GET /api/hospital/predict-demand/:bloodGroup to backend/routes/hospital.js
    - Require authentication and verified hospital role
    - Query historical usage data from BloodUnit collection
    - Call aiService.predictDemand() with historical data
    - Return prediction with confidence score and recommendation
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 16.3 Implement scheduled expiry alert job
    - Create backend/jobs/expiryAlerts.js
    - Query all BloodUnit records with status != "Used"
    - Call aiService.checkExpiry() with blood units
    - For each expiring unit, send email alert to currentHospitalID
    - Schedule job to run daily at 08:00 UTC using node-cron or setInterval
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 17. Emergency Request Handling
  - [x] 17.1 Implement emergency request creation endpoint
    - Add POST /api/hospital/emergency-request to backend/routes/hospital.js
    - Require authentication and verified hospital role
    - Create EmergencyRequest with bloodGroup, quantity, city, pincode, urgencyLevel
    - Set status to "Active" and record createdDate
    - Save EmergencyRequest to MongoDB
    - _Requirements: 10.1_
  
  - [x] 17.2 Implement location-based donor filtering
    - Query User collection for donors with matching bloodGroup
    - Filter by city OR pincode matching emergency request location
    - Check eligibility status (must be "Eligible")
    - Return list of eligible donors with contact information
    - _Requirements: 10.2, 11.1, 11.2, 11.3, 11.4_
  
  - [x] 17.3 Integrate AI donor recommendations for emergency requests
    - After filtering eligible donors, call aiService.recommendDonors()
    - Pass bloodGroup, location, and eligible donors list
    - Receive ranked donors with suitability scores
    - Select top 10 donors from ranked list
    - Store notifiedDonors array in EmergencyRequest
    - _Requirements: 10.3, 10.4_
  
  - [x] 17.4 Send notifications to recommended donors
    - For each of the top 10 donors, send email notification with emergency details
    - Include bloodGroup, quantity, hospital name, urgency level in email
    - Optionally send SMS notifications (if SMS service configured)
    - Return success response with number of notified donors
    - _Requirements: 10.5, 19.3_
  
  - [x] 17.5 Implement emergency request fulfillment endpoint
    - Add PATCH /api/hospital/emergency-request/:requestID/fulfill to backend/routes/hospital.js
    - Require authentication and verified hospital role
    - Update EmergencyRequest status to "Fulfilled"
    - Record fulfillmentDate
    - _Requirements: 10.6_


- [x] 18. Email Notification System
  - [x] 18.1 Set up Nodemailer email service
    - Create backend/services/emailService.js
    - Configure Nodemailer with SMTP settings (Gmail or other provider)
    - Create email templates for different notification types
    - Implement sendEmail(to, subject, htmlContent) function
    - Add error handling and logging for email failures
    - _Requirements: 19.5_
  
  - [x] 18.2 Implement hospital verification emails
    - Create email template for hospital verification approval
    - Create email template for hospital rejection
    - Send verification email when admin approves hospital
    - Send rejection email when admin rejects hospital
    - _Requirements: 19.1, 19.2_
  
  - [x] 18.3 Implement emergency request notification emails
    - Create email template for emergency blood request
    - Include hospital name, blood group, quantity, urgency level, contact information
    - Send to top 10 recommended donors
    - _Requirements: 19.3_
  
  - [x] 18.4 Implement expiry alert emails
    - Create email template for blood unit expiry alerts
    - Include bloodUnitID, blood group, days until expiry, priority level
    - Send to hospital's registered email address
    - _Requirements: 19.4_

- [x] 19. Donation Certificate Generation
  - [x] 19.1 Set up PDFKit and QR code generation
    - Install pdfkit and qrcode npm packages
    - Create backend/services/certificateService.js
    - Implement QR code generation with bloodUnitID and transaction hash
    - _Requirements: 12.6_
  
  - [x] 19.2 Implement certificate generation logic
    - Create generateCertificate(bloodUnitID, donorID) function
    - Query BloodUnit and User (donor) data from MongoDB
    - Verify donor owns the blood unit
    - Create PDF with donor name, blood group, donation date, hospital name
    - Include bloodUnitID and blockchain transaction hash
    - Embed QR code containing verification data
    - Return PDF buffer for download
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [x] 19.3 Create certificate download endpoint
    - Add GET /api/donor/certificate/:bloodUnitID to backend/routes/donor.js
    - Require authentication and donor role
    - Call certificateService.generateCertificate()
    - Set response headers for PDF download
    - Stream PDF to response
    - Return 403 error if donor doesn't own the blood unit
    - _Requirements: 12.1, 12.4, 12.5_

- [x] 20. Donor Endpoints
  - [x] 20.1 Implement donor donation history endpoint
    - Add GET /api/donor/donations to backend/routes/donor.js
    - Require authentication and donor role
    - Query BloodUnit collection where donorID matches authenticated user
    - Populate hospital information
    - Return array of donations with status and blockchain transaction hashes
    - _Requirements: 1.6_


- [x] 21. Admin Panel Endpoints
  - [x] 21.1 Implement pending hospitals listing endpoint
    - Create backend/routes/admin.js
    - Add GET /api/admin/pending-hospitals endpoint
    - Require authentication and admin role
    - Query User collection where role="Hospital" and isVerified=false
    - Return array of pending hospitals with registration details
    - _Requirements: 2.1_
  
  - [x] 21.2 Implement hospital verification endpoint
    - Add POST /api/admin/verify-hospital/:hospitalID to backend/routes/admin.js
    - Require authentication and admin role
    - Update hospital's isVerified field to true
    - Send verification confirmation email to hospital
    - Return success response with updated hospital data
    - _Requirements: 2.2, 19.1_
  
  - [x] 21.3 Implement hospital rejection endpoint
    - Add DELETE /api/admin/reject-hospital/:hospitalID to backend/routes/admin.js
    - Require authentication and admin role
    - Send rejection notification email to hospital
    - Delete hospital account from database
    - Return success response
    - _Requirements: 2.3, 19.2_
  
  - [x] 21.4 Implement system statistics endpoint
    - Add GET /api/admin/statistics to backend/routes/admin.js
    - Require authentication and admin role
    - Count total donors, hospitals, blood units, active emergency requests
    - Aggregate blood units by status
    - Return comprehensive system statistics
    - _Requirements: 18.3_
  
  - [x] 21.5 Verify unverified hospital restrictions
    - Ensure unverified hospitals cannot create blood units
    - Add isVerified check in POST /api/hospital/donate endpoint
    - Return 403 error with message "Hospital not verified" if isVerified=false
    - _Requirements: 2.4_

- [x] 22. Blockchain Verification Endpoints
  - [x] 22.1 Implement blockchain data parser
    - Create backend/utils/blockchainParser.js
    - Implement parseMilestone(rawData) function to convert blockchain data to structured objects
    - Implement formatTimestamp(unixTimestamp) to human-readable date (YYYY-MM-DD HH:MM:SS UTC)
    - Implement formatAddress(walletAddress) to shortened format (0x1234...5678)
    - Add validation for required fields in milestone data
    - _Requirements: 23.1, 23.2, 23.3, 23.5_
  
  - [x] 22.2 Implement milestone retrieval endpoint
    - Add GET /api/blockchain/milestones/:bloodUnitID to backend/routes/blockchain.js
    - Call blockchainService.getMilestones(bloodUnitID)
    - Parse and format milestone data using blockchainParser
    - Verify milestone timestamps are chronologically ordered (Donation < Transfer < Usage)
    - Return array of formatted milestones
    - _Requirements: 13.1, 13.2, 13.4_
  
  - [x] 22.3 Implement transaction verification endpoint
    - Add GET /api/blockchain/verify/:txHash to backend/routes/blockchain.js
    - Query blockchain for transaction details using Ethers.js
    - Parse transaction data and decode event logs
    - Return transaction details with confirmation status
    - _Requirements: 13.3_


- [x] 23. System Health Monitoring
  - [x] 23.1 Implement comprehensive health check endpoint
    - Add GET /api/health to backend/server.js
    - Check MongoDB connectivity (ping database)
    - Check blockchain RPC connectivity (get latest block number)
    - Check AI microservice connectivity (call health endpoint)
    - Measure response time for each component
    - Calculate system uptime
    - Return HTTP 200 if all components healthy, HTTP 503 if any component fails
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6_

- [x] 24. Checkpoint - Backend API Complete
  - Test all API endpoints using Postman or similar tool
  - Verify authentication and authorization work correctly
  - Test blockchain integration with real transactions on Polygon Amoy
  - Verify email notifications are sent successfully
  - Test AI service integration and predictions
  - Ensure health check endpoint reports accurate status
  - Ask the user if questions arise
  - Test AI service integration and predictions
  - Ensure health check endpoint reports accurate status
  - Ask the user if questions arise

- [x] 25. Frontend - Project Setup and Authentication
  - [x] 25.1 Initialize React project with Vite
    - Create frontend/ directory
    - Run npm create vite@latest and select React template
    - Install dependencies: react-router-dom, axios, tailwindcss
    - Configure Tailwind CSS (npx tailwindcss init)
    - Create .env file with VITE_API_URL pointing to backend
    - _Requirements: 20.1_
  
  - [x] 25.2 Set up Axios API client
    - Create frontend/src/services/api.js
    - Configure Axios instance with base URL from environment
    - Add request interceptor to attach JWT token from localStorage
    - Add response interceptor to handle 401 errors (redirect to login)
    - Export API methods for all backend endpoints
    - _Requirements: 18.5_
  
  - [x] 25.3 Create authentication context
    - Create frontend/src/context/AuthContext.jsx
    - Implement login(email, password) function
    - Implement register(userData) function
    - Implement logout() function
    - Store JWT token in localStorage
    - Store user data in context state
    - Provide authentication state to entire app
    - _Requirements: 18.6_
  
  - [x] 25.4 Create login and registration pages
    - Create frontend/src/pages/Login.jsx with email/password form
    - Create frontend/src/pages/Register.jsx with role selection and role-specific fields
    - Add form validation (required fields, email format, password strength)
    - Call authentication context methods on form submission
    - Redirect to appropriate dashboard after successful login
    - Display error messages for failed authentication
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 25.5 Create protected route component
    - Create frontend/src/components/ProtectedRoute.jsx
    - Check if user is authenticated (token exists in localStorage)
    - Optionally check user role matches required role
    - Redirect to login page if not authenticated
    - Render child components if authenticated
    - _Requirements: 1.6_
  
  - [x] 25.6 Set up routing with React Router
    - Configure routes in frontend/src/App.jsx
    - Add public routes: /login, /register
    - Add protected routes: /donor/dashboard, /hospital/dashboard, /admin/panel
    - Implement role-based route protection
    - _Requirements: 18.1, 18.2, 18.3_


- [x] 26. Frontend - Donor Dashboard
  - [x] 26.1 Create donor dashboard layout
    - Create frontend/src/pages/DonorDashboard.jsx
    - Add navigation bar with logout button
    - Create sections for: profile, eligibility status, donation history, certificates
    - Use Tailwind CSS for responsive layout
    - _Requirements: 18.1, 18.4_
  
  - [x] 26.2 Implement donor profile display
    - Fetch donor profile from GET /api/donor/profile
    - Display name, email, blood group, age, weight, city, pincode
    - Display eligibility status with color coding (green=Eligible, red=Ineligible)
    - Show days since last donation
    - Show next eligible donation date if currently ineligible
    - _Requirements: 18.1_
  
  - [x] 26.3 Implement donation history display
    - Fetch donation history from GET /api/donor/donations
    - Display table with: donation date, blood group, hospital, status, blockchain link
    - Add link to view transaction on Polygon Amoy explorer
    - Sort by donation date (most recent first)
    - _Requirements: 18.1_
  
  - [x] 26.4 Implement certificate download functionality
    - Add "Download Certificate" button for each donation
    - Call GET /api/donor/certificate/:bloodUnitID
    - Trigger browser download of PDF file
    - Show loading state during generation
    - Display error message if certificate generation fails
    - _Requirements: 18.1, 12.1_

- [x] 27. Frontend - Hospital Dashboard
  - [x] 27.1 Create hospital dashboard layout
    - Create frontend/src/pages/HospitalDashboard.jsx
    - Add navigation tabs: Inventory, Record Donation, Transfer Blood, Record Usage, Emergency Requests, Demand Prediction
    - Use Tailwind CSS for responsive layout
    - _Requirements: 18.2, 18.4_
  
  - [x] 27.2 Implement blood inventory display
    - Fetch inventory from GET /api/hospital/inventory
    - Display table with: bloodUnitID, blood group, collection date, expiry date, days until expiry, status
    - Add color coding for expiry urgency (red <3 days, yellow 3-7 days, green >7 days)
    - Add filters for blood group and status
    - Display summary statistics (total units, breakdown by blood group)
    - _Requirements: 18.2, 5.1, 5.2, 5.3_
  
  - [x] 27.3 Implement blood donation recording form
    - Create form with fields: donor email/ID, blood group, collection date
    - Add donor search functionality to find donor by email
    - Display donor eligibility status before submission
    - Call POST /api/hospital/donate on form submission
    - Show success message with blockchain transaction hash
    - Display error if donor is ineligible or hospital is unverified
    - _Requirements: 18.2, 4.1_
  
  - [x] 27.4 Implement blood transfer form
    - Create form with fields: bloodUnitID (dropdown from inventory), destination hospital (dropdown)
    - Fetch list of verified hospitals for destination dropdown
    - Call POST /api/hospital/transfer on form submission
    - Show success message with blockchain transaction hash
    - Update inventory display after successful transfer
    - _Requirements: 18.2, 6.1_
  
  - [x] 27.5 Implement blood usage recording form
    - Create form with fields: bloodUnitID (dropdown from inventory), patientID
    - Call POST /api/hospital/use on form submission
    - Show success message with blockchain transaction hash
    - Update inventory display after successful usage recording
    - _Requirements: 18.2, 7.1_
  
  - [x] 27.6 Implement emergency request creation form
    - Create form with fields: blood group, quantity, city, pincode, urgency level, notes
    - Call POST /api/hospital/emergency-request on form submission
    - Display number of donors notified
    - Show list of active emergency requests with fulfillment option
    - _Requirements: 18.2, 10.1_
  
  - [x] 27.7 Implement demand prediction display
    - Add blood group selector
    - Call GET /api/hospital/predict-demand/:bloodGroup
    - Display 7-day forecast as chart or table
    - Show confidence score and recommendation
    - Handle AI service unavailability gracefully
    - _Requirements: 18.2, 8.1_


- [x] 28. Frontend - Admin Panel
  - [x] 28.1 Create admin panel layout
    - Create frontend/src/pages/AdminPanel.jsx
    - Add navigation tabs: Pending Hospitals, System Statistics
    - Use Tailwind CSS for responsive layout
    - _Requirements: 18.3, 18.4_
  
  - [x] 28.2 Implement pending hospitals display
    - Fetch pending hospitals from GET /api/admin/pending-hospitals
    - Display table with: hospital name, email, city, pincode, wallet address, registration date
    - Add "Approve" and "Reject" buttons for each hospital
    - Call POST /api/admin/verify-hospital/:hospitalID on approve
    - Call DELETE /api/admin/reject-hospital/:hospitalID on reject
    - Show confirmation dialog before rejection
    - Update list after approval/rejection
    - _Requirements: 18.3, 2.1, 2.2, 2.3_
  
  - [x] 28.3 Implement system statistics display
    - Fetch statistics from GET /api/admin/statistics
    - Display cards with: total donors, total hospitals, total blood units, active emergency requests
    - Display pie chart or bar chart for blood units by status
    - Display breakdown of blood units by blood group
    - Auto-refresh statistics every 30 seconds
    - _Requirements: 18.3_

- [x] 29. Frontend - Shared Components and Polish
  - [x] 29.1 Create reusable UI components
    - Create Button component with loading state
    - Create Input component with validation styling
    - Create Card component for consistent layout
    - Create Table component with sorting and filtering
    - Create Modal component for confirmations
    - _Requirements: 18.4_
  
  - [x] 29.2 Create navigation bar component
    - Create frontend/src/components/Navbar.jsx
    - Display user name and role
    - Add logout button
    - Show different navigation links based on user role
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [x] 29.3 Add loading states and error handling
    - Show loading spinners during API calls
    - Display error messages for failed requests
    - Add toast notifications for success/error messages
    - Implement retry logic for failed requests
    - _Requirements: 18.4_
  
  - [x] 29.4 Implement responsive design
    - Ensure all pages work on mobile, tablet, and desktop
    - Use Tailwind CSS responsive utilities
    - Test on different screen sizes
    - _Requirements: 18.4_

- [x] 30. Checkpoint - Frontend Complete
  - Test all user flows: registration, login, donation recording, transfers, usage, emergency requests
  - Verify role-based access control works correctly
  - Test responsive design on different devices
  - Verify blockchain transaction links work
  - Test certificate downloads
  - Ask the user if questions arise


- [ ] 31. Testing and Quality Assurance
  - [ ]* 31.1 Write backend integration tests
    - Test complete blood supply chain flow (donation → transfer → usage)
    - Test authentication and authorization
    - Test blockchain integration with mock provider
    - Test email sending with mock SMTP server
    - Test AI service integration with mock responses
  
  - [ ]* 31.2 Write frontend component tests
    - Test authentication flows (login, register, logout)
    - Test form validation and submission
    - Test protected routes and role-based access
    - Test API error handling
  
  - [x]* 31.3 Perform manual end-to-end testing
    - Create test accounts for donor, hospital, and admin roles
    - Test complete user journeys for each role
    - Verify blockchain transactions on Polygon Amoy explorer
    - Test email notifications are received
    - Test certificate generation and QR code scanning
  
  - [ ]* 31.4 Test blockchain retry queue
    - Simulate blockchain network failure
    - Verify milestones are queued for retry
    - Verify successful retry updates blood unit records
    - Verify admin alert after 24 hours of failures

- [ ] 32. Deployment Preparation
  - [ ] 32.1 Create environment variable templates
    - Create backend/.env.example with all required variables
    - Create blockchain/.env.example with wallet setup instructions
    - Create ai-service/.env.example with configuration
    - Create frontend/.env.example with API URL
    - Document how to obtain each environment variable value
    - _Requirements: 20.6_
  
  - [ ] 32.2 Create deployment documentation
    - Write step-by-step guide for MongoDB Atlas setup
    - Write guide for MetaMask wallet creation and test MATIC acquisition
    - Write guide for smart contract deployment
    - Document backend deployment to Render
    - Document AI service deployment to Render
    - Document frontend deployment to Vercel
    - Include troubleshooting section for common issues
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_
  
  - [ ] 32.3 Prepare production configurations
    - Update CORS settings for production frontend URL
    - Configure rate limiting for production traffic
    - Set up production email service (Gmail app password or SendGrid)
    - Verify all environment variables are set correctly
    - Test health check endpoints
    - _Requirements: 17.5, 17.6_


- [ ] 33. Deploy to Production
  - [ ] 33.1 Deploy MongoDB Atlas database
    - Create MongoDB Atlas account (free tier)
    - Create new cluster (M0 free tier)
    - Create database user with password
    - Whitelist IP addresses (0.0.0.0/0 for development, specific IPs for production)
    - Get connection string and add to backend .env
    - _Requirements: 20.4_
    - _What is this?_ MongoDB Atlas is a cloud database service. The free tier (M0) provides 512MB storage, perfect for development and small projects. The connection string is like a URL that tells your backend how to connect to the database.
  
  - [ ] 33.2 Deploy smart contract to Polygon Amoy (if not already done)
    - Ensure you have test MATIC in your wallet
    - Run deployment script: npx hardhat run scripts/deploy.js --network amoy
    - Save contract address to backend .env
    - Verify contract on Polygon Amoy explorer
    - _Requirements: 20.5_
  
  - [ ] 33.3 Deploy backend to Render
    - Create Render account (free tier)
    - Create new Web Service and connect to Git repository
    - Set build command: npm install
    - Set start command: node server.js
    - Add all environment variables from .env.example
    - Deploy and verify health check endpoint
    - _Requirements: 20.2_
    - _What is this?_ Render is a cloud hosting platform with a free tier. It automatically deploys your code from Git and keeps it running 24/7 (with some limitations on the free tier - it may sleep after inactivity).
  
  - [ ] 33.4 Deploy AI microservice to Render
    - Create new Web Service on Render for AI service
    - Set build command: pip install -r requirements.txt
    - Set start command: python app.py
    - Add environment variables
    - Update backend .env with AI service URL
    - Deploy and verify health check endpoint
    - _Requirements: 20.3_
  
  - [ ] 33.5 Deploy frontend to Vercel
    - Create Vercel account (free tier)
    - Import Git repository
    - Set framework preset to Vite
    - Add VITE_API_URL environment variable pointing to Render backend URL
    - Deploy and verify application loads
    - _Requirements: 20.1_
    - _What is this?_ Vercel is a hosting platform optimized for frontend applications. It provides free hosting with automatic deployments from Git, global CDN, and HTTPS.
  
  - [ ] 33.6 Update CORS and production settings
    - Update backend CORS configuration to allow Vercel frontend URL
    - Update frontend API URL to point to Render backend
    - Test cross-origin requests work correctly
    - Verify HTTPS is enabled on all services
    - _Requirements: 17.5, 17.6_

- [ ] 34. Final Testing and Verification
  - [ ] 34.1 Test complete system in production
    - Register test donor, hospital, and admin accounts
    - Test donor registration and eligibility checking
    - Test hospital verification by admin
    - Test blood donation recording with blockchain verification
    - Test blood transfer between hospitals
    - Test blood usage recording
    - Test emergency request creation and donor notifications
    - Test certificate generation and download
    - Verify all blockchain transactions on Polygon Amoy explorer
    - _Requirements: All requirements_
  
  - [ ] 34.2 Verify email notifications
    - Test hospital verification emails
    - Test emergency request notifications
    - Test expiry alert emails
    - Verify email formatting and content
    - _Requirements: 19.1, 19.2, 19.3, 19.4_
  
  - [ ] 34.3 Test AI service functionality
    - Test demand prediction with various blood groups
    - Test donor recommendations for emergency requests
    - Verify expiry alerts are generated correctly
    - Test AI service fallback when unavailable
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 15.1, 15.2, 15.3, 9.1, 9.2_
  
  - [ ] 34.4 Performance and security verification
    - Test API rate limiting (should block after 100 requests in 15 minutes)
    - Verify JWT token expiration (should expire after 24 hours)
    - Test input validation and error handling
    - Check for exposed sensitive data in responses
    - Verify HTTPS is enforced
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 35. Final Checkpoint - System Complete
  - Verify all 24 requirements are implemented and tested
  - Confirm all three blockchain milestones (Donation, Transfer, Usage) are recorded correctly
  - Verify hybrid storage strategy (MongoDB + Blockchain) is working as designed
  - Test complete blood supply chain flow from donation to usage
  - Ensure all free-tier services are properly configured
  - Document any known limitations or future improvements
  - Celebrate successful implementation! 🎉

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Blockchain tasks include detailed "What is this?" explanations for educational purposes
- Checkpoints ensure incremental validation and provide opportunities to ask questions
- The implementation follows a logical dependency order: setup → database → blockchain → backend → AI → frontend → deployment
- All services use free tiers: MongoDB Atlas (M0), Render (free), Vercel (free), Polygon Amoy (testnet)
- Test MATIC is completely free and has no real-world value
- The hybrid storage strategy (MongoDB + Blockchain) balances transparency with performance
- Only three critical milestones are recorded on blockchain to minimize gas costs and latency

## Blockchain Learning Resources

If you want to learn more about blockchain concepts while implementing:

1. **MetaMask Basics**: https://metamask.io/faqs/
2. **Polygon Amoy Testnet**: https://docs.polygon.technology/tools/faucets/
3. **Hardhat Documentation**: https://hardhat.org/getting-started/
4. **Solidity by Example**: https://solidity-by-example.org/
5. **Ethers.js Documentation**: https://docs.ethers.org/v6/
6. **Polygon Amoy Explorer**: https://amoy.polygonscan.com/

## Troubleshooting Common Issues

**Blockchain Issues:**
- "Insufficient funds": Get more test MATIC from faucet
- "Transaction failed": Check gas limit and network connectivity
- "Contract not deployed": Verify contract address in .env matches deployed address

**Backend Issues:**
- "MongoDB connection failed": Check connection string and IP whitelist
- "JWT token invalid": Verify JWT_SECRET matches between requests
- "Email not sending": Check SMTP credentials and app-specific password

**Frontend Issues:**
- "CORS error": Verify backend CORS configuration includes frontend URL
- "API request failed": Check VITE_API_URL points to correct backend URL
- "Protected route not working": Verify JWT token is stored in localStorage

**Deployment Issues:**
- "Render service sleeping": Free tier sleeps after inactivity, first request may be slow
- "Vercel build failed": Check environment variables are set correctly
- "MongoDB Atlas connection timeout": Verify IP whitelist includes Render's IP ranges
