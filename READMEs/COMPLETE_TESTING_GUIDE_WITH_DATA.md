# 🧪 Complete Testing Guide - All Roles with Dummy Data

## 📋 Table of Contents
1. [Prerequisites Check](#prerequisites-check)
2. [Dummy Data Reference](#dummy-data-reference)
3. [Donor Testing](#donor-testing)
4. [Hospital Testing](#hospital-testing)
5. [Admin Testing](#admin-testing)
6. [Common Errors & Solutions](#common-errors--solutions)

---

## Prerequisites Check

### ✅ Step 1: Verify Services Are Running

Open 3 terminals and run:

```bash
# Terminal 1 - Backend (Port 5000)
cd backend
npm start

# Terminal 2 - AI Service (Port 5001)
cd ai-service
python app.py

# Terminal 3 - Frontend (Port 5173)
cd frontend
npm run dev
```

**Expected Output:**
- Backend: `Server running on port 5000`
- AI Service: `Running on http://127.0.0.1:5001`
- Frontend: `Local: http://localhost:5173/`

### ✅ Step 2: Verify Sample Data Exists

Run this to check:
```bash
cd backend
node check-users.js
```

If no data exists, populate it:
```bash
node populate-sample-data.js
```

---

## 🔐 Dummy Data Reference

### **DONORS (5 Eligible)**

| Email | Password | Name | Blood Group | Age | Weight | City | Pincode |
|-------|----------|------|-------------|-----|--------|------|---------|
| sample.donor1@example.com | SamplePass123! | Sample Donor 1 | A- | 29 | 56 kg | Mumbai | 400001 |
| sample.donor2@example.com | SamplePass123! | Sample Donor 2 | B+ | 32 | 68 kg | Mumbai | 400001 |
| sample.donor3@example.com | SamplePass123! | Sample Donor 3 | B- | 25 | 72 kg | Delhi | 110001 |
| sample.donor4@example.com | SamplePass123! | Sample Donor 4 | AB+ | 35 | 65 kg | Delhi | 110001 |
| sample.donor5@example.com | SamplePass123! | Sample Donor 5 | AB- | 28 | 58 kg | Bangalore | 560001 |

### **HOSPITALS (3 Verified)**

| Email | Password | Hospital Name | City | Pincode |
|-------|----------|---------------|------|---------|
| sample.hospital1@example.com | HospitalPass123! | City General Hospital | Mumbai | 400001 |
| sample.hospital2@example.com | HospitalPass123! | Metro Medical Center | Delhi | 110001 |
| sample.hospital3@example.com | HospitalPass123! | Central Health Institute | Bangalore | 560001 |

### **ADMIN**

| Email | Password | Role |
|-------|----------|------|
| admin@lifechain.com | Admin@123456 | Admin |

### **BLOOD UNITS (15 Pre-populated)**

- 3 Collected (available for transfer/use)
- 4 Stored (available for transfer/use)
- 4 Transferred (in transit)
- 4 Used (completed)

### **EMERGENCY REQUESTS (2 Active)**

- Request 1: B+ blood, Critical urgency
- Request 2: AB+ blood, High urgency

---

## 👤 DONOR TESTING

### Test 1: Login as Donor

**Steps:**
1. Open browser: `http://localhost:5173`
2. Click "Login"
3. Enter credentials:
   ```
   Email: sample.donor1@example.com
   Password: SamplePass123!
   ```
4. Click "Login"

**Expected Result:**
- ✅ Redirects to Donor Dashboard
- ✅ Shows "Welcome, Sample Donor 1"
- ✅ Displays profile information

**Common Errors:**
- ❌ "Invalid credentials" → Check password (case-sensitive)
- ❌ "Network Error" → Backend not running
- ❌ Blank page → Check browser console (F12)

---

### Test 2: View Donor Profile

**What to Check:**
- ✅ Name: Sample Donor 1
- ✅ Email: sample.donor1@example.com
- ✅ Blood Group: A- (red badge)
- ✅ Age: 29 years
- ✅ Weight: 56 kg
- ✅ Location: Mumbai, 400001
- ✅ Wallet Address: 0x... (40 characters)

**Expected Eligibility:**
- ✅ Status: "Eligible" (green badge)
- ✅ Message: "You are eligible to donate blood"
- ✅ Shows: "No previous donations" or "Last donated X days ago"

**Common Errors:**
- ❌ "Failed to fetch profile" → Backend API issue
- ❌ Age shows "NaN" → Date of birth format issue
- ❌ Eligibility shows "Ineligible" → Check lastDonationDate

---

### Test 3: View Donation History

**What to Check:**
- ✅ Table with columns: Date, Blood Group, Hospital, Status, Blockchain, Certificate
- ✅ Initially may be empty (no donations yet)
- ✅ After hospital records donation, should show entries

**Expected Data (if donations exist):**
- Date: e.g., "2024-01-15"
- Blood Group: A-
- Hospital: City General Hospital
- Status: Collected/Stored/Transferred/Used
- Blockchain: Link icon or "Queued"
- Certificate: Download button

**Common Errors:**
- ❌ "Failed to load donations" → Check backend /api/donor/donations endpoint
- ❌ Empty table → Normal if no donations yet
- ❌ Certificate download fails → Check backend certificate service

---

### Test 4: Download Certificate (if donation exists)

**Steps:**
1. If donation history shows entries, click "Download Certificate"
2. PDF should download automatically

**Expected Result:**
- ✅ PDF file downloads: `certificate-BU-[ID].pdf`
- ✅ PDF contains: Donor name, blood group, donation date, hospital, QR code

**Common Errors:**
- ❌ "Certificate not found" → Blood unit doesn't belong to this donor
- ❌ PDF blank → PDFKit issue in backend
- ❌ Download fails → Check browser download settings

---

## 🏥 HOSPITAL TESTING

### Test 5: Login as Hospital

**Steps:**
1. Open NEW browser tab (or incognito: Ctrl+Shift+N)
2. Go to: `http://localhost:5173`
3. Click "Login"
4. Enter credentials:
   ```
   Email: sample.hospital1@example.com
   Password: HospitalPass123!
   ```
5. Click "Login"

**Expected Result:**
- ✅ Redirects to Hospital Dashboard
- ✅ Shows "City General Hospital"
- ✅ Shows 6 tabs: Inventory, Record Donation, Transfer Blood, Record Usage, Emergency Requests, Demand Prediction

**Common Errors:**
- ❌ "Hospital not verified" → Check isVerified field in database
- ❌ Shows donor dashboard → Role mismatch
- ❌ Tabs not visible → Frontend routing issue

---

### Test 6: View Blood Inventory

**Steps:**
1. Click "Inventory" tab (should be default)
2. View the blood units table

**Expected Data:**
- ✅ Shows 15 blood units (from sample data)
- ✅ Columns: Blood Unit ID, Blood Group, Collection Date, Expiry Date, Days Left, Status
- ✅ Status badges:
  - Blue: Collected (3 units)
  - Purple: Stored (4 units)
  - Yellow: Transferred (4 units)
  - Green: Used (4 units)

**Test Filters:**
1. Blood Group filter: Select "B+" → Shows only B+ units
2. Status filter: Select "Stored" → Shows only stored units
3. Clear filters → Shows all 15 units

**Expected Counts:**
- Total Units: 15
- By Blood Group: A+, A-, B+, B-, AB+, AB-, O+, O-

**Common Errors:**
- ❌ "Failed to load inventory" → Backend /api/hospital/inventory issue
- ❌ Shows 0 units → Sample data not populated
- ❌ Filters don't work → Frontend filter logic issue
- ❌ Expiry dates wrong → Check BloodUnit model calculation

---

### Test 7: Record Blood Donation

**Steps:**
1. Click "Record Donation" tab
2. Enter donor email: `sample.donor2@example.com`
3. Click "Search Donor"
4. **Expected:** Donor details appear:
   - Name: Sample Donor 2
   - Blood Group: B+
   - Eligibility: Eligible ✅
5. Select Blood Group: B+
6. Select Collection Date: Today's date
7. Click "Record Donation"

**Expected Result:**
- ✅ Success message: "Blood donation recorded successfully!"
- ✅ Shows Blood Unit ID: SAMPLE-BU-[timestamp]-[random]
- ✅ Shows: "Blockchain transaction queued" (if low MATIC)
- ✅ Donor's lastDonationDate updated

**Verify in Inventory:**
1. Click "Inventory" tab
2. ✅ New blood unit appears (16 total now)
3. ✅ Status: Collected
4. ✅ Blood Group: B+
5. ✅ Expiry Date: 42 days from today

**Common Errors:**
- ❌ "Donor not found" → Email typo or donor doesn't exist
- ❌ "Donor not eligible" → Check eligibility rules (age, weight, 56-day rule)
- ❌ "Hospital not verified" → isVerified = false
- ❌ Blockchain error → Normal if low MATIC, should queue for retry
- ❌ "Failed to record donation" → Check backend logs

**Dummy Data for Testing:**
```
Eligible Donors:
- sample.donor1@example.com (A-)
- sample.donor2@example.com (B+)
- sample.donor3@example.com (B-)
- sample.donor4@example.com (AB+)
- sample.donor5@example.com (AB-)
```

---

### Test 8: Transfer Blood Unit

**Steps:**
1. Click "Transfer Blood" tab
2. Select Blood Unit: Choose any "Collected" or "Stored" unit from dropdown
3. Select Destination Hospital: "Metro Medical Center" (Delhi)
4. Click "Transfer Blood"

**Expected Result:**
- ✅ Success message: "Blood unit transferred successfully!"
- ✅ Shows transaction hash or "Blockchain transaction queued"
- ✅ Blood unit status changes to "Transferred"
- ✅ currentHospitalID updated to destination hospital

**Verify in Inventory:**
1. Click "Inventory" tab
2. ✅ Transferred unit no longer shows (belongs to other hospital now)
3. ✅ Total units decreased by 1

**Common Errors:**
- ❌ "Blood unit not found" → Invalid bloodUnitID
- ❌ "You don't own this blood unit" → currentHospitalID mismatch
- ❌ "Blood unit expired" → Check expiry date
- ❌ "Destination hospital not verified" → Check hospital verification
- ❌ Dropdown empty → No blood units available

**Dummy Data:**
```
Destination Hospitals:
- Metro Medical Center (Delhi)
- Central Health Institute (Bangalore)
```

---

### Test 9: Record Blood Usage

**Steps:**
1. Click "Record Usage" tab
2. Select Blood Unit: Choose any "Collected" or "Stored" unit
3. Enter Patient ID: `PAT-TEST-001`
4. Click "Record Usage"

**Expected Result:**
- ✅ Success message: "Blood usage recorded successfully!"
- ✅ Shows transaction hash or "Blockchain transaction queued"
- ✅ Blood unit status changes to "Used"
- ✅ usageDate and patientID recorded

**Verify in Inventory:**
1. Click "Inventory" tab
2. ✅ Used unit no longer shows (status = "Used" excluded from inventory)
3. ✅ Total units decreased by 1

**Common Errors:**
- ❌ "Blood unit not found" → Invalid bloodUnitID
- ❌ "You don't own this blood unit" → currentHospitalID mismatch
- ❌ "Blood unit expired" → Cannot use expired blood
- ❌ "Patient ID required" → Validation error
- ❌ Dropdown empty → No blood units available

**Dummy Patient IDs:**
```
PAT-TEST-001
PAT-TEST-002
PAT-EMERGENCY-001
PAT-SURGERY-001
```

---

### Test 10: Create Emergency Request

**Steps:**
1. Click "Emergency Requests" tab
2. Scroll to "Create Emergency Request" form
3. Fill in:
   - Blood Group: O+
   - Quantity: 3
   - Urgency: Critical
   - Notes: "Urgent need for surgery patient"
4. Click "Create Request"

**Expected Result:**
- ✅ Success message: "Emergency request created successfully!"
- ✅ Shows: "X donors notified" (number of eligible donors)
- ✅ New request appears in active requests list
- ✅ Emails sent to top 10 eligible donors (if email configured)

**View Active Requests:**
- ✅ Shows 3 requests now (2 original + 1 new)
- ✅ Request details: Blood Group, Quantity, Urgency, Status, Date
- ✅ "Fulfill" button available

**Common Errors:**
- ❌ "Failed to create request" → Backend API issue
- ❌ "0 donors notified" → No eligible donors for that blood group/location
- ❌ Email errors → Normal if SMTP not configured
- ❌ AI service error → Donor ranking failed, but request still created

**Dummy Emergency Data:**
```
Blood Groups: A+, A-, B+, B-, AB+, AB-, O+, O-
Quantities: 1, 2, 3, 4, 5
Urgency: Low, Medium, High, Critical
```

---

### Test 11: View Demand Prediction

**Steps:**
1. Click "Demand Prediction" tab
2. Select Blood Group: A+
3. Click "Predict Demand"

**Expected Result:**
- ✅ Loading indicator appears
- ✅ 7-day forecast table displays:
  ```
  Day 1: X units
  Day 2: X units
  Day 3: X units
  ...
  Day 7: X units
  ```
- ✅ Confidence score: e.g., "85%"
- ✅ Recommendation message: e.g., "Maintain current stock levels"

**Test Different Blood Groups:**
1. Select: O- (universal donor)
2. Click "Predict Demand"
3. ✅ Different forecast appears

**Common Errors:**
- ❌ "AI service unavailable" → AI service not running (port 5001)
- ❌ "Insufficient historical data" → Normal for new hospitals
- ❌ Prediction shows 0 for all days → Model training issue
- ❌ Loading forever → AI service timeout

**Dummy Blood Groups to Test:**
```
A+, A-, B+, B-, AB+, AB-, O+, O-
```

---

## 👨‍💼 ADMIN TESTING

### Test 12: Login as Admin

**Steps:**
1. Open NEW browser (Firefox or Edge)
2. Go to: `http://localhost:5173`
3. Click "Login"
4. Enter credentials:
   ```
   Email: admin@lifechain.com
   Password: Admin@123456
   ```
5. Click "Login"

**Expected Result:**
- ✅ Redirects to Admin Panel
- ✅ Shows "Admin Panel"
- ✅ Shows 2 tabs: Pending Hospitals, System Statistics

**Common Errors:**
- ❌ "Access denied" → Role not set to "Admin"
- ❌ Shows donor/hospital dashboard → Role mismatch
- ❌ Tabs not visible → Frontend routing issue

---

### Test 13: View System Statistics

**Steps:**
1. Click "System Statistics" tab (should be default)
2. View the statistics cards

**Expected Data:**
- ✅ Total Donors: 10
- ✅ Verified Hospitals: 3
- ✅ Total Blood Units: 15+ (depends on testing)
- ✅ Active Emergencies: 2+ (depends on testing)

**Blood Units by Status:**
- ✅ Collected: X units
- ✅ Stored: X units
- ✅ Transferred: X units
- ✅ Used: X units

**Blood Units by Blood Group:**
- ✅ A+: X units
- ✅ A-: X units
- ✅ B+: X units
- ✅ B-: X units
- ✅ AB+: X units
- ✅ AB-: X units
- ✅ O+: X units
- ✅ O-: X units

**Test Auto-Refresh:**
- ✅ Wait 30 seconds
- ✅ Statistics auto-refresh
- ✅ Numbers update if changes occurred

**Common Errors:**
- ❌ "Failed to load statistics" → Backend /api/admin/statistics issue
- ❌ Shows 0 for all counts → Database empty
- ❌ Auto-refresh not working → Frontend timer issue
- ❌ Charts not displaying → Chart library issue

---

### Test 14: View Pending Hospitals

**Steps:**
1. Click "Pending Hospitals" tab
2. View the pending hospitals table

**Expected Data:**
- ✅ Shows 0 hospitals (all sample hospitals are pre-verified)
- ✅ Table columns: Hospital Name, Email, City, Pincode, Wallet Address, Registration Date, Actions

**To Test Approval/Rejection:**
You need to register a new hospital first:

1. Logout from admin
2. Go to Register page
3. Select "Hospital" role
4. Fill in:
   ```
   Hospital Name: Test Hospital
   Email: test.hospital@example.com
   Password: TestPass123!
   City: Mumbai
   Pincode: 400001
   Wallet Address: 0x1234567890123456789012345678901234567890
   ```
5. Register
6. Login as admin again
7. ✅ "Test Hospital" appears in pending list
8. Click "Approve" → Hospital verified
9. OR Click "Reject" → Hospital deleted

**Common Errors:**
- ❌ "Failed to load pending hospitals" → Backend API issue
- ❌ Approve/Reject buttons don't work → Check backend admin routes
- ❌ Email not sent → Normal if SMTP not configured
- ❌ Hospital still shows after approval → Frontend refresh issue

---

## 🔧 Common Errors & Solutions

### Error 1: "Network Error" or "Failed to fetch"

**Cause:** Backend not running or wrong URL

**Solution:**
```bash
# Check backend is running
cd backend
npm start

# Check frontend .env
cat frontend/.env
# Should show: VITE_API_URL=http://localhost:5000
```

---

### Error 2: "Invalid credentials"

**Cause:** Wrong password or user doesn't exist

**Solution:**
```bash
# Verify credentials
cd backend
node verify-sample-credentials.js

# If invalid, repopulate data
node populate-sample-data.js
```

---

### Error 3: "Hospital not verified"

**Cause:** isVerified = false in database

**Solution:**
```bash
# Check hospital verification status
cd backend
node check-users.js

# Sample hospitals should be pre-verified
# If not, login as admin and approve them
```

---

### Error 4: "Donor not eligible"

**Cause:** Fails eligibility checks (age, weight, 56-day rule)

**Solution:**
- Age must be 18-60 years
- Weight must be ≥50 kg
- Last donation must be >56 days ago (or null)
- Use sample donors 1-5 (all eligible)

---

### Error 5: "AI service unavailable"

**Cause:** AI service not running

**Solution:**
```bash
# Start AI service
cd ai-service
python app.py

# Check it's running
curl http://localhost:5001/api/health
```

---

### Error 6: "Blockchain transaction failed"

**Cause:** Low MATIC balance

**Solution:**
- This is EXPECTED and NORMAL
- Transactions are queued for retry
- Blood units still work in all features
- Mock hashes are used for display
- To fix: Get more MATIC from faucet (optional)

---

### Error 7: Empty inventory or no blood units

**Cause:** Sample data not populated

**Solution:**
```bash
cd backend
node populate-sample-data.js
```

---

### Error 8: Certificate download fails

**Cause:** PDFKit or blood unit ownership issue

**Solution:**
- Ensure donor owns the blood unit
- Check backend logs for PDFKit errors
- Verify bloodUnitID is correct

---

### Error 9: Browser console errors

**Cause:** Various frontend issues

**Solution:**
1. Open browser console (F12)
2. Check for errors (red text)
3. Common fixes:
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+Shift+R)
   - Check VITE_API_URL in frontend/.env

---

### Error 10: "Token expired" or "Unauthorized"

**Cause:** JWT token expired (24 hours)

**Solution:**
- Logout and login again
- Token is stored in localStorage
- Clear localStorage: F12 → Application → Local Storage → Clear

---

## 📸 Testing Checklist

Use this checklist while testing:

### Donor Dashboard
- [ ] Login successful
- [ ] Profile displays correctly
- [ ] Eligibility status shows
- [ ] Donation history loads
- [ ] Certificate download works (if donations exist)
- [ ] No console errors

### Hospital Dashboard
- [ ] Login successful
- [ ] All 6 tabs visible
- [ ] Inventory shows blood units
- [ ] Filters work correctly
- [ ] Record donation successful
- [ ] Transfer blood successful
- [ ] Record usage successful
- [ ] Emergency request created
- [ ] Demand prediction works
- [ ] No console errors

### Admin Panel
- [ ] Login successful
- [ ] Statistics display correctly
- [ ] Blood units breakdown shows
- [ ] Auto-refresh works
- [ ] Pending hospitals loads
- [ ] Approve/Reject works (if pending hospitals exist)
- [ ] No console errors

---

## 🎯 Quick Test Scenarios

### Scenario 1: Complete Blood Supply Chain (10 minutes)

1. **Admin** views initial statistics
2. **Hospital** records donation from sample.donor2@example.com
3. **Donor** logs in and sees new donation in history
4. **Hospital** transfers blood to Metro Medical Center
5. **Hospital** (Metro Medical Center) receives and uses blood
6. **Admin** views updated statistics

### Scenario 2: Emergency Request Flow (5 minutes)

1. **Hospital** creates emergency request for O+ blood
2. System notifies eligible O+ donors
3. **Donor** (O+ blood group) receives notification
4. **Hospital** fulfills request after receiving donation

### Scenario 3: Demand Prediction (3 minutes)

1. **Hospital** selects blood group A+
2. Views 7-day forecast
3. Tests different blood groups
4. Checks confidence scores

---

## 📞 Need Help?

If you encounter errors not listed here:

1. **Check backend logs** (terminal running backend)
2. **Check browser console** (F12 → Console tab)
3. **Check AI service logs** (terminal running AI service)
4. **Verify all services running** (3 terminals)
5. **Check sample data exists** (run check-users.js)

**Share the error message and I'll help you fix it!**

---

**Ready to test? Start with Donor Testing (Test 1)!** 🚀
