# 📝 Testing Dummy Data - Quick Reference

## 🔐 Login Credentials

### Donors (5 Eligible)
```
Email: sample.donor1@example.com
Password: SamplePass123!
Blood Group: A-
Location: Mumbai, 400001

Email: sample.donor2@example.com
Password: SamplePass123!
Blood Group: B+
Location: Mumbai, 400001

Email: sample.donor3@example.com
Password: SamplePass123!
Blood Group: B-
Location: Delhi, 110001

Email: sample.donor4@example.com
Password: SamplePass123!
Blood Group: AB+
Location: Delhi, 110001

Email: sample.donor5@example.com
Password: SamplePass123!
Blood Group: AB-
Location: Bangalore, 560001
```

### Hospitals (3 Verified)
```
Email: sample.hospital1@example.com
Password: HospitalPass123!
Name: City General Hospital
Location: Mumbai, 400001

Email: sample.hospital2@example.com
Password: HospitalPass123!
Name: Metro Medical Center
Location: Delhi, 110001

Email: sample.hospital3@example.com
Password: HospitalPass123!
Name: Central Health Institute
Location: Bangalore, 560001
```

### Admin
```
Email: admin@lifechain.com
Password: Admin@123456
Role: Admin
```

---

## 🩸 Blood Groups for Testing

```
A+  (Common)
A-  (Rare)
B+  (Common)
B-  (Rare)
AB+ (Universal Recipient)
AB- (Rare)
O+  (Common)
O-  (Universal Donor)
```

---

## 🏥 Hospital Testing Data

### Record Donation
```
Donor Email: sample.donor1@example.com
Blood Group: A-
Collection Date: [Today's date]

Donor Email: sample.donor2@example.com
Blood Group: B+
Collection Date: [Today's date]

Donor Email: sample.donor3@example.com
Blood Group: B-
Collection Date: [Today's date]
```

### Transfer Blood
```
Destination Hospital: Metro Medical Center
Destination Hospital: Central Health Institute
```

### Record Usage
```
Patient ID: PAT-TEST-001
Patient ID: PAT-TEST-002
Patient ID: PAT-EMERGENCY-001
Patient ID: PAT-SURGERY-001
Patient ID: PAT-TRAUMA-001
```

### Emergency Request
```
Blood Group: O+
Quantity: 3
Urgency: Critical
Notes: Urgent need for surgery patient

Blood Group: A-
Quantity: 2
Urgency: High
Notes: Emergency trauma case

Blood Group: B+
Quantity: 1
Urgency: Medium
Notes: Scheduled surgery preparation
```

---

## 🧪 Test Scenarios

### Scenario 1: Simple Donation Flow
```
1. Login as: sample.hospital1@example.com / HospitalPass123!
2. Go to: Record Donation tab
3. Search donor: sample.donor1@example.com
4. Blood Group: A-
5. Collection Date: Today
6. Click: Record Donation
7. Expected: Success message + Blood Unit ID
```

### Scenario 2: Blood Transfer
```
1. Login as: sample.hospital1@example.com / HospitalPass123!
2. Go to: Transfer Blood tab
3. Select: Any "Collected" or "Stored" blood unit
4. Destination: Metro Medical Center
5. Click: Transfer Blood
6. Expected: Success message + Transaction hash/queued
```

### Scenario 3: Blood Usage
```
1. Login as: sample.hospital1@example.com / HospitalPass123!
2. Go to: Record Usage tab
3. Select: Any "Collected" or "Stored" blood unit
4. Patient ID: PAT-TEST-001
5. Click: Record Usage
6. Expected: Success message + Transaction hash/queued
```

### Scenario 4: Emergency Request
```
1. Login as: sample.hospital1@example.com / HospitalPass123!
2. Go to: Emergency Requests tab
3. Blood Group: O+
4. Quantity: 3
5. Urgency: Critical
6. Notes: Urgent need for surgery
7. Click: Create Request
8. Expected: Success + "X donors notified"
```

### Scenario 5: Demand Prediction
```
1. Login as: sample.hospital1@example.com / HospitalPass123!
2. Go to: Demand Prediction tab
3. Select Blood Group: A+
4. Click: Predict Demand
5. Expected: 7-day forecast table + confidence score
```

### Scenario 6: Donor View Donations
```
1. Login as: sample.donor1@example.com / SamplePass123!
2. View: Donation History section
3. Expected: List of donations (if any recorded)
4. Click: Download Certificate (if available)
5. Expected: PDF downloads
```

### Scenario 7: Admin Statistics
```
1. Login as: admin@lifechain.com / Admin@123456
2. Go to: System Statistics tab
3. Expected: 
   - Total Donors: 10
   - Verified Hospitals: 3
   - Total Blood Units: 15+
   - Active Emergencies: 2+
4. Wait 30 seconds
5. Expected: Auto-refresh
```

---

## 🎯 Quick Copy-Paste Data

### For Record Donation Form
```
sample.donor1@example.com
sample.donor2@example.com
sample.donor3@example.com
sample.donor4@example.com
sample.donor5@example.com
```

### For Patient IDs
```
PAT-TEST-001
PAT-TEST-002
PAT-TEST-003
PAT-EMERGENCY-001
PAT-SURGERY-001
```

### For Emergency Notes
```
Urgent need for surgery patient
Emergency trauma case requiring immediate blood
Scheduled surgery preparation
Critical patient in ICU
Road accident victim needs blood urgently
```

### For Blood Groups (Copy-Paste)
```
A+
A-
B+
B-
AB+
AB-
O+
O-
```

---

## 📊 Expected Data After Sample Population

### Users
- 10 Donors (5 eligible, 5 ineligible)
- 3 Verified Hospitals
- 1 Admin

### Blood Units (15 total)
- 3 Collected
- 4 Stored
- 4 Transferred
- 4 Used

### Emergency Requests (2 active)
- Request 1: B+ (Critical)
- Request 2: AB+ (High)

---

## 🔍 Verification Commands

### Check if sample data exists
```bash
cd backend
node check-users.js
```

### Verify credentials work
```bash
cd backend
node verify-sample-credentials.js
```

### Run full diagnostics
```bash
cd backend
node diagnose-errors.js
```

### Populate sample data
```bash
cd backend
node populate-sample-data.js
```

### Clear retry queue
```bash
cd backend
node clear-retry-queue.js
```

---

## 🌐 URLs

```
Frontend: http://localhost:5173
Backend API: http://localhost:5000
AI Service: http://localhost:5001

Backend Health: http://localhost:5000/api/health
AI Health: http://localhost:5001/api/health
```

---

## 🎨 Expected UI Elements

### Donor Dashboard
- Profile card with name, blood group, age, weight
- Eligibility badge (green = eligible, red = ineligible)
- Donation history table
- Download certificate buttons

### Hospital Dashboard (6 tabs)
1. **Inventory** - Blood units table with filters
2. **Record Donation** - Donor search + donation form
3. **Transfer Blood** - Blood unit selector + destination hospital
4. **Record Usage** - Blood unit selector + patient ID
5. **Emergency Requests** - Active requests + create form
6. **Demand Prediction** - Blood group selector + forecast table

### Admin Panel (2 tabs)
1. **Pending Hospitals** - Approval/rejection table
2. **System Statistics** - Summary cards + charts

---

## 🚨 Common Test Mistakes

### ❌ Wrong Password Format
```
Wrong: samplepass123!
Wrong: SamplePass123
Wrong: SAMPLEPASS123!
Correct: SamplePass123!
```

### ❌ Wrong Email Format
```
Wrong: sample.donor1
Wrong: donor1@example.com
Wrong: Sample.Donor1@example.com
Correct: sample.donor1@example.com
```

### ❌ Using Ineligible Donors
```
Wrong: sample.donor6@example.com (ineligible - recent donation)
Wrong: sample.donor7@example.com (ineligible - recent donation)
Correct: sample.donor1@example.com (eligible)
```

### ❌ Using Unverified Hospitals
```
All sample hospitals are pre-verified ✅
If you register a new hospital, admin must verify it first
```

---

## 💡 Pro Tips

1. **Multi-Tab Testing:**
   - Tab 1: Donor (Chrome regular)
   - Tab 2: Hospital (Chrome incognito)
   - Tab 3: Admin (Firefox/Edge)

2. **Copy-Paste Credentials:**
   - Avoid typos by copy-pasting
   - Passwords are case-sensitive

3. **Test in Order:**
   - Login → View → Create → Transfer → Use
   - Don't skip steps

4. **Check Browser Console:**
   - Press F12
   - Look for red errors
   - Share errors if stuck

5. **Blockchain Transactions:**
   - "Queued" is normal (low MATIC)
   - Blood units still work
   - No action needed

---

## 📸 Screenshot Checklist

Take screenshots of:
- [ ] Donor dashboard (profile + eligibility)
- [ ] Hospital inventory (15+ blood units)
- [ ] Record donation success message
- [ ] Emergency request created
- [ ] Demand prediction forecast
- [ ] Admin statistics dashboard
- [ ] All 3 tabs side-by-side (final state)

---

## ✅ Testing Completion Checklist

### Donor Testing
- [ ] Login successful
- [ ] Profile displays correctly
- [ ] Eligibility status shows
- [ ] Donation history loads
- [ ] Certificate download works (if donations exist)

### Hospital Testing
- [ ] Login successful
- [ ] Inventory shows blood units
- [ ] Filters work
- [ ] Record donation successful
- [ ] Transfer blood successful
- [ ] Record usage successful
- [ ] Emergency request created
- [ ] Demand prediction works

### Admin Testing
- [ ] Login successful
- [ ] Statistics display correctly
- [ ] Blood units breakdown shows
- [ ] Auto-refresh works
- [ ] Pending hospitals loads (may be empty)

---

**Print this page and keep it handy while testing!** 📄
