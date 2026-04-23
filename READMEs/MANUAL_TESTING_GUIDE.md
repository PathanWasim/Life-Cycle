# LifeChain Manual End-to-End Testing Guide

## System Status
- ✅ Backend: Running on http://localhost:5000
- ✅ AI Service: Running on http://localhost:5001  
- ✅ Frontend: Running on http://localhost:5173
- ✅ MongoDB: Connected (lifechain database)
- ✅ Sample Data: Populated with 15 donors, 8 hospitals, 50 blood units, 5 emergency requests

## Test Credentials

### Donors (with sample data)
- **Rajesh Kumar**: donor1@example.com / password123
- **Priya Sharma**: donor2@example.com / password123
- **Amit Patel**: donor3@example.com / password123
- **Sneha Gupta**: donor4@example.com / password123
- **Vikram Singh**: donor5@example.com / password123

### Hospitals (Verified)
- **City General Hospital**: hospital1@example.com / hospital123
- **Metro Medical Center**: hospital2@example.com / hospital123
- **Central Blood Bank**: hospital3@example.com / hospital123

### Hospitals (Pending Verification)
- **New Hope Medical Center**: hospital7@example.com / hospital123
- **Sunrise Hospital**: hospital8@example.com / hospital123

### Admin
- **System Admin**: admin@lifechain.com / Admin@123456

## Testing Scenarios

### 1. Donor Dashboard Testing

#### Test 1.1: Donor Login and Profile View
1. Navigate to http://localhost:5173
2. Click "Login"
3. Login with: donor1@example.com / password123
4. **Expected**: Redirected to donor dashboard
5. **Verify**: 
   - Profile shows Rajesh Kumar's details
   - Blood group, age, weight, city displayed
   - Eligibility status shown (Eligible/Ineligible)
   - Days since last donation displayed

#### Test 1.2: Donation History View
1. In donor dashboard, check "Donation History" section
2. **Expected**: List of past donations with:
   - Donation dates
   - Hospital names
   - Blood unit status (Collected/Stored/Transferred/Used)
   - Blockchain transaction links

#### Test 1.3: Certificate Download
1. Find a donation in history
2. Click "Download Certificate" button
3. **Expected**: PDF certificate downloads with:
   - Donor name and details
   - Donation information
   - QR code for verification
   - Blockchain transaction hash

### 2. Hospital Dashboard Testing

#### Test 2.1: Hospital Login and Inventory View
1. Logout from donor account
2. Login with: hospital1@example.com / hospital123
3. **Expected**: Redirected to hospital dashboard
4. **Verify**:
   - Hospital name "City General Hospital" displayed
   - Inventory tab shows blood units
   - Blood units grouped by blood group
   - Expiry dates and days remaining shown
   - Color coding for expiry urgency

#### Test 2.2: Blood Donation Recording
1. Go to "Record Donation" tab
2. Search for donor by email: donor2@example.com
3. **Expected**: Donor details loaded, eligibility status shown
4. Select blood group matching donor's blood group
5. Set collection date to today
6. Submit donation
7. **Expected**: 
   - Success message with blockchain transaction hash
   - New blood unit appears in inventory
   - Donor's last donation date updated

#### Test 2.3: Blood Transfer
1. Go to "Transfer Blood" tab
2. Select a blood unit from dropdown
3. Select destination hospital (hospital2@example.com)
4. Submit transfer
5. **Expected**:
   - Success message with blockchain transaction hash
   - Blood unit removed from current hospital's inventory
   - Transfer recorded in blockchain

#### Test 2.4: Blood Usage Recording
1. Go to "Record Usage" tab
2. Select a blood unit from inventory
3. Enter patient ID: PAT-2024-TEST-001
4. Submit usage
5. **Expected**:
   - Success message with blockchain transaction hash
   - Blood unit marked as "Used"
   - Removed from available inventory

#### Test 2.5: Emergency Request Creation
1. Go to "Emergency Requests" tab
2. Create new emergency request:
   - Blood Group: O+
   - Quantity: 2
   - City: Mumbai
   - Pincode: 400001
   - Urgency: Critical
3. Submit request
4. **Expected**:
   - Success message
   - Number of notified donors displayed
   - Request appears in active requests list

#### Test 2.6: Demand Prediction
1. Go to "Demand Prediction" tab
2. Select blood group: O+
3. Click "Get Prediction"
4. **Expected**:
   - 7-day forecast displayed
   - Confidence score shown
   - Recommendation provided

### 3. Admin Panel Testing

#### Test 3.1: Admin Login and Pending Hospitals
1. Logout from hospital account
2. Login with: admin@lifechain.com / Admin@123456
3. **Expected**: Redirected to admin panel
4. **Verify**:
   - "Pending Hospitals" tab shows unverified hospitals
   - Hospital details displayed (name, email, city, registration date)
   - Approve/Reject buttons available

#### Test 3.2: Hospital Verification
1. Find "New Hope Medical Center" in pending list
2. Click "Approve" button
3. **Expected**:
   - Success message
   - Hospital removed from pending list
   - Verification email sent (check console logs)

#### Test 3.3: Hospital Rejection
1. Find "Sunrise Hospital" in pending list
2. Click "Reject" button
3. Confirm rejection in dialog
4. **Expected**:
   - Hospital removed from pending list
   - Rejection email sent (check console logs)
   - Hospital account deleted

#### Test 3.4: System Statistics
1. Go to "System Statistics" tab
2. **Expected**:
   - Total counts displayed (donors, hospitals, blood units)
   - Blood units breakdown by status
   - Blood group distribution chart/table
   - Statistics auto-refresh every 30 seconds

### 4. Blockchain Integration Testing

#### Test 4.1: Transaction Verification
1. From any successful operation (donation/transfer/usage), copy the transaction hash
2. Visit: https://amoy.polygonscan.com/
3. Paste transaction hash in search
4. **Expected**:
   - Transaction details displayed
   - Contract interaction visible
   - Event logs showing milestone data

#### Test 4.2: Milestone Retrieval
1. Use API endpoint: GET /api/blockchain/milestones/{bloodUnitID}
2. **Expected**:
   - Array of milestones (Donation, Transfer, Usage)
   - Chronological order maintained
   - All milestone data properly formatted

### 5. Email Notification Testing

#### Test 5.1: Hospital Verification Email
1. Check backend console logs after approving a hospital
2. **Expected**: Email sending confirmation logged

#### Test 5.2: Emergency Request Notifications
1. Check backend console logs after creating emergency request
2. **Expected**: Multiple email notifications sent to eligible donors

#### Test 5.3: Expiry Alerts
1. Check if expiry alert job is running (backend logs)
2. **Expected**: Daily alerts for blood units expiring within 7 days

### 6. Error Handling Testing

#### Test 6.1: Unverified Hospital Restrictions
1. Login with unverified hospital: hospital7@example.com / hospital123
2. Try to record a donation
3. **Expected**: Error message "Hospital not verified"

#### Test 6.2: Ineligible Donor Donation
1. Login with verified hospital
2. Try to record donation for ineligible donor
3. **Expected**: Error message about donor eligibility

#### Test 6.3: Expired Blood Unit Operations
1. Try to transfer or use an expired blood unit
2. **Expected**: Error message "Blood unit has expired"

### 7. AI Service Integration Testing

#### Test 7.1: AI Service Health Check
1. Visit: http://localhost:5001/api/health
2. **Expected**: Service status and model availability

#### Test 7.2: Demand Prediction API
1. Test API endpoint: POST /api/hospital/predict-demand/O+
2. **Expected**: 7-day forecast with confidence scores

#### Test 7.3: Donor Recommendations
1. Create emergency request and check backend logs
2. **Expected**: AI-ranked donor recommendations

## Expected Dashboard Views

### Donor Dashboard Should Show:
- ✅ Personal profile with eligibility status
- ✅ Complete donation history with blockchain links
- ✅ Certificate download buttons for each donation
- ✅ Next eligible donation date if currently ineligible

### Hospital Dashboard Should Show:
- ✅ Current blood inventory with expiry tracking
- ✅ Forms for donation recording, transfers, usage
- ✅ Emergency request management
- ✅ AI-powered demand predictions
- ✅ Real-time inventory updates after operations

### Admin Panel Should Show:
- ✅ List of hospitals pending verification
- ✅ System-wide statistics and analytics
- ✅ Hospital approval/rejection controls
- ✅ Real-time data updates

## Success Criteria

### ✅ All user roles can login and access appropriate dashboards
### ✅ Sample data is visible across all dashboards
### ✅ Complete blood supply chain flow works (donation → transfer → usage)
### ✅ Blockchain transactions are recorded and verifiable
### ✅ Email notifications are triggered (check logs)
### ✅ AI service provides predictions and recommendations
### ✅ Certificate generation and download works
### ✅ Admin can verify/reject hospitals
### ✅ Error handling works for invalid operations
### ✅ Real-time updates reflect across dashboards

## Troubleshooting

### If Frontend Shows "Network Error":
- Check if backend is running on port 5000
- Verify CORS settings allow localhost:5173

### If Blockchain Operations Fail:
- Check if wallet has sufficient test MATIC
- Verify contract address in backend .env
- Check Polygon Amoy network connectivity

### If AI Predictions Don't Work:
- Check if AI service is running on port 5001
- Verify backend can connect to AI service
- Check AI service logs for errors

### If Email Notifications Don't Send:
- Check email service configuration in backend .env
- Verify SMTP credentials are correct
- Check backend logs for email sending errors

## Next Steps After Testing

1. Document any bugs or issues found
2. Verify all requirements are met
3. Test performance with larger datasets
4. Prepare for deployment to production
5. Create user documentation and training materials