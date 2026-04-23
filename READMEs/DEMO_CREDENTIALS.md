# 🎯 LifeChain Demo Credentials - Complete Workflow

## 📋 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                    DEMO CREDENTIALS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 DONORS (3)                                              │
│  ├─ Donor 1: sample.donor1@example.com / SamplePass123!    │
│  ├─ Donor 2: sample.donor2@example.com / SamplePass123!    │
│  └─ Donor 3: sample.donor3@example.com / SamplePass123!    │
│                                                             │
│  🏥 HOSPITALS (2)                                           │
│  ├─ Hospital 1: sample.hospital1@example.com / HospitalPass123! │
│  └─ Hospital 2: sample.hospital2@example.com / HospitalPass123! │
│                                                             │
│  👨‍💼 ADMIN (1)                                              │
│  └─ Admin: admin@lifechain.com / Admin@123456              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 👤 DONOR ACCOUNTS (3)

### Donor 1 - Rajesh Kumar
```
Email:    sample.donor1@example.com
Password: SamplePass123!

Profile:
- Name: Sample Donor 1
- Blood Group: A-
- Age: 29 years
- Weight: 56 kg
- Location: Mumbai, 400001
- Status: ✅ Eligible
```

### Donor 2 - Priya Sharma
```
Email:    sample.donor2@example.com
Password: SamplePass123!

Profile:
- Name: Sample Donor 2
- Blood Group: B+
- Age: 35 years
- Weight: 65 kg
- Location: Mumbai, 400001
- Status: ✅ Eligible
```

### Donor 3 - Amit Patel
```
Email:    sample.donor3@example.com
Password: SamplePass123!

Profile:
- Name: Sample Donor 3
- Blood Group: B-
- Age: 42 years
- Weight: 78 kg
- Location: Mumbai, 400001
- Status: ✅ Eligible
- Has existing donations: 3
```

---

## 🏥 HOSPITAL ACCOUNTS (2)

### Hospital 1 - City General Hospital
```
Email:    sample.hospital1@example.com
Password: HospitalPass123!

Profile:
- Name: City General Hospital
- Location: Mumbai, 500001
- Status: ✅ Verified
- Current Inventory: 7 blood units
```

### Hospital 2 - Metro Medical Center
```
Email:    sample.hospital2@example.com
Password: HospitalPass123!

Profile:
- Name: Metro Medical Center
- Location: Delhi, 110001
- Status: ✅ Verified
- Current Inventory: Multiple blood units
```

---

## 👨‍💼 ADMIN ACCOUNT (1)

### System Administrator
```
Email:    admin@lifechain.com
Password: Admin@123456

Access:
- Verify/Reject hospitals
- View system statistics
- Monitor all blood units
- Manage emergency requests
```

---

## 🎬 COMPLETE DEMO WORKFLOW

### Scene 1: Donor Registration & Profile (5 minutes)

**Use:** Donor 1 (sample.donor1@example.com)

1. Open: `http://localhost:5173`
2. Click "Login"
3. Enter Donor 1 credentials
4. **Show:**
   - ✅ Donor profile with eligibility status
   - ✅ Blood group badge (A-)
   - ✅ Age, weight, location
   - ✅ "Eligible" status in green
   - ✅ Donation history (may be empty)

**Talking Points:**
- "This is Rajesh, a registered blood donor"
- "System automatically checks eligibility: age 18-60, weight ≥50kg, 56 days since last donation"
- "All donor data is securely stored in MongoDB"

---

### Scene 2: Hospital Records Donation (5 minutes)

**Use:** Hospital 1 (sample.hospital1@example.com)

1. Logout from Donor 1
2. Login as Hospital 1
3. Go to "Record Donation" tab
4. **Demo Steps:**
   - Enter donor email: `sample.donor2@example.com`
   - Click "Search Donor"
   - **Show:** Donor details appear (Priya Sharma, B+, Eligible)
   - Select Blood Group: B+
   - Select Collection Date: Today
   - Click "Record Donation"

5. **Show Success:**
   - ✅ Success message with Blood Unit ID
   - ✅ "Blockchain: Pending" status
   - ✅ New blood unit created

**Talking Points:**
- "Hospital verifies donor eligibility before donation"
- "System generates unique Blood Unit ID"
- "Transaction is queued for blockchain recording"
- "Donor's last donation date is automatically updated"

---

### Scene 3: View Inventory (3 minutes)

**Use:** Hospital 1 (already logged in)

1. Click "Inventory" tab
2. **Show:**
   - ✅ List of blood units
   - ✅ Blood Unit ID, Blood Group, Collection Date
   - ✅ Expiry Date (42 days from collection)
   - ✅ Days Left (color-coded: green >7 days, yellow 3-7 days, red <3 days)
   - ✅ Status badges (Collected, Stored, Transferred, Used)

3. **Demo Filters:**
   - Select Blood Group: B+ → Shows only B+ units
   - Select Status: Stored → Shows only stored units
   - Clear filters → Shows all units

**Talking Points:**
- "Real-time inventory management"
- "Blood expires after 42 days"
- "Color-coded alerts for expiring units"
- "Filter by blood group and status"

---

### Scene 4: Transfer Blood Between Hospitals (5 minutes)

**Use:** Hospital 1 (already logged in)

1. Click "Transfer Blood" tab
2. **Demo Steps:**
   - Select Blood Unit: Choose any "Collected" or "Stored" unit
   - Select Destination: Metro Medical Center (Hospital 2)
   - Click "Transfer Blood"

3. **Show Success:**
   - ✅ Success message: "Blood unit transferred successfully!"
   - ✅ Shows: From City General Hospital → To Metro Medical Center
   - ✅ "Blockchain: Pending" status
   - ✅ Inventory automatically refreshes (unit removed)

4. **Verify Transfer:**
   - Go to "Inventory" tab
   - **Show:** Transferred unit is no longer in inventory

**Talking Points:**
- "Seamless blood transfer between hospitals"
- "Blockchain records the transfer for transparency"
- "Real-time inventory updates"
- "Transfer history is maintained"

---

### Scene 5: Record Blood Usage (3 minutes)

**Use:** Hospital 1 (already logged in)

1. Click "Record Usage" tab
2. **Demo Steps:**
   - Select Blood Unit: Choose any "Collected" or "Stored" unit
   - Enter Patient ID: `PAT-DEMO-001`
   - Click "Record Usage"

3. **Show Success:**
   - ✅ Success message: "Blood usage recorded successfully!"
   - ✅ Shows: Blood Unit ID and Patient ID
   - ✅ "Blockchain: Pending" status
   - ✅ Inventory refreshes (used unit removed)

**Talking Points:**
- "Track blood usage for patient care"
- "Links blood unit to patient ID"
- "Blockchain records usage for audit trail"
- "Used units are removed from available inventory"

---

### Scene 6: Emergency Request (5 minutes)

**Use:** Hospital 1 (already logged in)

1. Click "Emergency Requests" tab
2. Scroll to "Create Emergency Request" form
3. **Demo Steps:**
   - Blood Group: O+
   - Quantity: 3 units
   - Urgency: Critical
   - Notes: "Urgent need for surgery patient"
   - Click "Create Request"

4. **Show Success:**
   - ✅ Success message
   - ✅ Shows: "X donors notified" (AI-ranked donors)
   - ✅ New request appears in active requests list

5. **Show Active Requests:**
   - Request ID
   - Blood Group: O+
   - Quantity: 3
   - Urgency: Critical
   - Status: Active
   - Created Date

**Talking Points:**
- "AI system ranks donors by proximity and donation history"
- "Top 10 most suitable donors are notified via email"
- "Considers location, blood group, and eligibility"
- "Real-time emergency request management"

---

### Scene 7: AI Demand Prediction (5 minutes)

**Use:** Hospital 1 (already logged in)

1. Click "Demand Prediction" tab
2. **Demo Steps:**
   - Select Blood Group: O-
   - Click "Get Prediction"

3. **Show Results:**
   - ✅ 7-day forecast table
   - ✅ Day-by-day predicted demand
   - ✅ Current inventory count
   - ✅ Historical data points used
   - ✅ Confidence score (e.g., 75.5%)
   - ✅ Recommendation (e.g., "Inventory is sufficient" or "⚠️ Shortage expected")

**Talking Points:**
- "AI analyzes last 30 days of usage data"
- "Predicts demand for next 7 days"
- "Helps hospitals plan inventory"
- "Provides actionable recommendations"
- "Confidence score indicates prediction reliability"

---

### Scene 8: Donor Views Donation History (3 minutes)

**Use:** Donor 3 (sample.donor3@example.com)

1. Logout from Hospital 1
2. Login as Donor 3
3. **Hard Refresh:** Press Ctrl + Shift + R

4. **Show:**
   - ✅ Donor profile (Amit Patel, B-, 42 years)
   - ✅ Eligibility status
   - ✅ Donation history table with 3+ donations
   - ✅ Columns: Date, Blood Group, Hospital, Status, Blockchain, Certificate

5. **Demo Certificate:**
   - Click "Download Certificate" for any donation
   - **Show:** PDF certificate with:
     - Donor name
     - Blood group
     - Donation date
     - Hospital name
     - Blood Unit ID
     - QR code for verification

**Talking Points:**
- "Donors can track their donation history"
- "Each donation has a blockchain-verified certificate"
- "QR code allows instant verification"
- "Transparent record of all donations"

---

### Scene 9: Admin Panel - System Overview (5 minutes)

**Use:** Admin (admin@lifechain.com)

1. Logout from Donor 3
2. Login as Admin
3. Click "System Statistics" tab

4. **Show Statistics:**
   - ✅ Total Donors: 25
   - ✅ Verified Hospitals: 11
   - ✅ Total Blood Units: 65+
   - ✅ Active Emergency Requests: 5+

5. **Show Blood Units by Status:**
   - Collected: 3+
   - Stored: 19+
   - Transferred: 5+
   - Used: 38+

6. **Show Blood Units by Blood Group:**
   - A+, A-, B+, B-, AB+, AB-, O+, O- breakdown

7. **Show Pending Hospitals:**
   - Click "Pending Hospitals" tab
   - **Show:** "No pending hospital verifications" (all pre-verified)

**Talking Points:**
- "Admin has complete system visibility"
- "Real-time statistics and monitoring"
- "Can verify/reject hospital registrations"
- "Track blood supply across all hospitals"
- "Monitor emergency requests"

---

### Scene 10: Complete Flow Demonstration (5 minutes)

**Use:** All 3 browsers side-by-side

**Setup:**
- Browser 1 (Chrome): Hospital 1
- Browser 2 (Firefox): Donor 2
- Browser 3 (Edge): Admin

**Demo Flow:**

1. **Hospital Records Donation:**
   - Hospital 1 → Record Donation
   - Donor: sample.donor2@example.com
   - Blood Group: B+
   - **Show:** Success message

2. **Donor Sees Donation:**
   - Donor 2 → Refresh page (Ctrl + Shift + R)
   - **Show:** New donation appears in history

3. **Hospital Transfers Blood:**
   - Hospital 1 → Transfer Blood
   - Destination: Metro Medical Center
   - **Show:** Success message

4. **Admin Sees Updated Stats:**
   - Admin → System Statistics
   - **Show:** Numbers update (or click Refresh)

**Talking Points:**
- "Complete end-to-end workflow"
- "Real-time data synchronization"
- "All actions recorded on blockchain"
- "Transparent and auditable system"

---

## 🎯 KEY DEMO POINTS TO EMPHASIZE

### 1. Blockchain Integration
- Every donation, transfer, and usage is recorded on Polygon blockchain
- Immutable audit trail
- "Blockchain: Pending" status (normal with low MATIC)
- Can view transactions on Polygon Amoy explorer

### 2. AI-Powered Features
- Demand prediction using machine learning
- AI-ranked donor recommendations for emergencies
- Expiry alerts for blood units

### 3. Security & Access Control
- Role-based access (Donor, Hospital, Admin)
- JWT authentication
- Verified hospitals only can record donations
- Donors can only see their own data

### 4. Real-Time Updates
- Inventory updates immediately after actions
- Statistics refresh automatically
- Donation history syncs across system

### 5. User Experience
- Clean, intuitive interface
- Color-coded alerts and status badges
- Responsive design (works on mobile, tablet, desktop)
- Clear success/error messages

---

## 📸 SCREENSHOT CHECKLIST

Take screenshots of:
- [ ] Donor dashboard (profile + eligibility)
- [ ] Hospital inventory (with filters)
- [ ] Record donation success message
- [ ] Transfer blood success message
- [ ] Emergency request creation
- [ ] Demand prediction results
- [ ] Donor donation history
- [ ] Admin system statistics
- [ ] All 3 dashboards side-by-side

---

## ⏱️ DEMO TIMING

**Total Demo Time:** 40-45 minutes

- Introduction: 2 minutes
- Donor Dashboard: 5 minutes
- Hospital Features: 20 minutes
  - Record Donation: 5 min
  - Inventory: 3 min
  - Transfer: 5 min
  - Usage: 3 min
  - Emergency: 5 min
  - Demand Prediction: 5 min
- Donor History: 3 minutes
- Admin Panel: 5 minutes
- Complete Flow: 5 minutes
- Q&A: 5 minutes

---

## 💡 DEMO TIPS

### Before Demo:
1. ✅ Restart backend (to reset rate limit)
2. ✅ Clear browser cache
3. ✅ Open 3 browsers (Chrome, Firefox, Edge)
4. ✅ Test all credentials work
5. ✅ Have this guide open on second monitor

### During Demo:
1. 🗣️ Explain what you're doing before clicking
2. 👁️ Point out key features on screen
3. ⏸️ Pause after each action to show results
4. 🎯 Emphasize blockchain and AI features
5. 📊 Show real data (not just empty screens)

### If Something Goes Wrong:
1. **Rate limit error:** "This shows our security - we limit requests to prevent abuse"
2. **Blockchain pending:** "This is normal - transactions are queued when MATIC is low"
3. **Page not loading:** Hard refresh (Ctrl + Shift + R)
4. **Data not showing:** "Let me refresh to show real-time updates"

---

## 🚀 QUICK START DEMO

**5-Minute Quick Demo:**

1. **Login as Hospital 1** → Record donation for Donor 2
2. **Show Inventory** → Filter by blood group
3. **Transfer Blood** → To Hospital 2
4. **Login as Donor 3** → Show donation history
5. **Login as Admin** → Show system statistics

**Done!** ✅

---

## 📞 SUPPORT DURING DEMO

**If you need help:**
- Check browser console (F12) for errors
- Verify all services running (backend, AI, frontend)
- Use `backend/check-current-errors.js` to diagnose
- Restart backend if rate limited

---

**You're ready to demonstrate the complete LifeChain system!** 🎉

**Print this guide or keep it on a second monitor during your demo.**
