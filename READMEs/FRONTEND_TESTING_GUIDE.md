# LifeChain Frontend Testing Guide

## 🚀 Services Running

All services are now running and ready for testing:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:5001

---

## 📋 Step-by-Step Testing Guide

### 1. Open the Frontend

Open your browser and go to: **http://localhost:5173**

You should see the LifeChain login page.

---

### 2. Register a New Donor Account

Click on "create a new account" link on the login page.

**Fill in the registration form:**

**Role Selection**: Select "Donor"

**Required Fields:**
- **Email**: `your.email@example.com` (use any test email)
- **Password**: `Test@1234` (at least 6 characters)
- **Confirm Password**: `Test@1234`
- **Wallet Address**: `0x1234567890123456789012345678901234567890` (any valid format starting with 0x)
- **Full Name**: `Your Name`
- **Blood Group**: Select from dropdown (e.g., `O+`)
- **Date of Birth**: Select a date (e.g., `1995-01-01`)
- **Weight**: `70` (must be ≥50 kg)
- **City**: `Mumbai`
- **Pincode**: `400001` (6 digits)
- **Phone**: `9876543210` (optional)

Click "Create Account"

**Expected Result**: You'll be automatically logged in and redirected to the Donor Dashboard.

---

### 3. Explore Donor Dashboard

After registration, you should see:

**Profile Section:**
- Your name, email, blood group, age, weight, location

**Eligibility Status:**
- Green box showing "Eligible" (since you haven't donated yet)
- Message: "You are eligible to donate blood!"

**Donation History:**
- Empty table (no donations yet)
- Message: "No donations recorded yet."

---

### 4. Test Logout and Login

Click the "Logout" button in the top right.

**You'll be redirected to the login page.**

Now login with your credentials:
- **Email**: The email you registered with
- **Password**: `Test@1234`

Click "Sign in"

**Expected Result**: You'll be logged back into the Donor Dashboard.

---

### 5. Register a Hospital Account

Logout again, then click "create a new account".

**Role Selection**: Select "Hospital"

**Required Fields:**
- **Email**: `hospital@example.com`
- **Password**: `Test@1234`
- **Confirm Password**: `Test@1234`
- **Wallet Address**: `0x9876543210987654321098765432109876543210`
- **Hospital Name**: `City General Hospital`
- **City**: `Mumbai`
- **Pincode**: `400001`
- **Phone**: `9876543211` (optional)

Click "Create Account"

**Expected Result**: You'll see the Hospital Dashboard with a yellow banner saying "Pending Verification" because hospitals need admin approval before they can record donations.

---

### 6. Create an Admin Account (via Backend)

Since admin registration isn't available in the UI, let's create one via the backend API.

Open a new terminal and run:

```bash
cd backend
node -e "
const axios = require('axios');
axios.post('http://localhost:5000/api/auth/register', {
  name: 'System Admin',
  email: 'admin@lifechain.com',
  password: 'Admin@1234',
  role: 'Admin',
  walletAddress: '0xADMIN1234567890123456789012345678901234'
}).then(res => console.log('✅ Admin created:', res.data.user))
  .catch(err => console.log('Error:', err.response?.data?.message || err.message));
"
```

---

### 7. Login as Admin and Verify Hospital

Logout from the hospital account, then login as admin:
- **Email**: `admin@lifechain.com`
- **Password**: `Admin@1234`

**Expected Result**: You'll see the Admin Panel (currently a placeholder, but Task 28 will add full functionality).

---

### 8. Verify Hospital (via Backend for now)

Since the admin panel UI isn't built yet, let's verify the hospital via API:

```bash
# First, login as admin to get the token
node -e "
const axios = require('axios');
(async () => {
  // Login as admin
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'admin@lifechain.com',
    password: 'Admin@1234'
  });
  const token = loginRes.data.token;
  
  // Get pending hospitals
  const hospitalsRes = await axios.get('http://localhost:5000/api/admin/pending-hospitals', {
    headers: { Authorization: \`Bearer \${token}\` }
  });
  
  const hospital = hospitalsRes.data.hospitals[0];
  console.log('Hospital to verify:', hospital.hospitalName, 'ID:', hospital._id);
  
  // Verify the hospital
  await axios.post(\`http://localhost:5000/api/admin/verify-hospital/\${hospital._id}\`, {}, {
    headers: { Authorization: \`Bearer \${token}\` }
  });
  
  console.log('✅ Hospital verified!');
})();
"
```

---

### 9. Test Hospital Dashboard (After Verification)

Login as the hospital again:
- **Email**: `hospital@example.com`
- **Password**: `Test@1234`

**Expected Result**: The yellow "Pending Verification" banner should be gone, and you'll see the message that the dashboard is being built.

---

### 10. Test Donor Dashboard with Donations

To see the full donor dashboard in action, you need to record a donation first.

**Option A: Use existing test donor**
Login with: `test.donor@example.com` / `TestPassword123!`

**Note**: This donor exists but has NO donations yet, so you'll see:
- Profile information displayed correctly
- Eligibility status showing "Eligible"
- Empty donation history table with message "No donations recorded yet."

**Option B: Record a new donation for your test donor**

Use the backend API to record a donation (hospital dashboard UI will be built in Task 27):

```bash
# Login as hospital to get token
# Then record donation for your donor
# (This requires the hospital to be verified first)
```

---

## 🎯 What You Can Test Now

### ✅ Working Features:

1. **Registration**:
   - Donor registration with all fields
   - Hospital registration with all fields
   - Form validation (email format, password strength, required fields)
   - Role-specific fields (dynamic form)

2. **Login**:
   - Email/password authentication
   - JWT token storage
   - Role-based redirect (Donor → /donor/dashboard, Hospital → /hospital/dashboard, Admin → /admin/panel)
   - Error messages for invalid credentials

3. **Donor Dashboard**:
   - Profile display with all donor information
   - Eligibility status with color coding
   - Days since last donation
   - Next eligible donation date calculation
   - Donation history table
   - Blockchain transaction links (opens Polygon Amoy explorer)
   - Certificate download (generates PDF with QR code)

4. **Protected Routes**:
   - Automatic redirect to login if not authenticated
   - Role-based access control (donors can't access hospital dashboard, etc.)

5. **Session Management**:
   - Logout functionality
   - Token persistence (refresh page and you stay logged in)
   - Auto-logout on token expiration

---

## 🧪 Test Scenarios

### Scenario 1: New Donor Registration & Profile
1. Register as a new donor
2. View your profile information
3. Check eligibility status (should be "Eligible")
4. See empty donation history

### Scenario 2: Login/Logout Flow
1. Logout from dashboard
2. Login again with same credentials
3. Verify you're redirected to the correct dashboard
4. Refresh the page - you should stay logged in

### Scenario 3: Hospital Registration & Verification Status
1. Register as a hospital
2. See "Pending Verification" banner
3. Verify that hospital features are restricted until admin approval

### Scenario 4: Existing Donor with Profile (No Donations Yet)
1. Login as `test.donor@example.com` / `TestPassword123!`
2. View complete profile information
3. Check eligibility status (should show "Eligible")
4. See empty donation history (no donations recorded yet)

### Scenario 5: Role-Based Access Control
1. Login as a donor
2. Try to manually navigate to `/hospital/dashboard` in the URL
3. You should be redirected to `/unauthorized`

---

## 🐛 Troubleshooting

**Issue**: "Cannot connect to backend"
- **Solution**: Make sure backend is running on port 5000

**Issue**: "Login fails with 401"
- **Solution**: Check that you're using the correct email/password

**Issue**: "Certificate download fails"
- **Solution**: Make sure you have donations recorded for that donor

**Issue**: "Page shows 'Loading...' forever"
- **Solution**: Check browser console for errors, verify backend API is accessible

---

## 📊 Current System Status

**Services Running:**
- ✅ AI Service (port 5001)
- ✅ Backend API (port 5000)
- ✅ Frontend (port 5173)
- ✅ MongoDB (connected)
- ✅ Blockchain (Polygon Amoy)

**Completed Tasks:** 26 out of 35 (74%)

**What's Working:**
- Complete authentication system
- Donor dashboard with all features
- Backend API with 21 endpoints
- Blockchain integration
- Certificate generation
- AI services

**What's Next:**
- Task 27: Hospital Dashboard (inventory, donations, transfers, usage)
- Task 28: Admin Panel (hospital verification, statistics)
- Task 29: Shared components and polish
- Tasks 30-35: Testing, deployment, and final verification

---

## 💡 Tips

1. **Use Browser DevTools**: Open the browser console (F12) to see any errors or API calls
2. **Check Network Tab**: See all API requests and responses
3. **Test Different Roles**: Create accounts for Donor, Hospital, and Admin to test role-based features
4. **Blockchain Links**: Click the "View TX" links to see actual blockchain transactions
5. **Certificate QR Codes**: The downloaded PDFs have QR codes that can be scanned

---

## 🎉 Congratulations!

You now have a working frontend with authentication and a complete donor dashboard. Users can register, login, view their profile, check eligibility, see donation history, and download certificates!

**Next**: Continue with Task 27 to build the Hospital Dashboard with inventory management, donation recording, and more.
