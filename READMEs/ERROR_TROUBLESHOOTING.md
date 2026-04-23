# 🔧 Error Troubleshooting Guide

## Quick Diagnosis

Run this first to identify issues:

```bash
cd backend
node diagnose-errors.js
```

This will check:
- ✅ MongoDB connection
- ✅ Sample data exists
- ✅ Eligible donors
- ✅ Blood units
- ✅ Environment variables
- ✅ Credentials validity

---

## Common Errors & Solutions

### 1️⃣ "Invalid credentials" or "Login failed"

**Symptoms:**
- Cannot login with sample credentials
- Shows "Invalid email or password"

**Diagnosis:**
```bash
cd backend
node verify-sample-credentials.js
```

**Solutions:**

**A. Repopulate sample data:**
```bash
cd backend
node populate-sample-data.js
```

**B. Check password format:**
- Passwords are case-sensitive
- Copy-paste to avoid typos
- Correct passwords:
  - Donors: `SamplePass123!`
  - Hospitals: `HospitalPass123!`
  - Admin: `Admin@123456`

**C. Clear browser cache:**
- Press `Ctrl+Shift+Delete`
- Clear cookies and cached data
- Try again

---

### 2️⃣ "Network Error" or "Failed to fetch"

**Symptoms:**
- API calls fail
- Console shows "ERR_CONNECTION_REFUSED"
- Blank pages or loading forever

**Diagnosis:**
Check if services are running:

```bash
# Check backend (should show port 5000)
curl http://localhost:5000/api/health

# Check AI service (should show port 5001)
curl http://localhost:5001/api/health

# Check frontend (should show port 5173)
# Open browser: http://localhost:5173
```

**Solutions:**

**A. Start all services:**

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - AI Service:
```bash
cd ai-service
python app.py
```

Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```

**B. Check frontend .env:**
```bash
cat frontend/.env
```
Should show:
```
VITE_API_URL=http://localhost:5000
```

**C. Check ports not in use:**
```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5001
netstat -ano | findstr :5173

# If ports in use, kill the process or change port
```

---

### 3️⃣ "Hospital not verified"

**Symptoms:**
- Hospital cannot record donations
- Shows "Hospital not verified" error
- Hospital dashboard limited functionality

**Diagnosis:**
```bash
cd backend
node check-users.js
```
Look for `isVerified: false`

**Solutions:**

**A. Sample hospitals should be pre-verified:**
```bash
cd backend
node populate-sample-data.js
```
This creates hospitals with `isVerified: true`

**B. Manually verify via admin:**
1. Login as admin: `admin@lifechain.com` / `Admin@123456`
2. Go to "Pending Hospitals" tab
3. Click "Approve" for the hospital

**C. Direct database fix (if needed):**
```bash
cd backend
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.updateMany(
    { role: 'Hospital', email: /sample\.hospital/ },
    { isVerified: true }
  );
  console.log('✅ Sample hospitals verified');
  process.exit(0);
});
"
```

---

### 4️⃣ "Donor not eligible"

**Symptoms:**
- Cannot record donation
- Shows "Donor is not eligible to donate"
- Eligibility check fails

**Diagnosis:**
```bash
cd backend
node diagnose-errors.js
```
Check "CHECKING ELIGIBLE DONORS" section

**Eligibility Rules:**
- Age: 18-60 years
- Weight: ≥50 kg
- Last donation: >56 days ago (or never donated)

**Solutions:**

**A. Use eligible sample donors:**
```
sample.donor1@example.com - A- - Eligible
sample.donor2@example.com - B+ - Eligible
sample.donor3@example.com - B- - Eligible
sample.donor4@example.com - AB+ - Eligible
sample.donor5@example.com - AB- - Eligible
```

**B. Check donor details:**
```bash
cd backend
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const donor = await User.findOne({ email: 'sample.donor1@example.com' });
  console.log('Donor:', donor.name);
  console.log('Age:', donor.age);
  console.log('Weight:', donor.weight);
  console.log('Last Donation:', donor.lastDonationDate);
  console.log('Eligibility:', donor.checkEligibility());
  process.exit(0);
});
"
```

**C. Reset donor's last donation date:**
If donor recently donated in testing:
```bash
cd backend
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.updateOne(
    { email: 'sample.donor1@example.com' },
    { lastDonationDate: null }
  );
  console.log('✅ Donor reset - eligible again');
  process.exit(0);
});
"
```

---

### 5️⃣ "AI service unavailable"

**Symptoms:**
- Demand prediction fails
- Shows "AI service unavailable"
- Emergency request donor ranking fails

**Diagnosis:**
```bash
curl http://localhost:5001/api/health
```

**Solutions:**

**A. Start AI service:**
```bash
cd ai-service
python app.py
```

**B. Check Python dependencies:**
```bash
cd ai-service
pip install -r requirements.txt
```

**C. Check AI service .env:**
```bash
cat ai-service/.env
```
Should show:
```
FLASK_PORT=5001
BACKEND_API_URL=http://localhost:5000
```

**D. Check backend AI_SERVICE_URL:**
```bash
cat backend/.env | grep AI_SERVICE_URL
```
Should show:
```
AI_SERVICE_URL=http://localhost:5001
```

---

### 6️⃣ Empty inventory or no blood units

**Symptoms:**
- Hospital inventory shows 0 units
- No blood units in dropdown
- Cannot transfer or use blood

**Diagnosis:**
```bash
cd backend
node diagnose-errors.js
```
Check "CHECKING BLOOD UNITS" section

**Solutions:**

**A. Populate sample data:**
```bash
cd backend
node populate-sample-data.js
```
This creates 15 blood units

**B. Record a new donation:**
1. Login as hospital
2. Go to "Record Donation" tab
3. Search donor: `sample.donor1@example.com`
4. Record donation

**C. Check database directly:**
```bash
cd backend
node -e "
const mongoose = require('mongoose');
const BloodUnit = require('./models/BloodUnit');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const units = await BloodUnit.find();
  console.log('Total blood units:', units.length);
  units.forEach(u => {
    console.log(\`- \${u.bloodUnitID}: \${u.bloodGroup} (\${u.status})\`);
  });
  process.exit(0);
});
"
```

---

### 7️⃣ "Blockchain transaction failed"

**Symptoms:**
- Shows "Blockchain transaction failed"
- Transaction hash not generated
- Shows "Blockchain transaction queued"

**This is NORMAL and EXPECTED!**

**Why:**
- Low MATIC balance in wallet
- Transactions are queued for retry
- Blood units still work in all features
- Mock hashes are used for display

**Solutions:**

**A. Accept queued transactions (recommended for testing):**
- Blood units work normally
- All features functional
- No action needed

**B. Get more test MATIC (optional):**
1. Visit: https://faucet.polygon.technology/
2. Select "Polygon Amoy"
3. Enter your wallet address
4. Request test MATIC
5. Wait 1-2 minutes

**C. Clear retry queue:**
```bash
cd backend
node clear-retry-queue.js
```

---

### 8️⃣ Certificate download fails

**Symptoms:**
- "Download Certificate" button doesn't work
- PDF doesn't download
- Shows error message

**Diagnosis:**
Check if donor has donations:
```bash
cd backend
node find-donor-with-donations.js
```

**Solutions:**

**A. Ensure donor has donations:**
1. Login as hospital
2. Record donation for the donor
3. Login as donor
4. Try downloading certificate

**B. Check blood unit ownership:**
- Donor can only download certificates for their own donations
- Use correct donor account

**C. Check backend logs:**
- Look for PDFKit errors
- Check file permissions

---

### 9️⃣ Browser console errors

**Symptoms:**
- Red errors in browser console (F12)
- Components not rendering
- Buttons not working

**Common Console Errors:**

**A. "CORS error"**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Check backend CORS configuration
- Restart backend server
- Clear browser cache

**B. "Unexpected token < in JSON"**
```
SyntaxError: Unexpected token < in JSON at position 0
```
**Solution:**
- Backend returned HTML instead of JSON
- Check backend is running
- Check API endpoint URL

**C. "Cannot read property of undefined"**
```
TypeError: Cannot read property 'map' of undefined
```
**Solution:**
- Data not loaded yet
- Check API response
- Add loading state

**D. "localStorage is not defined"**
```
ReferenceError: localStorage is not defined
```
**Solution:**
- Browser privacy mode issue
- Disable privacy extensions
- Use regular browser mode

---

### 🔟 "Token expired" or "Unauthorized"

**Symptoms:**
- Suddenly logged out
- Shows "Unauthorized" error
- API calls return 401

**Diagnosis:**
JWT tokens expire after 24 hours

**Solutions:**

**A. Logout and login again:**
1. Click "Logout"
2. Login with credentials
3. New token generated

**B. Clear localStorage:**
1. Press F12
2. Go to "Application" tab
3. Click "Local Storage"
4. Click "Clear All"
5. Refresh page

**C. Check token in localStorage:**
```javascript
// In browser console (F12)
console.log(localStorage.getItem('token'));
```

---

## 🚀 Quick Fixes Checklist

If you're stuck, try these in order:

1. **Restart all services:**
   ```bash
   # Kill all terminals (Ctrl+C)
   # Start fresh:
   cd backend && npm start
   cd ai-service && python app.py
   cd frontend && npm run dev
   ```

2. **Run diagnostics:**
   ```bash
   cd backend
   node diagnose-errors.js
   ```

3. **Repopulate sample data:**
   ```bash
   cd backend
   node populate-sample-data.js
   ```

4. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete`
   - Clear everything
   - Hard refresh: `Ctrl+Shift+R`

5. **Check environment files:**
   ```bash
   cat backend/.env
   cat ai-service/.env
   cat frontend/.env
   ```

6. **Verify credentials:**
   ```bash
   cd backend
   node verify-sample-credentials.js
   ```

7. **Check MongoDB connection:**
   ```bash
   cd backend
   node -e "
   const mongoose = require('mongoose');
   require('dotenv').config();
   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('✅ Connected'))
     .catch(err => console.log('❌ Failed:', err.message));
   "
   ```

---

## 📞 Still Having Issues?

If none of these solutions work:

1. **Share the exact error message**
2. **Share browser console output** (F12 → Console)
3. **Share backend terminal output**
4. **Run diagnostics and share output:**
   ```bash
   cd backend
   node diagnose-errors.js > diagnosis.txt
   ```

I'll help you debug the specific issue!

---

## 🎯 Testing Order (Recommended)

To avoid errors, test in this order:

1. ✅ Run diagnostics first
2. ✅ Verify all services running
3. ✅ Test donor login
4. ✅ Test hospital login
5. ✅ Test admin login
6. ✅ Record donation (hospital)
7. ✅ View donation (donor)
8. ✅ Transfer blood (hospital)
9. ✅ Record usage (hospital)
10. ✅ View statistics (admin)

This ensures dependencies are met before testing advanced features.

---

**Good luck with testing! 🚀**
