# LifeChain - Complete Testing Guide (Tasks 25-26)

## 🚀 Quick Start

**Frontend**: http://localhost:5173

**Important**: After the CSS fix, do a **hard refresh** (Ctrl+Shift+R) to see the logout button!

---

## 🔑 Test Credentials

### 🩸 Donor Accounts

#### Test Donor (No Donations)
```
Email:    test.donor@example.com
Password: TestPassword123!
```

#### Donors with Donation History

**Alice Johnson (2 donations)**
```
Email:    donor.1772297592252@example.com
Password: password123
Blood:    B+
```

**Michael Brown (3 donations)**
```
Email:    donor.1772299902464@example.com
Password: password123
Blood:    O-
```

**Sarah Williams (1 donation)**
```
Email:    donor.1772299940625@example.com
Password: password123
Blood:    AB+
```

---

### 🏥 Hospital Account
```
Email:    test.hospital@example.com
Password: HospitalPass123!
Status:   NOT VERIFIED (pending admin approval)
```

---

### 👨‍💼 Admin Account
```
Email:    admin@lifechain.com
Password: Admin@123456
```

---

## 📋 What You'll See for Each Role

### 🩸 DONOR DASHBOARD

**Navigation Bar:**
- "LifeChain" logo (red, bold)
- "Donor Dashboard" label
- Donor name (e.g., "Test Donor")
- **Red "Logout" button** ← Should be visible!

**Profile Section:**
- Name, Email, Blood Group (red text), Age, Weight, Location
- All information displayed in a clean grid layout

**Eligibility Status:**
- **Green box** with "Eligible" text (if eligible)
- **Red box** with "Ineligible" text (if donated recently)
- Days since last donation
- Next eligible date (if ineligible)

**Donation History:**
- **If no donations**: "No donations recorded yet."
- **If has donations**: Table with:
  - Date, Blood Group, Hospital, Status, Blockchain link, Certificate download

**Example with Donations** (login as Michael Brown):
```
Date         Blood Group  Hospital                  Status      Blockchain  Certificate
12/29/2024   O-          Emergency Medical Center   Used        View TX     Download
12/29/2024   O-          Emergency Medical Center   Stored      Pending     Download
12/29/2024   O-          Other Hospital            Stored      Pending     Download
```

---

### 🏥 HOSPITAL DASHBOARD

**Navigation Bar:**
- "LifeChain" logo (red, bold)
- "Hospital Dashboard" label
- Hospital name: "Test City Hospital"
- **Yellow "Pending Verification" badge**
- **Red "Logout" button** ← Should be visible!

**Dashboard Content:**
- Welcome message: "Welcome, Test City Hospital!"
- **Yellow warning box**: "Your hospital account is pending admin verification. You'll be able to access all features once approved."
- Placeholder message about features coming soon

**Note**: Since this hospital is NOT verified:
- Cannot record donations
- Cannot view inventory
- Cannot transfer blood
- Cannot record usage
- Must wait for admin verification

---

### 👨‍💼 ADMIN PANEL

**Navigation Bar:**
- "LifeChain" logo (red, bold)
- "Admin Panel" label
- "Admin" name
- **Red "Logout" button** ← Should be visible!

**Dashboard Content:**
- "Admin Panel" heading
- Placeholder message: "Admin panel is being built. You'll be able to verify hospitals and view system statistics here."

**Coming in Task 28:**
- List of pending hospitals
- Verify/Reject buttons
- System statistics
- User management

---

## 🧪 Step-by-Step Testing

### Test 1: Donor with No Donations (5 minutes)

1. **Login**:
   - Go to http://localhost:5173
   - Email: `test.donor@example.com`
   - Password: `TestPassword123!`
   - Click "Sign in"

2. **Verify Dashboard**:
   - [ ] Navigation shows "Test Donor" and red Logout button
   - [ ] Profile section shows all information correctly
   - [ ] Blood Group "O+" is in red color
   - [ ] Eligibility shows green "Eligible" box
   - [ ] Donation history shows "No donations recorded yet."

3. **Test Logout**:
   - [ ] Click red "Logout" button
   - [ ] Redirected to login page
   - [ ] Try to go back to `/donor/dashboard`
   - [ ] Should redirect to login (not authenticated)

4. **Test Session Persistence**:
   - [ ] Login again
   - [ ] Refresh page (F5)
   - [ ] Should stay logged in

---

### Test 2: Donor with Donations (5 minutes)

1. **Login**:
   - Email: `donor.1772299902464@example.com`
   - Password: `password123`

2. **Verify Dashboard**:
   - [ ] Profile shows "Michael Brown", Blood Group "O-"
   - [ ] Eligibility status displayed
   - [ ] Donation history shows **3 donations** in table
   - [ ] Each donation has Date, Blood Group, Hospital, Status
   - [ ] Blockchain column shows "View TX" links or "Pending"
   - [ ] Certificate column shows "Download" buttons

3. **Test Certificate Download**:
   - [ ] Click "Download" button for any donation
   - [ ] PDF file downloads automatically
   - [ ] Open PDF → Should show certificate with QR code

4. **Test Blockchain Link**:
   - [ ] Click "View TX" link (if available)
   - [ ] Opens Polygon Amoy explorer in new tab
   - [ ] Shows transaction details

---

### Test 3: Hospital Account (3 minutes)

1. **Login**:
   - Logout from donor account
   - Email: `test.hospital@example.com`
   - Password: `HospitalPass123!`

2. **Verify Dashboard**:
   - [ ] Navigation shows "Test City Hospital"
   - [ ] Yellow "Pending Verification" badge visible
   - [ ] Red "Logout" button visible
   - [ ] Yellow warning box about pending verification
   - [ ] Placeholder message displayed

3. **Test Access Control**:
   - [ ] Try to access: `http://localhost:5173/donor/dashboard`
   - [ ] Should redirect to `/unauthorized`
   - [ ] Page shows "Unauthorized Access" message

---

### Test 4: Admin Account (3 minutes)

1. **Login**:
   - Logout from hospital account
   - Email: `admin@lifechain.com`
   - Password: `Admin@123456`

2. **Verify Dashboard**:
   - [ ] Navigation shows "Admin" name
   - [ ] Red "Logout" button visible
   - [ ] "Admin Panel" heading displayed
   - [ ] Placeholder message about features coming

3. **Test Access Control**:
   - [ ] Try to access: `http://localhost:5173/donor/dashboard`
   - [ ] Should redirect to `/unauthorized`
   - [ ] Try to access: `http://localhost:5173/hospital/dashboard`
   - [ ] Should redirect to `/unauthorized`

---

### Test 5: Registration Flow (5 minutes)

1. **Logout completely**

2. **Register New Donor**:
   - Click "create a new account"
   - Select role: "Donor"
   - Fill in all fields:
     - Email: `newdonor@test.com`
     - Password: `Test@1234`
     - Confirm Password: `Test@1234`
     - Wallet: `0x1234567890123456789012345678901234567890`
     - Name: `New Test Donor`
     - Blood Group: `A+`
     - Date of Birth: `1995-01-01`
     - Weight: `65`
     - City: `Delhi`
     - Pincode: `110001`
   - Click "Create Account"
   - [ ] Automatically logged in
   - [ ] Redirected to donor dashboard
   - [ ] Profile shows your information
   - [ ] Eligibility shows "Eligible"

3. **Register New Hospital**:
   - Logout and click "create a new account"
   - Select role: "Hospital"
   - Fill in all fields:
     - Email: `newhospital@test.com`
     - Password: `Test@1234`
     - Confirm Password: `Test@1234`
     - Wallet: `0x9999999999999999999999999999999999999999`
     - Hospital Name: `New Test Hospital`
     - City: `Delhi`
     - Pincode: `110001`
   - Click "Create Account"
   - [ ] Automatically logged in
   - [ ] Redirected to hospital dashboard
   - [ ] Shows "Pending Verification" badge

---

## 🎨 Visual Elements to Verify

### Colors
- **Red (#dc2626)**: Logo, blood group, logout button, links
- **Dark Red (#991b1b)**: Hover states
- **Green**: Eligible status
- **Yellow**: Pending verification, warnings
- **Blue**: Collected status, blockchain links
- **Purple**: Stored status
- **Gray**: Secondary text, borders

### Layout
- **Responsive**: Should work on different screen sizes
- **Spacing**: Clean padding and margins
- **Shadows**: Cards have subtle shadows
- **Rounded corners**: Buttons and cards have rounded edges

### Typography
- **Headings**: Bold, larger text
- **Labels**: Small, gray text
- **Values**: Medium weight, darker text
- **Buttons**: Medium weight, white text on colored background

---

## 🐛 Common Issues & Solutions

### Issue 1: Logout Button Not Visible
**Symptoms**: Can see name but no logout button
**Solution**: 
1. Hard refresh: Ctrl + Shift + R
2. Check if button is white text on white background (CSS issue)
3. Restart frontend dev server

### Issue 2: Dashboard Shows "Loading..." Forever
**Symptoms**: Stuck on loading screen
**Solution**:
1. Open browser console (F12)
2. Check for API errors
3. Verify backend is running: http://localhost:5000/api/health
4. Check Network tab for failed requests

### Issue 3: Colors Not Showing
**Symptoms**: Everything is black/white/gray
**Solution**:
1. Hard refresh: Ctrl + Shift + R
2. Clear browser cache
3. Restart frontend dev server
4. Check console for CSS loading errors

### Issue 4: Login Fails
**Symptoms**: "Invalid email or password" error
**Solution**:
1. Double-check password (case-sensitive!)
2. Make sure you're using the correct password for each account
3. Check backend logs for errors

### Issue 5: API Calls Fail
**Symptoms**: Error messages in dashboard
**Solution**:
1. Check backend is running: http://localhost:5000/api/health
2. Check CORS configuration in backend
3. Verify `.env` file has correct API URL
4. Check browser console for CORS errors

---

## 📊 Testing Summary

### ✅ What Should Work (Tasks 25-26)

**Authentication:**
- [x] Donor registration
- [x] Hospital registration
- [x] Login for all roles
- [x] Logout for all roles
- [x] Session persistence
- [x] JWT token management

**Donor Dashboard:**
- [x] Profile display
- [x] Eligibility status
- [x] Donation history (empty or with data)
- [x] Certificate download (when donations exist)
- [x] Blockchain links (when transactions exist)

**Hospital Dashboard:**
- [x] Verification status display
- [x] Warning message for unverified hospitals
- [x] Placeholder for features coming in Task 27

**Admin Panel:**
- [x] Placeholder for features coming in Task 28

**Access Control:**
- [x] Role-based route protection
- [x] Unauthorized redirects
- [x] Login required for protected routes

---

## 🎯 Testing Checklist

Complete this checklist to verify Tasks 25-26:

### Authentication
- [ ] Can register as donor
- [ ] Can register as hospital
- [ ] Can login as donor
- [ ] Can login as hospital
- [ ] Can login as admin
- [ ] Logout button visible for all roles
- [ ] Logout works correctly
- [ ] Session persists after refresh

### Donor Dashboard
- [ ] Profile information displays correctly
- [ ] Eligibility status shows with correct color
- [ ] Donation history section visible
- [ ] Empty state message shows when no donations
- [ ] Donation table shows when donations exist
- [ ] Certificate download works
- [ ] Blockchain links work

### Hospital Dashboard
- [ ] Hospital name displays in navigation
- [ ] Verification status badge shows
- [ ] Warning message displays for unverified hospitals
- [ ] Placeholder message shows

### Admin Panel
- [ ] Admin name displays in navigation
- [ ] Placeholder message shows

### Access Control
- [ ] Donor cannot access hospital dashboard
- [ ] Donor cannot access admin panel
- [ ] Hospital cannot access donor dashboard
- [ ] Hospital cannot access admin panel
- [ ] Unauthenticated users redirected to login

---

## 💡 Pro Testing Tips

1. **Use Browser DevTools** (F12):
   - Console: Check for JavaScript errors
   - Network: Monitor API calls and responses
   - Application: View localStorage (token and user data)

2. **Test in Incognito Mode**:
   - Verifies fresh session behavior
   - No cached data interference

3. **Test Different Browsers**:
   - Chrome, Firefox, Edge
   - Ensures cross-browser compatibility

4. **Check Mobile Responsiveness**:
   - Open DevTools → Toggle device toolbar
   - Test on different screen sizes

---

## 🎉 Success Criteria

You've successfully completed Tasks 25-26 when:

✅ All three roles can login and see their respective dashboards
✅ Logout button is visible and works for all roles
✅ Donor dashboard shows complete profile and eligibility
✅ Donor with donations can see history and download certificates
✅ Hospital dashboard shows verification status
✅ Admin panel loads correctly
✅ Role-based access control prevents unauthorized access
✅ No errors in browser console

---

## 📸 Expected Visuals

### Donor Dashboard (test.donor@example.com)
```
┌──────────────────────────────────────────────────────────────┐
│ LifeChain  Donor Dashboard          Test Donor  [Logout]    │ ← Red button
└──────────────────────────────────────────────────────────────┘

My Profile
┌──────────────────────────────────────────────────────────────┐
│ Name              Email                                       │
│ Test Donor        test.donor@example.com                     │
│                                                               │
│ Blood Group       Age                                         │
│ O+                30 years                                    │ ← Red text
│                                                               │
│ Weight            Location                                    │
│ 70 kg             Mumbai, 400001                             │
└──────────────────────────────────────────────────────────────┘

Eligibility Status
┌──────────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Eligible                                  [GREEN BOX]  │  │
│ │ You are eligible to donate blood!                      │  │
│ └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

Donation History
┌──────────────────────────────────────────────────────────────┐
│ No donations recorded yet.                                    │
└──────────────────────────────────────────────────────────────┘
```

### Donor Dashboard with Donations (Michael Brown)
```
Donation History
┌──────────────────────────────────────────────────────────────┐
│ Date       Blood  Hospital              Status  Blockchain   │
│ 12/29/24   O-     Emergency Medical     Used    View TX      │
│ 12/29/24   O-     Emergency Medical     Stored  Pending      │
│ 12/29/24   O-     Other Hospital        Stored  Pending      │
└──────────────────────────────────────────────────────────────┘
```

### Hospital Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ LifeChain  Hospital Dashboard                                │
│         Test City Hospital [Pending] [Logout]                │ ← Yellow badge, Red button
└──────────────────────────────────────────────────────────────┘

Welcome, Test City Hospital!
┌──────────────────────────────────────────────────────────────┐
│ ⚠️  Your hospital account is pending admin verification.     │ ← Yellow box
│    You'll be able to access all features once approved.      │
└──────────────────────────────────────────────────────────────┘
```

### Admin Panel
```
┌──────────────────────────────────────────────────────────────┐
│ LifeChain  Admin Panel                  Admin  [Logout]      │ ← Red button
└──────────────────────────────────────────────────────────────┘

Admin Panel
┌──────────────────────────────────────────────────────────────┐
│ Admin panel is being built. You'll be able to verify         │
│ hospitals and view system statistics here.                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Testing Workflow

### Complete Test Run (15 minutes)

**Phase 1: Donor Testing (5 min)**
1. Login as test.donor@example.com / TestPassword123!
2. Verify profile, eligibility, empty donations
3. Logout
4. Login as donor.1772299902464@example.com / password123 (Michael Brown)
5. Verify donation history with 3 donations
6. Click "Download" on a certificate
7. Click "View TX" on a blockchain link
8. Logout

**Phase 2: Hospital Testing (3 min)**
1. Login as test.hospital@example.com / HospitalPass123!
2. Verify pending verification badge and warning
3. Try to access /donor/dashboard → Should be blocked
4. Logout

**Phase 3: Admin Testing (2 min)**
1. Login as admin@lifechain.com / Admin@123456
2. Verify admin panel placeholder
3. Try to access /donor/dashboard → Should be blocked
4. Logout

**Phase 4: Access Control (3 min)**
1. Without logging in, try to access /donor/dashboard → Redirected to login
2. Login as donor, try /hospital/dashboard → Unauthorized
3. Login as hospital, try /admin/panel → Unauthorized

**Phase 5: Registration (2 min)**
1. Register a new donor account
2. Verify auto-login and redirect to dashboard
3. Verify profile shows your new information

---

## 📝 Test Results Template

Copy this and fill it out as you test:

```
TESTING COMPLETED: [Date/Time]

✅ DONOR ROLE
- Login: ✅ / ❌
- Profile Display: ✅ / ❌
- Eligibility Status: ✅ / ❌
- Donation History: ✅ / ❌
- Certificate Download: ✅ / ❌ / N/A
- Logout: ✅ / ❌

✅ HOSPITAL ROLE
- Login: ✅ / ❌
- Verification Badge: ✅ / ❌
- Warning Message: ✅ / ❌
- Logout: ✅ / ❌

✅ ADMIN ROLE
- Login: ✅ / ❌
- Panel Display: ✅ / ❌
- Logout: ✅ / ❌

✅ ACCESS CONTROL
- Role-based routing: ✅ / ❌
- Unauthorized redirects: ✅ / ❌
- Login required: ✅ / ❌

✅ REGISTRATION
- Donor registration: ✅ / ❌
- Hospital registration: ✅ / ❌
- Auto-login after registration: ✅ / ❌

ISSUES FOUND:
[List any issues here]

NOTES:
[Any additional observations]
```

---

## 🚀 Ready for Task 27?

Once you've verified all the above, you're ready to continue with:

**Task 27: Hospital Dashboard**
- Inventory management
- Record donations
- Transfer blood units
- Record usage
- Emergency requests
- AI-powered demand prediction

Let me know when you're ready to proceed!
