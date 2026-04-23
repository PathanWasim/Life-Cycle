# 🔧 Fix: Invalid Credentials Error

## Problem
You're getting "Invalid email or password" when trying to login with:
```
Email: sample.donor1@example.com
Password: SamplePass123!
```

---

## ✅ SOLUTION (3 Steps - Takes 2 Minutes)

### Step 1: Verify Current State
```bash
cd backend
node verify-sample-credentials.js
```

**What this does:**
- Tests all sample account passwords
- Shows which accounts work and which don't
- Identifies the problem

**Expected Output:**
```
✅ DONOR: sample.donor1@example.com
   Password: SamplePass123!
   Status: Credentials valid ✓
```

OR

```
❌ DONOR: sample.donor1@example.com
   Status: Account not found in database
```

---

### Step 2: Re-create Sample Accounts
```bash
node populate-sample-data.js
```

**What this does:**
- Deletes old sample accounts (if they exist)
- Creates fresh sample accounts with correct passwords
- Creates 10 donors, 3 hospitals, 15 blood units
- Uses proper password hashing

**Expected Output:**
```
✅ Created: Sample Donor 1 (A+) - Eligible
✅ Created: Sample Donor 2 (A-) - Eligible
... (10 donors total)

✅ Created: City General Hospital (Mumbai) - VERIFIED
... (3 hospitals total)

✅ Created: 15 blood units
✅ Created: 2 emergency requests

🔐 Sample Login Credentials:
   DONORS (Eligible):
   • sample.donor1@example.com / SamplePass123!
   • sample.donor2@example.com / SamplePass123!
   ...
```

---

### Step 3: Verify Fix Worked
```bash
node verify-sample-credentials.js
```

**Expected Output:**
```
✅ Valid Credentials: 12
❌ Invalid Credentials: 0
📝 Total Tested: 12

✅ ALL CREDENTIALS VALID!
   You can use these credentials to login to the frontend.
```

---

## 🧪 Test Login (Optional)

Test a specific account:
```bash
node test-sample-login.js
```

**Expected Output:**
```
Testing: sample.donor1@example.com / SamplePass123!
✅ LOGIN SUCCESSFUL!
   Name: Sample Donor 1
   Role: Donor
   Blood Group: A+
```

---

## 🌐 Now Try Frontend Login

1. **Open browser:** http://localhost:5173

2. **Login with:**
   ```
   Email: sample.donor1@example.com
   Password: SamplePass123!
   ```

3. **Should see:**
   - ✅ Login successful
   - ✅ Redirected to Donor Dashboard
   - ✅ Profile information displays
   - ✅ Eligibility status shows

---

## 🚨 Still Not Working?

### Check 1: Backend Running?
```bash
# Terminal should show:
✅ MongoDB Connected
🚀 Server running on port 5000
```

If not running:
```bash
cd backend
npm start
```

### Check 2: MongoDB Connected?
```bash
# Backend logs should show:
✅ MongoDB Connected
```

If not connected:
- Check `.env` file has correct `MONGODB_URI`
- Check MongoDB Atlas is accessible
- Check network connection

### Check 3: Frontend Running?
```bash
# Terminal should show:
➜  Local:   http://localhost:5173/
```

If not running:
```bash
cd frontend
npm run dev
```

### Check 4: Browser Console Errors?
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Check Network tab for failed API calls

Common issues:
- CORS errors → Check backend CORS settings
- 404 errors → Check API URL in frontend `.env`
- 500 errors → Check backend logs

---

## 📋 Complete Verification Checklist

Run these commands in order:

```bash
# 1. Verify current credentials
cd backend
node verify-sample-credentials.js

# 2. If any fail, re-populate
node populate-sample-data.js

# 3. Verify again
node verify-sample-credentials.js

# 4. Test specific login
node test-sample-login.js

# 5. Check services running
# Backend: http://localhost:5000/api/health
# Frontend: http://localhost:5173
```

All should return success ✅

---

## 🎯 Quick Commands Summary

```bash
# Fix credentials issue
cd backend
node populate-sample-data.js

# Verify it worked
node verify-sample-credentials.js

# Test login
node test-sample-login.js
```

---

## ✅ Success Criteria

You'll know it's fixed when:

1. ✅ `verify-sample-credentials.js` shows all accounts valid
2. ✅ `test-sample-login.js` shows login successful
3. ✅ Frontend login works without errors
4. ✅ Dashboard loads with correct data

---

## 💡 Why This Happens

**Possible causes:**
1. Sample accounts were never created
2. Passwords were changed manually in database
3. Password hashing was done incorrectly
4. Database was cleared/reset

**The solution:**
Running `populate-sample-data.js` creates fresh accounts with properly hashed passwords using bcrypt.

---

## 📞 Need More Help?

Check these files:
- `SAMPLE_CREDENTIALS_VERIFIED.md` - All credentials
- `COMPLETE_WORKFLOW_TASK_31.md` - Full testing workflow
- `TASK_31_QUICK_CHECKLIST.md` - Quick checklist

---

**Ready? Run the fix now:**

```bash
cd backend
node populate-sample-data.js
```

Then try logging in again! 🚀
