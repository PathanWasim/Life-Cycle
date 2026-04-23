# Requirements Document

## Introduction

LifeChain is an intelligent blood supply management system that combines traditional database operations with selective blockchain verification to ensure transparency, medical compliance, and efficient blood distribution. The system enforces medical regulations (56-day donation intervals), reduces wastage through AI-powered predictions, improves emergency response with location-based donor matching, and maintains an immutable audit trail for three critical milestones: donation, transfer, and usage.

## Glossary

- **LifeChain_System**: The complete blood supply management platform including frontend, backend API, database, blockchain layer, and AI microservice
- **Donor**: A registered user who donates blood and has eligibility tracked by the system
- **Hospital**: A verified healthcare facility that collects, stores, transfers, and uses blood units
- **Admin**: A system administrator who verifies hospitals and monitors system operations
- **Blood_Unit**: A single unit of donated blood with unique identifier, blood group, collection date, expiry date, and status
- **Blockchain_Milestone**: One of three immutable records stored on Polygon Amoy testnet (Donation, Transfer, Usage)
- **Eligibility_Status**: A computed status indicating whether a donor can donate based on 56-day rule and health criteria
- **Transfer_History**: A chronological record of blood unit movements between hospitals
- **Emergency_Request**: A time-sensitive request for blood with location-based donor filtering
- **Donation_Certificate**: A verifiable PDF document with QR code proving donation authenticity
- **AI_Microservice**: An independent Flask service providing demand prediction, donor recommendations, and expiry alerts
- **Wallet_Address**: An Ethereum-compatible blockchain address for recording milestones
- **56_Day_Rule**: Medical regulation requiring minimum 56 days between blood donations

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a donor or hospital, I want to register and authenticate securely, so that I can access role-appropriate features

#### Acceptance Criteria

1. WHEN a donor registers with name, email, password, blood group, date of birth, weight, city, pincode, and wallet address, THE LifeChain_System SHALL create a donor account with role "Donor"
2. WHEN a hospital registers with hospital name, email, password, city, pincode, and wallet address, THE LifeChain_System SHALL create an unverified hospital account with role "Hospital"
3. WHEN a user provides valid email and password credentials, THE LifeChain_System SHALL return a JWT token valid for 24 hours
4. THE LifeChain_System SHALL hash all passwords using bcrypt before storage
5. WHEN an authentication token is provided with a protected request, THE LifeChain_System SHALL verify the token signature and expiration before granting access
6. THE LifeChain_System SHALL enforce role-based access control where donors access donor endpoints, hospitals access hospital endpoints, and admins access admin endpoints

### Requirement 2: Hospital Verification

**User Story:** As an admin, I want to verify hospital registrations, so that only legitimate healthcare facilities can collect and manage blood

#### Acceptance Criteria

1. WHEN an admin views pending hospitals, THE LifeChain_System SHALL return all hospitals where isVerified equals false
2. WHEN an admin approves a hospital, THE LifeChain_System SHALL set isVerified to true and send a confirmation email to the hospital
3. WHEN an admin rejects a hospital, THE LifeChain_System SHALL delete the hospital account and send a rejection email
4. WHEN an unverified hospital attempts to create a blood unit, THE LifeChain_System SHALL return an authorization error

### Requirement 3: Donor Eligibility Validation

**User Story:** As a donor, I want my eligibility to be automatically validated, so that I comply with medical safety regulations

#### Acceptance Criteria

1. WHEN a donor's age is less than 18 years or greater than 60 years, THE LifeChain_System SHALL set eligibilityStatus to "Ineligible - Age"
2. WHEN a donor's weight is less than 50 kilograms, THE LifeChain_System SHALL set eligibilityStatus to "Ineligible - Weight"
3. WHEN a donor's lastDonationDate is within 56 days of the current date, THE LifeChain_System SHALL set eligibilityStatus to "Ineligible - 56 Day Rule"
4. WHEN a donor meets all criteria (age 18-60, weight ≥50kg, last donation >56 days ago or null), THE LifeChain_System SHALL set eligibilityStatus to "Eligible"
5. WHEN a donor attempts to donate blood, THE LifeChain_System SHALL validate eligibility before proceeding
6. THE LifeChain_System SHALL recalculate eligibilityStatus whenever donor profile is accessed or updated

### Requirement 4: Blood Donation Recording

**User Story:** As a hospital, I want to record blood donations with blockchain verification, so that donations are permanently documented

#### Acceptance Criteria

1. WHEN a verified hospital records a donation with donorID, bloodGroup, and collectionDate, THE LifeChain_System SHALL create a Blood_Unit with status "Collected"
2. THE LifeChain_System SHALL generate a unique bloodUnitID for each donation
3. THE LifeChain_System SHALL calculate expiryDate as collectionDate plus 42 days
4. THE LifeChain_System SHALL set originalHospitalID and currentHospitalID to the collecting hospital's ID
5. WHEN a Blood_Unit is created, THE LifeChain_System SHALL record a Blockchain_Milestone with event type "Donation", bloodUnitID, donorID, hospitalID, timestamp, and blood group on Polygon Amoy testnet
6. WHEN a donation is recorded, THE LifeChain_System SHALL update the donor's lastDonationDate to the collectionDate
7. IF blockchain recording fails, THEN THE LifeChain_System SHALL log the error, store the Blood_Unit in MongoDB, and queue the milestone for retry

### Requirement 5: Blood Unit Storage and Tracking

**User Story:** As a hospital, I want to track blood units in my inventory, so that I can manage supply effectively

#### Acceptance Criteria

1. WHEN a hospital requests its inventory, THE LifeChain_System SHALL return all Blood_Unit records where currentHospitalID matches the hospital's ID and status is not "Used"
2. THE LifeChain_System SHALL support filtering inventory by blood group
3. THE LifeChain_System SHALL support filtering inventory by status (Collected, Stored, Transferred)
4. WHEN a Blood_Unit status changes from "Collected" to "Stored", THE LifeChain_System SHALL update the status in MongoDB without blockchain recording
5. THE LifeChain_System SHALL include expiryDate and days remaining until expiry in inventory responses

### Requirement 6: Blood Transfer Between Hospitals

**User Story:** As a hospital, I want to transfer blood units to other hospitals, so that blood reaches where it's needed

#### Acceptance Criteria

1. WHEN a hospital initiates a transfer with bloodUnitID and destinationHospitalID, THE LifeChain_System SHALL verify the blood unit exists and currentHospitalID matches the requesting hospital
2. WHEN a transfer is valid, THE LifeChain_System SHALL update currentHospitalID to destinationHospitalID and set status to "Transferred"
3. THE LifeChain_System SHALL append a transfer record to transferHistory containing fromHospitalID, toHospitalID, transferDate, and transferredBy
4. WHEN a transfer is completed, THE LifeChain_System SHALL record a Blockchain_Milestone with event type "Transfer", bloodUnitID, fromHospitalID, toHospitalID, and timestamp on Polygon Amoy testnet
5. IF blockchain recording fails, THEN THE LifeChain_System SHALL log the error, complete the transfer in MongoDB, and queue the milestone for retry
6. WHEN a hospital attempts to transfer an expired Blood_Unit, THE LifeChain_System SHALL return a validation error

### Requirement 7: Blood Usage Recording

**User Story:** As a hospital, I want to record when blood is used for a patient, so that the supply chain is complete and auditable

#### Acceptance Criteria

1. WHEN a hospital records usage with bloodUnitID and patientID, THE LifeChain_System SHALL verify the blood unit exists and currentHospitalID matches the requesting hospital
2. WHEN usage is valid, THE LifeChain_System SHALL set status to "Used" and record usageDate
3. WHEN usage is recorded, THE LifeChain_System SHALL record a Blockchain_Milestone with event type "Usage", bloodUnitID, hospitalID, patientID, and timestamp on Polygon Amoy testnet
4. IF blockchain recording fails, THEN THE LifeChain_System SHALL log the error, complete the usage in MongoDB, and queue the milestone for retry
5. WHEN a Blood_Unit status is "Used", THE LifeChain_System SHALL exclude it from inventory queries

### Requirement 8: AI Demand Prediction

**User Story:** As a hospital, I want AI-powered demand predictions, so that I can maintain optimal blood inventory levels

#### Acceptance Criteria

1. WHEN a hospital requests demand prediction for a blood group, THE LifeChain_System SHALL send historical usage data to the AI_Microservice via HTTP POST
2. THE AI_Microservice SHALL analyze usage patterns and return predicted demand for the next 7 days
3. THE LifeChain_System SHALL return the prediction with confidence score to the requesting hospital
4. IF the AI_Microservice is unavailable, THEN THE LifeChain_System SHALL return a fallback response indicating prediction service is temporarily unavailable
5. THE AI_Microservice SHALL use scikit-learn models trained on historical usage data

### Requirement 9: AI Expiry Alerts

**User Story:** As a hospital, I want automated expiry alerts, so that blood units are used before they expire

#### Acceptance Criteria

1. WHEN the AI_Microservice runs its scheduled check, THE LifeChain_System SHALL provide all Blood_Unit records with status not "Used"
2. THE AI_Microservice SHALL identify blood units expiring within 7 days
3. WHEN expiring units are identified, THE LifeChain_System SHALL send email alerts to the currentHospitalID with bloodUnitID, blood group, and days until expiry
4. THE LifeChain_System SHALL run expiry checks daily at 08:00 UTC

### Requirement 10: Emergency Blood Request Handling

**User Story:** As a hospital, I want to create emergency blood requests with location-based donor matching, so that critical needs are met quickly

#### Acceptance Criteria

1. WHEN a hospital creates an emergency request with blood group, quantity, city, and pincode, THE LifeChain_System SHALL create an Emergency_Request with status "Active"
2. WHEN an emergency request is created, THE LifeChain_System SHALL query eligible donors matching the blood group and location (city or pincode)
3. THE LifeChain_System SHALL send the AI_Microservice the list of eligible donors and request recommendations based on proximity and donation history
4. THE AI_Microservice SHALL rank donors by suitability score
5. THE LifeChain_System SHALL send SMS and email notifications to the top 10 recommended donors with emergency request details
6. WHEN a hospital marks an emergency request as fulfilled, THE LifeChain_System SHALL set status to "Fulfilled" and record fulfillmentDate

### Requirement 11: Location-Based Donor Filtering

**User Story:** As a hospital, I want to find donors by location, so that I can request donations from nearby donors

#### Acceptance Criteria

1. WHEN a hospital searches donors by city, THE LifeChain_System SHALL return all eligible donors where city matches the search term
2. WHEN a hospital searches donors by pincode, THE LifeChain_System SHALL return all eligible donors where pincode matches the search term
3. THE LifeChain_System SHALL support combined filtering by blood group and location
4. THE LifeChain_System SHALL exclude ineligible donors from location-based search results

### Requirement 12: Donation Certificate Generation

**User Story:** As a donor, I want to download a verifiable donation certificate, so that I have proof of my donation

#### Acceptance Criteria

1. WHEN a donor requests a certificate for a bloodUnitID, THE LifeChain_System SHALL verify the donor owns the donation
2. THE LifeChain_System SHALL generate a PDF certificate containing donor name, blood group, donation date, hospital name, bloodUnitID, and blockchain transaction hash
3. THE LifeChain_System SHALL embed a QR code in the certificate containing bloodUnitID and blockchain transaction hash for verification
4. THE LifeChain_System SHALL generate certificates on-demand, not pre-generate them
5. WHEN a certificate is requested for a non-existent or unauthorized bloodUnitID, THE LifeChain_System SHALL return an authorization error
6. THE LifeChain_System SHALL use PDFKit for certificate generation

### Requirement 13: Blockchain Milestone Verification

**User Story:** As a stakeholder, I want to verify blockchain milestones, so that I can confirm the authenticity of blood supply chain records

#### Acceptance Criteria

1. WHEN a user provides a bloodUnitID, THE LifeChain_System SHALL retrieve all Blockchain_Milestone records for that blood unit from Polygon Amoy testnet
2. THE LifeChain_System SHALL return milestone details including event type, timestamp, transaction hash, and involved parties
3. WHEN a user provides a transaction hash, THE LifeChain_System SHALL query the blockchain and return the complete milestone data
4. THE LifeChain_System SHALL verify that milestone timestamps are chronologically ordered (Donation < Transfer < Usage)

### Requirement 14: Smart Contract Deployment and Interaction

**User Story:** As a system administrator, I want to deploy and interact with blockchain smart contracts, so that milestones are recorded immutably

#### Acceptance Criteria

1. THE LifeChain_System SHALL deploy a Solidity smart contract to Polygon Amoy testnet with functions for recording donation, transfer, and usage milestones
2. THE LifeChain_System SHALL use Hardhat for smart contract compilation, testing, and deployment
3. WHEN recording a milestone, THE LifeChain_System SHALL call the appropriate smart contract function using Ethers.js
4. THE LifeChain_System SHALL store the deployed contract address in environment configuration
5. THE LifeChain_System SHALL emit events from smart contract functions for each milestone type
6. THE LifeChain_System SHALL handle blockchain transaction failures gracefully with retry logic

### Requirement 15: AI Donor Recommendation

**User Story:** As a hospital, I want AI-powered donor recommendations, so that I can identify the best donors for emergency requests

#### Acceptance Criteria

1. WHEN the AI_Microservice receives a donor recommendation request with location and blood group, THE AI_Microservice SHALL calculate suitability scores based on proximity, donation frequency, and time since last donation
2. THE AI_Microservice SHALL rank donors by suitability score in descending order
3. THE AI_Microservice SHALL return the top 10 donors with their scores and contact information
4. THE AI_Microservice SHALL prioritize donors who have donated 2-4 times in the past year over first-time or very frequent donors

### Requirement 16: Database Schema Enforcement

**User Story:** As a developer, I want enforced database schemas, so that data integrity is maintained

#### Acceptance Criteria

1. THE LifeChain_System SHALL define a Donor schema with required fields: name, email, password, bloodGroup, dateOfBirth, weight, city, pincode, walletAddress
2. THE LifeChain_System SHALL define a Hospital schema with required fields: hospitalName, email, password, city, pincode, walletAddress, isVerified
3. THE LifeChain_System SHALL define a Blood_Unit schema with required fields: bloodUnitID, donorID, bloodGroup, collectionDate, expiryDate, status, originalHospitalID, currentHospitalID, transferHistory
4. THE LifeChain_System SHALL define an Emergency_Request schema with required fields: hospitalID, bloodGroup, quantity, city, pincode, status, createdDate
5. THE LifeChain_System SHALL use MongoDB Atlas for data persistence
6. THE LifeChain_System SHALL enforce unique constraints on email fields and bloodUnitID

### Requirement 17: API Rate Limiting and Security

**User Story:** As a system administrator, I want API rate limiting and security measures, so that the system is protected from abuse

#### Acceptance Criteria

1. THE LifeChain_System SHALL limit API requests to 100 requests per 15 minutes per IP address
2. WHEN rate limit is exceeded, THE LifeChain_System SHALL return HTTP 429 status with retry-after header
3. THE LifeChain_System SHALL validate all input data against expected schemas before processing
4. THE LifeChain_System SHALL sanitize user inputs to prevent NoSQL injection attacks
5. THE LifeChain_System SHALL use HTTPS for all API communications in production
6. THE LifeChain_System SHALL set secure HTTP headers including CORS, CSP, and X-Frame-Options

### Requirement 18: Frontend Dashboard Interfaces

**User Story:** As a user, I want role-specific dashboards, so that I can efficiently perform my tasks

#### Acceptance Criteria

1. WHEN a donor logs in, THE LifeChain_System SHALL display a donor dashboard showing eligibility status, donation history, and certificate download options
2. WHEN a hospital logs in, THE LifeChain_System SHALL display a hospital dashboard showing inventory, transfer options, usage recording, and emergency request creation
3. WHEN an admin logs in, THE LifeChain_System SHALL display an admin panel showing pending hospital verifications and system statistics
4. THE LifeChain_System SHALL implement all frontend interfaces using React and Tailwind CSS
5. THE LifeChain_System SHALL use Axios for HTTP requests from frontend to backend
6. THE LifeChain_System SHALL store JWT tokens in browser localStorage and include them in authorization headers

### Requirement 19: Email Notification System

**User Story:** As a user, I want to receive email notifications for important events, so that I stay informed

#### Acceptance Criteria

1. WHEN a hospital is verified, THE LifeChain_System SHALL send a verification confirmation email to the hospital
2. WHEN a hospital is rejected, THE LifeChain_System SHALL send a rejection notification email to the hospital
3. WHEN an emergency request is created, THE LifeChain_System SHALL send email notifications to recommended donors
4. WHEN blood units are expiring within 7 days, THE LifeChain_System SHALL send expiry alert emails to the current hospital
5. THE LifeChain_System SHALL use Nodemailer for email delivery
6. THE LifeChain_System SHALL use email templates with consistent branding

### Requirement 20: System Deployment and Configuration

**User Story:** As a developer, I want clear deployment procedures, so that the system can be deployed to free hosting services

#### Acceptance Criteria

1. THE LifeChain_System SHALL deploy the React frontend to Vercel with environment variables for API endpoint
2. THE LifeChain_System SHALL deploy the Node.js backend to Render with environment variables for MongoDB URI, JWT secret, blockchain RPC URL, and contract address
3. THE LifeChain_System SHALL deploy the Flask AI_Microservice to Render with environment variables for model paths
4. THE LifeChain_System SHALL use MongoDB Atlas free tier for database hosting
5. THE LifeChain_System SHALL use Polygon Amoy testnet for blockchain operations with free test MATIC from faucets
6. THE LifeChain_System SHALL provide environment variable templates and deployment documentation

### Requirement 21: Blockchain Transaction Retry Logic

**User Story:** As a system administrator, I want automatic retry logic for failed blockchain transactions, so that temporary network issues don't cause data loss

#### Acceptance Criteria

1. WHEN a blockchain milestone recording fails, THE LifeChain_System SHALL store the milestone data in a retry queue
2. THE LifeChain_System SHALL attempt to resubmit failed milestones every 5 minutes for up to 24 hours
3. WHEN a retry succeeds, THE LifeChain_System SHALL update the Blood_Unit record with the transaction hash and remove it from the retry queue
4. WHEN a milestone fails after 24 hours of retries, THE LifeChain_System SHALL send an alert email to system administrators
5. THE LifeChain_System SHALL log all blockchain transaction attempts with timestamps and error messages

### Requirement 22: Blood Unit Expiry Enforcement

**User Story:** As a system administrator, I want automatic expiry enforcement, so that expired blood is never used

#### Acceptance Criteria

1. WHEN a Blood_Unit expiryDate is less than the current date, THE LifeChain_System SHALL prevent transfer operations
2. WHEN a Blood_Unit expiryDate is less than the current date, THE LifeChain_System SHALL prevent usage recording
3. THE LifeChain_System SHALL mark expired blood units with a visual indicator in inventory displays
4. WHEN a hospital attempts to transfer or use an expired Blood_Unit, THE LifeChain_System SHALL return an error message stating "Blood unit has expired"

### Requirement 23: Blockchain Data Parser and Pretty Printer

**User Story:** As a developer, I want to parse and format blockchain milestone data, so that it can be displayed in user interfaces and certificates

#### Acceptance Criteria

1. WHEN blockchain milestone data is retrieved, THE LifeChain_System SHALL parse the raw transaction data into structured objects with event type, bloodUnitID, parties involved, and timestamp
2. THE LifeChain_System SHALL format blockchain timestamps into human-readable date strings (YYYY-MM-DD HH:MM:SS UTC)
3. THE LifeChain_System SHALL format wallet addresses to display first 6 and last 4 characters with ellipsis (0x1234...5678)
4. FOR ALL valid blockchain milestone objects, parsing then formatting then parsing SHALL produce an equivalent object (round-trip property)
5. WHEN blockchain data contains invalid or missing fields, THE LifeChain_System SHALL return a descriptive parsing error

### Requirement 24: System Health Monitoring

**User Story:** As a system administrator, I want health monitoring endpoints, so that I can verify all system components are operational

#### Acceptance Criteria

1. THE LifeChain_System SHALL provide a health check endpoint at /api/health that returns HTTP 200 when the backend is operational
2. THE LifeChain_System SHALL verify MongoDB connectivity in the health check response
3. THE LifeChain_System SHALL verify blockchain RPC connectivity in the health check response
4. THE LifeChain_System SHALL verify AI_Microservice connectivity in the health check response
5. WHEN any component is unavailable, THE LifeChain_System SHALL return HTTP 503 with details of the failing component
6. THE LifeChain_System SHALL include response time metrics in health check responses

## Notes

This requirements document establishes the foundation for LifeChain's implementation. The system prioritizes medical compliance (56-day rule), selective blockchain verification (only 3 milestones), and AI-powered optimization while maintaining a completely free technology stack. All requirements follow EARS patterns and INCOSE quality rules to ensure testability and clarity.

The blockchain integration is intentionally selective to avoid performance bottlenecks - only donation, transfer, and usage events are recorded on-chain, while routine operations like status updates remain in MongoDB. This hybrid approach provides transparency where it matters most while maintaining system responsiveness.

The AI microservice operates independently to enable scaling and technology flexibility. The system uses HTTP-based communication between components to maintain loose coupling and deployment flexibility across free hosting platforms.
