# LifeChain - Role-Based Testing Guide

## 🎯 Quick Start

**Frontend URL**: http://localhost:5173

All services must be running:
- ✅ Backend: http://localhost:5000
- ✅ AI Service: http://localhost:5001
- ✅ Frontend: http://localhost:5173

---

## 👤 Test Accounts by Role

### 🩸 DONOR ACCOUNT

**Credentials:**
- Email: `test.donor@example.com`
- Password: `TestPassword123!`

**What You'll See After Login:**

1. **Navigation Bar** (top):
   - LifeChain logo (left)
   - "Donor Dashboard" label
   - "Test Donor" name (right)
   - Red "Logout" button (right)

2. **My Profile Section**:
   - Name: Test Donor
   - Email: test.donor@example.com
   - Blood Group: O+ (in red text)
   - Age: 30 years
   - Weight: 70 kg
   - Location: Mumbai, 400001

3. **Eligibility Status Section**:
   - Green box with "Eligible" status
   - Message: "You are eligible to donate blood! Contact a hospital to schedule your donation."

4. **Donation History Section**:
   - Table headers: Date, Blood Group, Hospital, Status, Blockchain, Certificate
   - Message: "No donations recorded yet."
   - (This donor has no donations in the database)

**What You Can Do:**
- ✅ View your profile information
- ✅ Check your eligibility status
- ✅ See donation history (empty for this account)
- ✅ Logout

**What You CANNOT Do:**
- ❌ Record donations (only hospitals can do this)
- ❌ Access hospital dashboard
- ❌ Access admin panel

---

### 🏥 HOSPITAL ACCOUNT

**Credentials:**
- Email: `test.hospital@example.com`
- Password: `HospitalPass123!`

**What You'll See After Login:**

1. **Navigation Bar** (top):
   - LifeChain logo (left)
   - "Hospital Dashboard" label
   - "Test City Hospital" name (right)
   - Red "Logout" button (right)

2. **Verification Status Banner**:
   - Yellow/orange banner at the top
   - Message: "Your hospital is pending verification. You cannot record donations until verified by an admin."

3. **Dashboard Content**:
   - Placeholder message: "Hospital Dashboard - Coming in Task 27"
   - (Full hospital dashboard will be implemented in Task 27)

**What You Can Do:**
- ✅ View verification status
- ✅ Logout

**What You CANNOT Do (until verified):**
- ❌ Record donations
- ❌ View inventory
- ❌ Transfer blood units
- ❌ Record usage
- ❌ Create emergency requests

**Note**: This hospital is NOT verified yet. You'll need an admin to verify it before it can perform hospital operations.

---

### 👨‍💼 ADMIN ACCOUNT

**Credentials:**
- Email: `admin@lifechain.com`
- Password: `Admin@123456`

**Note**: If this account doesn't exist, create it using:

```bash
cd backend
node -e "const axios = require('axios'); axios.post('http://localhost:5000/api/auth/register', { name: 'System Admin', email: 'admin@lifechain.com', password: 'Admin@1234', role: 'Admin', walletAddress: '0xADMIN1234567890123456789012345678901234' }).then(res => console.log('✅ Admin created')).catch(err => console.log('Error:', err.response?.data?.message));"
```

**What You'll See After Login:**

1. **Navigation Bar** (top):
   - LifeChain logo (left)
   - "Admin Panel" label
   - "Admin" name (right)
   - Red "Logout" button (right)

2. **Dashboard Content**:
   - Placeholder message: "Admin Panel - Coming in Task 28"
   - (Full admin panel will be implemented in Task 28)

**What You Can Do:**
- ✅ Logout

**What You WILL Be Able To Do (Task 28):**
- Verify pending hospitals
- Reject hospital applications
- View system statistics
- Monitor all blood units
- View all users

---

## 🧪 Testing Scenarios

### Scenario 1: Donor Login & Profile View
1. Go to http://localhost:5173
2. Login with: `test.donor@example.com` / `TestPassword123!`
3. **Verify you see**:
   - Complete profile information
   - Green "Eligible" status
   - Empty donation history
   - Logout button in top right

### Scenario 2: Hospital Login & Verification Status
1. Logout from donor account
2. Login with: `test.hospital@example.com` / `HospitalPass123!`
3. **Verify you see**:
   - Yellow "Pending Verification" banner
   - Hospital name in navigation
   - Placeholder dashboard message
   - Logout button in top right

### Scenario 3: Admin Login
1. Logout from hospital account
2. Login with: `admin@lifechain.com` / `Admin@123456`
3. **Verify you see**:
   - Admin panel placeholder
   - "Admin" name in navigation
   - Logout button in top right

### Scenario 4: Role-Based Access Control
1. Login as donor
2. Manually type in URL: `http://localhost:5173/hospital/dashboard`
3. **Expected**: Redirected to `/unauthorized` page
4. Try accessing: `http://localhost:5173/admin/panel`
5. **Expected**: Redirected to `/unauthorized` page

### Scenario 5: Session Persistence
1. Login as any role
2. Refresh the page (F5)
3. **Expected**: You stay logged in (token persists in localStorage)

### Scenario 6: Logout Flow
1. Login as any role
2. Click "Logout" button
3. **Expected**: Redirected to login page
4. Try to go back to dashboard
5. **Expected**: Redirected to login page (token cleared)

---

## 🔧 Troubleshooting

### Issue: Logout button not visible
**Cause**: CSS colors not defined (text-primary, bg-primary)
**Solution**: The colors are now defined in `frontend/src/index.css`. Refresh the page.

### Issue: Dashboard shows "Loading..." forever
**Possible causes**:
1. Backend not running → Check http://localhost:5000/api/health
2. API response structure mismatch → Check browser console (F12)
3. CORS error → Check backend CORS configuration

**Solution**: Open browser DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab for failed API calls

### Issue: Login fails with "Invalid email or password"
**Solution**: Double-check the password (case-sensitive, includes special characters)

### Issue: Dashboard shows error message
**Solution**: Check the error message displayed. Common issues:
- "Failed to load donor data" → Backend API issue
- "Unauthorized" → Token expired or invalid

---

## 📊 What's Implemented (Tasks 25-26)

### ✅ Task 25: Authentication & Routing
- User registration (Donor/Hospital)
- User login with JWT
- Protected routes with role-based access
- Session persistence
- Logout functionality

### ✅ Task 26: Donor Dashboard
- Profile display
- Eligibility status with color coding
- Donation history table
- Blockchain transaction links
- Certificate download (when donations exist)

### 🔄 Coming Next:
- Task 27: Hospital Dashboard (inventory, record donations, transfers, usage)
- Task 28: Admin Panel (verify hospitals, view statistics)

---

## 🎨 UI Elements to Verify

### Navigation Bar
- Logo: "LifeChain" in bold
- Dashboard label: "Donor Dashboard" / "Hospital Dashboard" / "Admin Panel"
- User name: Displayed on the right
- Logout button: Red button on the far right

### Color Scheme
- Primary color: Red (#dc2626)
- Secondary color: Dark red (#991b1b)
- Success: Green
- Warning: Yellow/Orange
- Error: Red

### Responsive Design
- Works on desktop (tested)
- Should work on tablet and mobile (Tailwind responsive classes used)

---

## 📝 Summary of Current State

**Completed Features:**
- ✅ User registration with role selection
- ✅ User login with JWT authentication
- ✅ Role-based routing and access control
- ✅ Donor dashboard with profile and eligibility
- ✅ Session management and logout
- ✅ Protected routes with unauthorized page

**Placeholder Pages:**
- 🔄 Hospital Dashboard (shows verification status, full UI in Task 27)
- 🔄 Admin Panel (placeholder, full UI in Task 28)

**Test Accounts Available:**
- Donor: test.donor@example.com / TestPassword123!
- Hospital: test.hospital@example.com / HospitalPass123!
- Admin: admin@lifechain.com / Admin@123456

**Next Steps:**
1. Test all three roles
2. Verify logout button appears for all roles
3. Test role-based access control
4. Continue with Task 27 (Hospital Dashboard)
