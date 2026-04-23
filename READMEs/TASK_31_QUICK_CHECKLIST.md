# ✅ Task 31 Quick Checklist

Print this or keep it open while testing!

---

## 🔧 PHASE 1: SETUP (5 min)

```bash
# Terminal 1
cd backend
node clear-retry-queue.js          # ✅ Clear 28 failed transactions
node populate-sample-data.js       # ✅ Create sample data
node check-retry-queue.js          # ✅ Verify queue empty
```

**Expected:** 
- 28 transactions cleared
- 10 donors, 3 hospitals, 15 blood units created
- Retry queue empty

---

## 🚀 PHASE 2: START SERVICES (if not running)

```bash
# Terminal 2
cd backend && npm start             # Port 5000

# Terminal 3
cd ai-service && python app.py     # Port 5001

# Terminal 4
cd frontend && npm run dev         # Port 5173
```

---

## 🌐 PHASE 3: MULTI-TAB LOGIN (5 min)

### Tab 1: DONOR (Chrome Regular)
```
URL: http://localhost:5173
Email: sample.donor1@example.com
Password: SamplePass123!
```
- [ ] Profile shows
- [ ] Eligibility: Eligible
- [ ] Donation history visible

### Tab 2: HOSPITAL (Chrome Incognito)
```
URL: http://localhost:5173
Email: sample.hospital1@example.com
Password: HospitalPass123!
```
- [ ] 6 tabs visible
- [ ] Inventory shows 15 units
- [ ] Verified badge shows

### Tab 3: ADMIN (Firefox/Edge)
```
URL: http://localhost:5173
Email: admin@lifechain.com
Password: Admin@123456
```
- [ ] Statistics show
- [ ] Total donors: 74
- [ ] Total hospitals: 63

---

## 🧪 PHASE 4: TEST DASHBOARDS (20 min)

### DONOR DASHBOARD (Tab 1)
- [ ] Profile displays (name, blood group, age, weight)
- [ ] Eligibility status shows (Eligible/Ineligible)
- [ ] Donation history table shows
- [ ] Certificate download works (if donations exist)
- [ ] Screenshot taken ✅

### HOSPITAL DASHBOARD (Tab 2)

#### Inventory Tab
- [ ] 15 blood units show
- [ ] Blood group filter works
- [ ] Status filter works
- [ ] Expiry colors correct (red/yellow/green)
- [ ] Screenshot taken ✅

#### Record Donation Tab
- [ ] Search donor: sample.donor1@example.com
- [ ] Donor details show
- [ ] Record donation successful
- [ ] New unit appears in inventory
- [ ] Screenshot taken ✅

#### Transfer Blood Tab
- [ ] Select blood unit
- [ ] Select destination hospital
- [ ] Transfer successful
- [ ] Status changed to "Transferred"

#### Record Usage Tab
- [ ] Select blood unit
- [ ] Enter patient ID: PAT-TEST-001
- [ ] Usage recorded successfully
- [ ] Unit removed from inventory

#### Emergency Requests Tab
- [ ] 2 existing requests show
- [ ] Create new request (O+, Qty: 3, Critical)
- [ ] Shows "X donors notified"
- [ ] Mark fulfilled works
- [ ] Screenshot taken ✅

#### Demand Prediction Tab
- [ ] Select blood group: A+
- [ ] 7-day forecast shows
- [ ] Confidence score shows
- [ ] Recommendation shows
- [ ] Screenshot taken ✅

### ADMIN PANEL (Tab 3)

#### System Statistics Tab
- [ ] Total donors: 74
- [ ] Verified hospitals: 63
- [ ] Total blood units: 15+
- [ ] Active emergencies: 3
- [ ] Blood units by status breakdown
- [ ] Blood units by blood group breakdown
- [ ] Auto-refresh works (wait 30 sec)
- [ ] Manual refresh works
- [ ] Screenshot taken ✅

#### Pending Hospitals Tab
- [ ] Shows "No pending hospitals" (or list if any)
- [ ] Approve/reject works (if testing)

---

## 🎬 PHASE 5: COMPLETE WORKFLOW DEMO (10 min)

**Arrange 3 browser windows side by side**

- [ ] 1. Admin: Show statistics
- [ ] 2. Hospital: Show inventory
- [ ] 3. Donor: Show profile
- [ ] 4. Hospital: Record donation (sample.donor2)
- [ ] 5. Donor: Refresh, see new donation
- [ ] 6. Hospital: Transfer blood unit
- [ ] 7. Hospital: Record usage
- [ ] 8. Hospital: Create emergency request
- [ ] 9. Hospital: Predict demand
- [ ] 10. Admin: Show updated statistics
- [ ] Screenshot all 3 tabs ✅

---

## 📝 PHASE 6: DOCUMENTATION (5 min)

- [ ] Create test report (TASK_31_TEST_REPORT.md)
- [ ] Save all screenshots
- [ ] Document any issues found
- [ ] Mark Task 31 complete

---

## ✅ COMPLETION CRITERIA

Task 31 is COMPLETE when ALL checked:

### Setup
- [ ] Retry queue cleared (28 transactions)
- [ ] Sample data populated
- [ ] Retry queue verified empty

### Services
- [ ] Backend running (5000)
- [ ] AI service running (5001)
- [ ] Frontend running (5173)

### Testing
- [ ] Donor dashboard tested ✅
- [ ] Hospital dashboard tested (all 6 tabs) ✅
- [ ] Admin panel tested ✅
- [ ] Multi-tab login verified ✅
- [ ] Complete workflow demonstrated ✅

### Documentation
- [ ] Screenshots saved (minimum 7)
- [ ] Test report created
- [ ] Issues documented

---

## 🎯 QUICK REFERENCE

### Sample Credentials

**Donors:**
- sample.donor1@example.com / SamplePass123!
- sample.donor2@example.com / SamplePass123!
- sample.donor3@example.com / SamplePass123!

**Hospitals:**
- sample.hospital1@example.com / HospitalPass123!
- sample.hospital2@example.com / HospitalPass123!
- sample.hospital3@example.com / HospitalPass123!

**Admin:**
- admin@lifechain.com / Admin@123456

### Useful Commands

```bash
# Check retry queue
node backend/check-retry-queue.js

# Clear retry queue
node backend/clear-retry-queue.js

# Populate data
node backend/populate-sample-data.js
```

---

## 🚨 COMMON ISSUES

| Issue | Quick Fix |
|-------|-----------|
| Can't see sample data | Re-run populate-sample-data.js |
| Retry queue growing | Run clear-retry-queue.js |
| Can't login multiple tabs | Use different browsers |
| Old data showing | Hard refresh (Ctrl+Shift+R) |

---

## 📊 PROGRESS

**Current:** Task 31 (Testing) - IN PROGRESS
**Completed:** 30/35 tasks (86%)
**Remaining:** 4 tasks (Deployment + Final Testing)

---

## 🎉 WHEN COMPLETE

Mark Task 31 complete and proceed to:
- **Task 32:** Deployment Preparation
- **Task 33:** Deploy to Production
- **Task 34:** Final Testing
- **Task 35:** System Complete! 🚀

---

**Start Time:** ___________
**End Time:** ___________
**Duration:** ___________
**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

---

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
