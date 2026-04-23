# LifeChain - Visual Testing Checklist

## 🎯 Before You Start

1. **Refresh the frontend page** (Ctrl+R or F5) to load the new CSS with color definitions
2. **Clear browser cache** if colors still don't show (Ctrl+Shift+Delete)
3. **Open DevTools** (F12) to check for any console errors

---

## 👤 DONOR ROLE TEST

### Login
- Email: `test.donor@example.com`
- Password: `TestPassword123!`

### ✅ Visual Checklist

**Navigation Bar:**
- [ ] "LifeChain" logo visible (left side, bold, red color)
- [ ] "Donor Dashboard" label visible (gray text)
- [ ] "Test Donor" name visible (right side, gray text)
- [ ] Red "Logout" button visible (far right, white text on red background)

**Profile Section:**
- [ ] "My Profile" heading
- [ ] Name: Test Donor
- [ ] Email: test.donor@example.com
- [ ] Blood Group: O+ (in red color)
- [ ] Age: 30 years
- [ ] Weight: 70 kg
- [ ] Location: Mumbai, 400001

**Eligibility Status:**
- [ ] "Eligibility Status" heading
- [ ] Green box with "Eligible" text
- [ ] Message: "You are eligible to donate blood! Contact a hospital to schedule your donation."

**Donation History:**
- [ ] "Donation History" heading
- [ ] Table with headers: Date, Blood Group, Hospital, Status, Blockchain, Certificate
- [ ] Message: "No donations recorded yet."

**Interactions:**
- [ ] Click "Logout" → Redirected to login page
- [ ] Login again → Dashboard loads correctly
- [ ] Refresh page (F5) → Stay logged in

---

## 🏥 HOSPITAL ROLE TEST

### Login
- Email: `test.hospital@example.com`
- Password: `HospitalPass123!`

### ✅ Visual Checklist

**Navigation Bar:**
- [ ] "LifeChain" logo visible (left side, bold, red color)
- [ ] "Hospital Dashboard" label visible (gray text)
- [ ] "Test City Hospital" name visible (right side, gray text)
- [ ] Yellow "Pending Verification" badge visible (next to name)
- [ ] Red "Logout" button visible (far right, white text on red background)

**Dashboard Content:**
- [ ] "Welcome, Test City Hospital!" heading
- [ ] Yellow banner with message: "Your hospital account is pending admin verification. You'll be able to access all features once approved."

**Interactions:**
- [ ] Click "Logout" → Redirected to login page
- [ ] Try to access `/donor/dashboard` → Redirected to `/unauthorized`

---

## 👨‍💼 ADMIN ROLE TEST

### Login
- Email: `admin@lifechain.com`
- Password: `Admin@123456`

### ✅ Visual Checklist

**Navigation Bar:**
- [ ] "LifeChain" logo visible (left side, bold, red color)
- [ ] "Admin Panel" label visible (gray text)
- [ ] "Admin" name visible (right side, gray text)
- [ ] Red "Logout" button visible (far right, white text on red background)

**Dashboard Content:**
- [ ] "Admin Panel" heading
- [ ] Message: "Admin panel is being built. You'll be able to verify hospitals and view system statistics here."

**Interactions:**
- [ ] Click "Logout" → Redirected to login page
- [ ] Try to access `/donor/dashboard` → Redirected to `/unauthorized`
- [ ] Try to access `/hospital/dashboard` → Redirected to `/unauthorized`

---

## 🔐 ACCESS CONTROL TEST

### Test 1: Donor trying to access Hospital Dashboard
1. Login as donor: `test.donor@example.com` / `TestPassword123!`
2. Manually type URL: `http://localhost:5173/hospital/dashboard`
3. **Expected**: Redirected to `/unauthorized` page
4. **Verify**: Page shows "Unauthorized Access" message

### Test 2: Donor trying to access Admin Panel
1. While logged in as donor
2. Manually type URL: `http://localhost:5173/admin/panel`
3. **Expected**: Redirected to `/unauthorized` page

### Test 3: Hospital trying to access Donor Dashboard
1. Logout and login as hospital: `test.hospital@example.com` / `TestPassword123!`
2. Manually type URL: `http://localhost:5173/donor/dashboard`
3. **Expected**: Redirected to `/unauthorized` page

### Test 4: Hospital trying to access Admin Panel
1. While logged in as hospital
2. Manually type URL: `http://localhost:5173/admin/panel`
3. **Expected**: Redirected to `/unauthorized` page

### Test 5: Not logged in trying to access protected routes
1. Logout completely
2. Try to access: `http://localhost:5173/donor/dashboard`
3. **Expected**: Redirected to `/login` page
4. Try to access: `http://localhost:5173/hospital/dashboard`
5. **Expected**: Redirected to `/login` page

---

## 🎨 Color Verification

After refreshing the page, verify these colors are showing:

**Red/Primary Colors:**
- [ ] LifeChain logo text
- [ ] Blood Group text (O+)
- [ ] Logout button background
- [ ] Links and interactive elements

**Status Colors:**
- [ ] Green: Eligible status box
- [ ] Yellow: Pending Verification badge
- [ ] Gray: Secondary text and labels

---

## 🐛 If Logout Button Still Not Visible

### Quick Fix Steps:

1. **Hard refresh the page**:
   - Windows: Ctrl + Shift + R
   - Or: Ctrl + F5

2. **Check browser console** (F12):
   - Look for CSS errors
   - Look for "Failed to load resource" errors

3. **Verify the CSS file loaded**:
   - Open DevTools → Network tab
   - Refresh page
   - Look for `index.css` in the list
   - Check if it loaded successfully (status 200)

4. **Check if Tailwind is working**:
   - Right-click the logout button area
   - Select "Inspect Element"
   - Check if CSS classes are applied

5. **Restart the frontend dev server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   cd frontend
   npm run dev
   ```

---

## 📸 Expected Screenshots

### Donor Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ LifeChain  Donor Dashboard          Test Donor  [Logout]   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ My Profile                                                   │
│                                                              │
│ Name              Email                                      │
│ Test Donor        test.donor@example.com                    │
│                                                              │
│ Blood Group       Age                                        │
│ O+                30 years                                   │
│                                                              │
│ Weight            Location                                   │
│ 70 kg             Mumbai, 400001                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Eligibility Status                                           │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Eligible                                    [GREEN BOX] │ │
│ │ You are eligible to donate blood!                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Donation History                                             │
│                                                              │
│ No donations recorded yet.                                   │
└─────────────────────────────────────────────────────────────┘
```

### Hospital Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ LifeChain  Hospital Dashboard                               │
│              Test City Hospital [Pending] [Logout]          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Welcome, Test City Hospital!                                 │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Your hospital account is pending admin verification.    │ │
│ │ You'll be able to access all features once approved.    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Admin Panel
```
┌─────────────────────────────────────────────────────────────┐
│ LifeChain  Admin Panel                  Admin  [Logout]     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Admin Panel                                                  │
│                                                              │
│ Admin panel is being built. You'll be able to verify        │
│ hospitals and view system statistics here.                  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Success Criteria

You've successfully tested the frontend when:

- [ ] All three roles can login successfully
- [ ] Logout button is visible and works for all roles
- [ ] Donor dashboard shows complete profile and eligibility
- [ ] Hospital dashboard shows verification status
- [ ] Admin panel loads correctly
- [ ] Role-based access control works (unauthorized redirects)
- [ ] Session persists after page refresh
- [ ] No console errors in browser DevTools

---

## 🎉 Ready for Next Steps

Once all checkboxes are complete, you're ready to continue with:
- **Task 27**: Hospital Dashboard (full implementation)
- **Task 28**: Admin Panel (full implementation)
