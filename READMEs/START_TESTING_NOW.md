# 🚀 START TESTING NOW - Step by Step

## ✅ Your System is Ready!

Diagnostics show:
- ✅ 19 eligible donors
- ✅ 11 verified hospitals  
- ✅ 65 blood units
- ✅ All credentials working
- ✅ MongoDB connected

---

## 📋 STEP 1: Start All Services (3 terminals)

### Terminal 1 - Backend
```bash
cd backend
npm start
```
**Wait for:** `Server running on port 5000`

### Terminal 2 - AI Service
```bash
cd ai-service
python app.py
```
**Wait for:** `Running on http://127.0.0.1:5001`

### Terminal 3 - Frontend
```bash
cd frontend
npm run dev
```
**Wait for:** `Local: http://localhost:5173/`

---

## 🧪 STEP 2: Test Donor Dashboard (5 minutes)

### 2.1 Login as Donor
1. Open browser: `http://localhost:5173`
2. Click "Login"
3. Enter:
   ```
   Email: sample.donor1@example.com
   Password: SamplePass123!
   ```
4. Click "Login"

**✅ Expected:** Donor Dashboard loads

### 2.2 Check Profile
Look for:
- Name: Sample Donor 1
- Blood Group: A- (red badge)
- Age: 29 years
- Weight: 56 kg
- Location: Mumbai, 400001
- Eligibility: "Eligible" (green badge)

**✅ Expected:** All information displays correctly

### 2.3 Check Donation History
- Table should show (may be empty initially)
- Columns: Date, Blood Group, Hospital, Status, Blockchain, Certificate

**✅ Expected:** Table loads (empty is OK)

**📸 Take Screenshot:** Donor dashboard

---

## 🏥 STEP 3: Test Hospital Dashboard (10 minutes)

### 3.1 Login as Hospital (New Tab - Incognito)
1. Press `Ctrl+Shift+N` (Chrome Incognito)
2. Go to: `http://localhost:5173`
3. Click "Login"
4. Enter:
   ```
   Email: sample.hospital1@example.com
   Password: HospitalPass123!
   ```
5. Click "Login"

**✅ Expected:** Hospital Dashboard with 6 tabs

### 3.2 View Inventory
1. Click "Inventory" tab
2. You should see blood units

**✅ Expected:** 
- Shows blood units (you have 65 total)
- Columns: Blood Unit ID, Blood Group, Collection Date, Expiry Date, Days Left, Status
- Status badges: Collected (blue), Stored (purple), Transferred (yellow), Used (green)

**Test Filters:**
- Select Blood Group: B+ → Shows only B+ units
- Select Status: Stored → Shows only stored units
- Clear filters → Shows all units

**📸 Take Screenshot:** Inventory with blood units

### 3.3 Record New Donation
1. Click "Record Donation" tab
2. Enter donor email: `sample.donor2@example.com`
3. Click "Search Donor"
4. **Expected:** Donor details appear (Sample Donor 2, B+, Eligible)
5. Select Blood Group: B+
6. Select Collection Date: Today
7. Click "Record Donation"

**✅ Expected:**
- Success message: "Blood donation recorded successfully!"
- Shows Blood Unit ID
- Shows "Blockchain transaction queued" (normal - low MATIC)

**📸 Take Screenshot:** Success message

### 3.4 Verify New Blood Unit
1. Click "Inventory" tab
2. Look for the new blood unit (should be at top)

**✅ Expected:**
- New unit appears
- Status: Collected
- Blood Group: B+
- Expiry: 42 days from today

### 3.5 Create Emergency Request
1. Click "Emergency Requests" tab
2. Scroll to "Create Emergency Request" form
3. Fill in:
   - Blood Group: O+
   - Quantity: 3
   - Urgency: Critical
   - Notes: "Urgent need for surgery"
4. Click "Create Request"

**✅ Expected:**
- Success message
- Shows "X donors notified"
- New request appears in list

**📸 Take Screenshot:** Emergency requests

### 3.6 Test Demand Prediction
1. Click "Demand Prediction" tab
2. Select Blood Group: A+
3. Click "Predict Demand"

**✅ Expected:**
- Loading indicator
- 7-day forecast table appears
- Shows confidence score
- Shows recommendation

**📸 Take Screenshot:** Demand prediction

---

### 3.7 Test Transfer Blood
1. Click "Transfer Blood" tab
2. **Select Blood Unit:** Choose any "Collected" or "Stored" unit from dropdown
3. **Select Destination Hospital:** Choose "Metro Medical Center" or "Central Health Institute"
4. Click "Transfer Blood"

**✅ Expected:**
- Success message: "✅ Blood unit transferred successfully! From: City General Hospital → To: Metro Medical Center | Blockchain: Pending"
- Form resets
- Inventory refreshes (transferred unit removed)

**📸 Take Screenshot:** Transfer success

### 3.8 Test Record Usage
1. Click "Record Usage" tab
2. **Select Blood Unit:** Choose any "Collected" or "Stored" unit from dropdown
3. **Enter Patient ID:** `PAT-TEST-001`
4. Click "Record Usage"

**✅ Expected:**
- Success message: "✅ Blood usage recorded successfully! Blood Unit: BU-xxx | Patient: PAT-TEST-001 | Blockchain: Pending"
- Form resets
- Inventory refreshes (used unit removed)

**📸 Take Screenshot:** Usage success

---

## 👨‍💼 STEP 4: Test Admin Panel (5 minutes)

### 4.1 Login as Admin (New Browser - Firefox/Edge)
1. Open Firefox or Edge
2. Go to: `http://localhost:5173`
3. Click "Login"
4. Enter:
   ```
   Email: admin@lifechain.com
   Password: Admin@123456
   ```
5. Click "Login"

**✅ Expected:** Admin Panel loads

### 4.2 View System Statistics
1. Click "System Statistics" tab
2. Check the numbers:

**✅ Expected:**
- Total Donors: 25
- Verified Hospitals: 11
- Total Blood Units: 65+
- Active Emergencies: 5+

**Blood Units by Status:**
- Collected: 3+
- Stored: 19+
- Transferred: 5+
- Used: 38+

**Blood Units by Blood Group:**
- Shows breakdown for all 8 blood groups

**📸 Take Screenshot:** Admin statistics

### 4.3 Check Pending Hospitals
1. Click "Pending Hospitals" tab

**✅ Expected:**
- Shows 0 hospitals (all sample hospitals pre-verified)
- Table with columns visible

---

## 🎯 STEP 5: Test Complete Flow (5 minutes)

### Arrange Windows Side-by-Side
- Left: Donor dashboard
- Middle: Hospital dashboard  
- Right: Admin panel

### 5.1 Hospital Records Donation
1. In Hospital tab, go to "Record Donation"
2. Search: `sample.donor3@example.com`
3. Blood Group: B-
4. Click "Record Donation"
5. **✅ Success message**

### 5.2 Donor Sees Donation
1. In Donor tab, refresh page (F5)
2. Check donation history
3. **✅ Should see new donation** (if you used donor3's account)

### 5.3 Hospital Transfers Blood
1. In Hospital tab, go to "Transfer Blood"
2. Select any "Collected" or "Stored" unit
3. Destination: Metro Medical Center
4. Click "Transfer Blood"
5. **✅ Success message**

### 5.4 Hospital Records Usage
1. In Hospital tab, go to "Record Usage"
2. Select any "Collected" or "Stored" unit
3. Patient ID: `PAT-TEST-001`
4. Click "Record Usage"
5. **✅ Success message**

### 5.5 Admin Views Updated Stats
1. In Admin tab, click "Refresh" or wait 30 seconds
2. **✅ Numbers updated**

**📸 Take Screenshot:** All 3 windows side-by-side

---

## ✅ Testing Checklist

Mark as you complete:

### Donor Dashboard
- [ ] Login successful
- [ ] Profile displays correctly
- [ ] Eligibility status shows
- [ ] Donation history table visible
- [ ] Screenshot taken

### Hospital Dashboard
- [ ] Login successful
- [ ] Inventory shows blood units
- [ ] Filters work
- [ ] Record donation successful
- [ ] Emergency request created
- [ ] Demand prediction works
- [ ] Screenshots taken

### Admin Panel
- [ ] Login successful
- [ ] Statistics display correctly
- [ ] Blood units breakdown shows
- [ ] Screenshot taken

### Complete Flow
- [ ] All 3 dashboards working together
- [ ] Data updates across dashboards
- [ ] Final screenshot taken

---

## 🐛 If You See Errors

### "Invalid credentials"
- Copy-paste the credentials (case-sensitive)
- Make sure no extra spaces

### "Network Error"
- Check all 3 services are running
- Check URLs: backend (5000), AI (5001), frontend (5173)

### "Hospital not verified"
- Sample hospitals are pre-verified
- If using different hospital, admin must approve first

### "Donor not eligible"
- Use sample.donor1 through sample.donor5 (all eligible)
- Avoid sample.donor6-10 (recently donated)

### "AI service unavailable"
- Check AI service is running (Terminal 2)
- Check: `curl http://localhost:5001/api/health`

### Empty inventory
- You have 65 blood units
- Check filters are cleared
- Refresh page

### Other errors
- Check browser console (F12)
- Check backend terminal for errors
- Share error message for help

---

## 📝 After Testing

Create test report: `TASK_31_TEST_REPORT.md`

```markdown
# Task 31 Test Report

**Date:** [Today's date]
**Tester:** [Your name]

## Test Results

### Donor Dashboard
- Login: ✅ PASS
- Profile: ✅ PASS
- Eligibility: ✅ PASS
- Donation History: ✅ PASS

### Hospital Dashboard
- Login: ✅ PASS
- Inventory: ✅ PASS
- Record Donation: ✅ PASS
- Transfer Blood: ✅ PASS
- Record Usage: ✅ PASS
- Emergency Request: ✅ PASS
- Demand Prediction: ✅ PASS

### Admin Panel
- Login: ✅ PASS
- Statistics: ✅ PASS
- Blood Units Breakdown: ✅ PASS

### Complete Flow
- All dashboards working: ✅ PASS
- Data consistency: ✅ PASS

## Summary
- Total Tests: 15
- Passed: 15
- Failed: 0
- Success Rate: 100%

## Conclusion
✅ All features working as expected
✅ Task 31 testing complete
✅ System ready for deployment

## Screenshots
[Attach 6 screenshots]
```

---

## 🎉 Success Criteria

Task 31 is complete when:
1. ✅ All 3 dashboards tested
2. ✅ All features working
3. ✅ Screenshots taken
4. ✅ Test report created

---

## 📞 Quick Reference

**Credentials:**
```
Donor: sample.donor1@example.com / SamplePass123!
Hospital: sample.hospital1@example.com / HospitalPass123!
Admin: admin@lifechain.com / Admin@123456
```

**URLs:**
```
Frontend: http://localhost:5173
Backend: http://localhost:5000
AI Service: http://localhost:5001
```

**Test Data:**
```
Eligible Donors: sample.donor1 to sample.donor5
Patient IDs: PAT-TEST-001, PAT-TEST-002
Blood Groups: A+, A-, B+, B-, AB+, AB-, O+, O-
```

---

**Ready? Start with STEP 1!** 🚀

**Estimated Time:** 25-30 minutes total
