# Hospital Dashboard - Testing Guide

## 🏥 Login Credentials

**Verified Hospital** (needed for testing):
```
Email:    test.hospital@example.com
Password: HospitalPass123!
Status:   NOT VERIFIED (needs admin approval first)
```

**Note**: You need to verify this hospital as admin before you can use the dashboard features!

---

## ⚠️ Important: Hospital Must Be Verified First!

Before you can test the hospital dashboard features, you need to:

1. **Login as Admin**:
   - Email: `admin@lifechain.com`
   - Password: `Admin@123456`

2. **Verify the hospital** (via backend API for now, Task 28 will add UI):
   ```bash
   # Run this script to verify the hospital:
   node -e "
   const axios = require('axios');
   (async () => {
     // Login as admin
     const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
       email: 'admin@lifechain.com',
       password: 'Admin@123456'
     });
     const token = loginRes.data.token;
     
     // Get pending hospitals
     const hospitalsRes = await axios.get('http://localhost:5000/api/admin/pending-hospitals', {
       headers: { Authorization: \`Bearer \${token}\` }
     });
     
     // Find test.hospital@example.com
     const hospital = hospitalsRes.data.hospitals.find(h => h.email === 'test.hospital@example.com');
     
     if (hospital) {
       // Verify it
       await axios.post(\`http://localhost:5000/api/admin/verify-hospital/\${hospital._id}\`, {}, {
         headers: { Authorization: \`Bearer \${token}\` }
       });
       console.log('✅ Hospital verified!');
     } else {
       console.log('❌ Hospital not found in pending list');
     }
   })();
   "
   ```

3. **Logout and login as hospital again** to see the full dashboard

---

## 🎯 Hospital Dashboard Features

Once verified, you'll see 6 tabs:

### 1. Inventory Tab
**What it shows:**
- Table of all blood units in your hospital
- Columns: Blood Unit ID, Blood Group, Collection Date, Expiry Date, Days Left, Status
- Color-coded expiry warnings:
  - Red: <3 days until expiry (urgent!)
  - Yellow: 3-7 days until expiry
  - Green: >7 days until expiry
- Filters: Blood Group, Status
- Refresh button

**How to test:**
- Select different blood groups from filter
- Select different statuses (Collected, Stored, etc.)
- Click Refresh to reload data

---

### 2. Record Donation Tab
**What it does:**
- Records a new blood donation from a donor
- Validates donor eligibility
- Creates blockchain record

**Form fields:**
- Donor Email (with Search button)
- Blood Group (dropdown)
- Collection Date (date picker)

**How to test:**
1. Enter donor email: `test.donor@example.com`
2. Click "Search" to validate donor
3. Select blood group: `O+`
4. Select collection date: Today's date
5. Click "Record Donation"
6. Success message shows Blood Unit ID and blockchain TX hash

---

### 3. Transfer Blood Tab
**What it does:**
- Transfers a blood unit to another hospital
- Records transfer on blockchain

**Form fields:**
- Blood Unit ID (dropdown - only Stored/Collected units)
- Destination Hospital (dropdown)

**How to test:**
1. Select a blood unit from dropdown
2. Select destination hospital
3. Click "Transfer Blood Unit"
4. Success message shows blockchain TX hash
5. Inventory updates automatically

---

### 4. Record Usage Tab
**What it does:**
- Marks a blood unit as used for a patient
- Records usage on blockchain

**Form fields:**
- Blood Unit ID (dropdown - only Stored/Collected units)
- Patient ID (text input)

**How to test:**
1. Select a blood unit from dropdown
2. Enter patient ID: `PAT-12345`
3. Click "Record Usage"
4. Success message shows blockchain TX hash
5. Inventory updates automatically

---

### 5. Emergency Requests Tab
**What it does:**
- Creates emergency blood requests
- Notifies eligible donors via email
- Shows active emergency requests
- Allows marking requests as fulfilled

**Create Request Form:**
- Blood Group (dropdown)
- Quantity (number)
- Urgency Level (Critical/High/Medium)
- Notes (optional text)

**How to test:**
1. Select blood group: `O+`
2. Enter quantity: `2`
3. Select urgency: `Critical`
4. Enter notes: `Emergency surgery patient`
5. Click "Create Emergency Request"
6. Success message shows number of donors notified
7. Request appears in "Active Emergency Requests" list below
8. Click "Mark Fulfilled" to close the request

---

### 6. Demand Prediction Tab
**What it does:**
- Uses AI to predict blood demand for next 7 days
- Shows confidence score
- Provides recommendations

**How to test:**
1. Select blood group: `O+`
2. Click "Get Prediction"
3. See 7-day forecast (Day 1-7 with predicted units)
4. See recommendation message
5. See confidence score percentage

---

## 📊 Expected Visuals

### Navigation Bar (Verified Hospital)
```
┌──────────────────────────────────────────────────────────────┐
│ LifeChain  Hospital Dashboard                                │
│                    Test City Hospital  [Logout]              │
│                                         ↑ Red button         │
└──────────────────────────────────────────────────────────────┘
```

### Tab Navigation
```
┌──────────────────────────────────────────────────────────────┐
│ [Inventory] [Record Donation] [Transfer Blood] [Record Usage]│
│ [Emergency Requests] [Demand Prediction]                     │
│  ↑ Active tab has red underline                              │
└──────────────────────────────────────────────────────────────┘
```

### Inventory Table Example
```
Blood Unit ID          Blood  Collection  Expiry     Days Left  Status
BU-1234-abcd          O+     01/15/2026  02/26/2026  15 days   Stored
                                                      (green)   (purple)
BU-5678-efgh          A+     03/01/2026  04/12/2026  32 days   Collected
                                                      (green)   (blue)
BU-9012-ijkl          B-     03/08/2026  04/19/2026  2 days    Stored
                                                      (red!)    (purple)
```

---

## ✅ Testing Checklist

### Before Testing
- [ ] Backend running on port 5000
- [ ] AI Service running on port 5001
- [ ] Frontend running on port 5173
- [ ] Hospital verified by admin

### Inventory Tab
- [ ] Table displays blood units
- [ ] Blood group filter works
- [ ] Status filter works
- [ ] Expiry colors show correctly (red/yellow/green)
- [ ] Refresh button works

### Record Donation Tab
- [ ] Can enter donor email
- [ ] Search button validates donor
- [ ] Blood group dropdown works
- [ ] Date picker works
- [ ] Form submits successfully
- [ ] Success message shows Blood Unit ID
- [ ] Error shows if donor ineligible

### Transfer Blood Tab
- [ ] Blood unit dropdown shows available units
- [ ] Hospital dropdown shows other hospitals
- [ ] Form submits successfully
- [ ] Success message shows TX hash
- [ ] Inventory updates after transfer

### Record Usage Tab
- [ ] Blood unit dropdown shows available units
- [ ] Patient ID input works
- [ ] Form submits successfully
- [ ] Success message shows TX hash
- [ ] Inventory updates after usage

### Emergency Requests Tab
- [ ] Create form displays all fields
- [ ] Blood group dropdown works
- [ ] Quantity input works
- [ ] Urgency dropdown works
- [ ] Notes textarea works
- [ ] Form submits successfully
- [ ] Success shows donors notified count
- [ ] Active requests list displays
- [ ] "Mark Fulfilled" button works

### Demand Prediction Tab
- [ ] Blood group selector works
- [ ] "Get Prediction" button works
- [ ] 7-day forecast displays
- [ ] Recommendation shows
- [ ] Confidence score displays
- [ ] Handles AI service errors gracefully

---

## 🐛 Troubleshooting

### Issue: All tabs show "Pending Verification" warning
**Solution**: Hospital needs to be verified by admin first (see script above)

### Issue: Inventory is empty
**Solution**: Record a donation first using the "Record Donation" tab

### Issue: Transfer/Usage dropdowns are empty
**Solution**: You need blood units in "Stored" or "Collected" status first

### Issue: Demand prediction fails
**Solution**: Make sure AI Service is running on port 5001

### Issue: Emergency request creation fails
**Solution**: Check that all required fields are filled

---

## 🎉 Success Criteria

Hospital Dashboard is working when:
- ✅ All 6 tabs are visible and clickable
- ✅ Inventory displays blood units with color-coded expiry
- ✅ Can record donations for eligible donors
- ✅ Can transfer blood units to other hospitals
- ✅ Can record blood usage for patients
- ✅ Can create emergency requests
- ✅ Can view AI demand predictions
- ✅ All forms submit successfully
- ✅ Success/error messages display correctly
- ✅ Inventory updates after operations

---

## 📝 Test Scenario: Complete Hospital Workflow

### Step 1: Record a Donation (2 min)
1. Go to "Record Donation" tab
2. Enter: `test.donor@example.com`
3. Click "Search"
4. Select blood group: `O+`
5. Select today's date
6. Click "Record Donation"
7. Note the Blood Unit ID from success message

### Step 2: View Inventory (1 min)
1. Go to "Inventory" tab
2. See the new blood unit in the table
3. Note the expiry date (42 days from collection)
4. Status should be "Collected" (blue badge)

### Step 3: Transfer Blood (2 min)
1. Go to "Transfer Blood" tab
2. Select the blood unit you just created
3. Select a destination hospital
4. Click "Transfer Blood Unit"
5. Go back to Inventory - unit should show "Transferred" status

### Step 4: Record Usage (2 min)
1. Record another donation (repeat Step 1)
2. Go to "Record Usage" tab
3. Select the new blood unit
4. Enter patient ID: `PAT-TEST-001`
5. Click "Record Usage"
6. Go to Inventory - unit should show "Used" status (green)

### Step 5: Create Emergency Request (2 min)
1. Go to "Emergency Requests" tab
2. Select blood group: `AB+`
3. Enter quantity: `3`
4. Select urgency: `Critical`
5. Enter notes: `Emergency surgery - multiple trauma patients`
6. Click "Create Emergency Request"
7. See success message with donors notified count
8. See request in "Active Emergency Requests" list

### Step 6: Check Demand Prediction (1 min)
1. Go to "Demand Prediction" tab
2. Select blood group: `O+`
3. Click "Get Prediction"
4. See 7-day forecast with predicted units per day
5. See recommendation message
6. See confidence score

---

## 🚀 Ready for Task 28!

Once you've tested all hospital dashboard features, you're ready for Task 28: Admin Panel with hospital verification UI and system statistics!
