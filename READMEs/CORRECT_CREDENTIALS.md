# ✅ CORRECT Test Credentials - Use These!

## 🚀 Frontend URL
**http://localhost:5173**

**IMPORTANT**: Do a hard refresh (Ctrl+Shift+R) after logging in to see the logout button!

---

## 🔑 Working Credentials

### 🩸 DONOR (No Donations)
```
Email:    test.donor@example.com
Password: TestPassword123!
```

**What You'll See:**
- Profile: Test Donor, O+, Age 30, Weight 70kg, Mumbai
- Eligibility: Green "Eligible" box
- Donations: "No donations recorded yet."
- Logout: Red button in top right

---

### 🩸 DONOR (With 3 Donations)
```
Email:    donor.1772299902464@example.com
Password: password123
```

**What You'll See:**
- Profile: Michael Brown, O-, Age, Weight, Location
- Eligibility: Status based on last donation
- Donations: Table with 3 donations
  - Blockchain "View TX" links
  - Certificate "Download" buttons
- Logout: Red button in top right

---

### 🏥 HOSPITAL
```
Email:    test.hospital@example.com
Password: HospitalPass123!
```

**What You'll See:**
- Hospital Name: Test City Hospital
- Badge: Yellow "Pending Verification"
- Warning: Yellow box about pending verification
- Message: Placeholder for Task 27 features
- Logout: Red button in top right

**Note**: This hospital is NOT verified and cannot record donations yet.

---

### 👨‍💼 ADMIN
```
Email:    admin@lifechain.com
Password: Admin@123456
```

**What You'll See:**
- Name: Admin
- Message: Placeholder for Task 28 features
- Logout: Red button in top right

---

## ⚡ Quick Test Flow (5 minutes)

### 1. Test Donor
```
1. Go to http://localhost:5173
2. Login: test.donor@example.com / TestPassword123!
3. Hard refresh: Ctrl+Shift+R
4. Verify: Profile, Green eligibility, Empty donations, Red logout button
5. Click: Logout
```

### 2. Test Donor with Donations
```
1. Login: donor.1772299902464@example.com / password123
2. Hard refresh: Ctrl+Shift+R
3. Verify: Profile, Donation table with 3 rows, Download buttons
4. Click: Download certificate (PDF should download)
5. Click: Logout
```

### 3. Test Hospital
```
1. Login: test.hospital@example.com / HospitalPass123!
2. Hard refresh: Ctrl+Shift+R
3. Verify: Hospital name, Yellow "Pending" badge, Warning box, Red logout button
4. Click: Logout
```

### 4. Test Admin
```
1. Login: admin@lifechain.com / Admin@123456
2. Hard refresh: Ctrl+Shift+R
3. Verify: "Admin" name, Placeholder message, Red logout button
4. Click: Logout
```

---

## 🎯 Expected Results by Role

### 🩸 Donor Dashboard (test.donor@example.com)

**Navigation Bar:**
```
LifeChain  Donor Dashboard          Test Donor  [Logout]
                                                  ↑ Red button
```

**Profile Section:**
```
My Profile
┌─────────────────────────────────────────┐
│ Name: Test Donor                        │
│ Email: test.donor@example.com           │
│ Blood Group: O+ ← Red color             │
│ Age: 30 years                           │
│ Weight: 70 kg                           │
│ Location: Mumbai, 400001                │
└─────────────────────────────────────────┘
```

**Eligibility:**
```
┌─────────────────────────────────────────┐
│ Eligible ← Green box                    │
│ You are eligible to donate blood!      │
└─────────────────────────────────────────┘
```

**Donations:**
```
No donations recorded yet.
```

---

### 🩸 Donor with Donations (Michael Brown)

**Donation History Table:**
```
Date       Blood  Hospital              Status  Blockchain  Certificate
12/29/24   O-     Emergency Medical     Used    View TX     Download
12/29/24   O-     Emergency Medical     Stored  Pending     Download
12/29/24   O-     Other Hospital        Stored  Pending     Download
```

---

### 🏥 Hospital Dashboard

**Navigation Bar:**
```
LifeChain  Hospital Dashboard
           Test City Hospital [Pending] [Logout]
                               ↑ Yellow  ↑ Red
```

**Content:**
```
Welcome, Test City Hospital!

┌─────────────────────────────────────────┐
│ ⚠️  Your hospital account is pending    │ ← Yellow box
│    admin verification. You'll be able   │
│    to access all features once approved.│
└─────────────────────────────────────────┘
```

---

### 👨‍💼 Admin Panel

**Navigation Bar:**
```
LifeChain  Admin Panel                  Admin  [Logout]
                                                 ↑ Red button
```

**Content:**
```
Admin Panel

Admin panel is being built. You'll be able to 
verify hospitals and view system statistics here.
```

---

## 🐛 Troubleshooting

### Logout Button Not Visible?
1. **Hard refresh**: Ctrl + Shift + R (this loads the new CSS)
2. **Clear cache**: Ctrl + Shift + Delete
3. **Restart frontend**: Stop (Ctrl+C) and run `npm run dev` again

### Login Shows "Invalid credentials"?
**Use these EXACT passwords:**
- Donor: `TestPassword123!`
- Hospital: `HospitalPass123!`
- Admin: `Admin@123456`

### Dashboard Blank or Shows Error?
1. Open browser console (F12)
2. Check for red error messages
3. Check Network tab for failed API calls
4. Verify backend is running: http://localhost:5000/api/health

---

## ✅ Success Checklist

Test each role and check off:

**Donor (test.donor@example.com):**
- [ ] Login successful
- [ ] Profile displays correctly
- [ ] Green "Eligible" status shows
- [ ] "No donations" message shows
- [ ] Red logout button visible
- [ ] Logout works

**Donor with Donations (donor.1772299902464@example.com):**
- [ ] Login successful
- [ ] Profile displays correctly
- [ ] Donation table shows 3 rows
- [ ] "Download" buttons visible
- [ ] Certificate downloads as PDF
- [ ] Red logout button visible
- [ ] Logout works

**Hospital (test.hospital@example.com):**
- [ ] Login successful
- [ ] Hospital name shows in navigation
- [ ] Yellow "Pending Verification" badge visible
- [ ] Yellow warning box displays
- [ ] Red logout button visible
- [ ] Logout works

**Admin (admin@lifechain.com):**
- [ ] Login successful
- [ ] "Admin" name shows in navigation
- [ ] Placeholder message displays
- [ ] Red logout button visible
- [ ] Logout works

---

## 🎉 All Tests Pass?

If all checkboxes are complete, you've successfully verified Tasks 25-26!

**Ready for Task 27?** The Hospital Dashboard with full inventory management, donation recording, and more!
