# ✅ Sample Account Credentials - VERIFIED

## 🔍 How to Verify Credentials

Before testing, run this command to verify all credentials work:

```bash
cd backend
node verify-sample-credentials.js
```

This will test all sample accounts and show which ones are valid.

---

## 🔐 Sample Account Credentials

### DONORS (Eligible - No Recent Donations)

```
Email: sample.donor1@example.com
Password: SamplePass123!
Blood Group: A+
Status: Eligible
```

```
Email: sample.donor2@example.com
Password: SamplePass123!
Blood Group: A-
Status: Eligible
```

```
Email: sample.donor3@example.com
Password: SamplePass123!
Blood Group: B+
Status: Eligible
```

```
Email: sample.donor4@example.com
Password: SamplePass123!
Blood Group: B-
Status: Eligible
```

```
Email: sample.donor5@example.com
Password: SamplePass123!
Blood Group: AB+
Status: Eligible
```

### DONORS (Ineligible - Recent Donations)

```
Email: sample.donor6@example.com
Password: SamplePass123!
Blood Group: AB-
Status: Ineligible (donated 30 days ago)
```

```
Email: sample.donor7@example.com
Password: SamplePass123!
Blood Group: O+
Status: Ineligible (donated 30 days ago)
```

```
Email: sample.donor8@example.com
Password: SamplePass123!
Blood Group: O-
Status: Ineligible (donated 30 days ago)
```

```
Email: sample.donor9@example.com
Password: SamplePass123!
Blood Group: A+
Status: Ineligible (donated 30 days ago)
```

```
Email: sample.donor10@example.com
Password: SamplePass123!
Blood Group: A-
Status: Ineligible (donated 30 days ago)
```

---

### HOSPITALS (All Verified)

```
Email: sample.hospital1@example.com
Password: HospitalPass123!
Name: City General Hospital
Location: Mumbai, 400001
Status: VERIFIED ✅
```

```
Email: sample.hospital2@example.com
Password: HospitalPass123!
Name: Metro Medical Center
Location: Delhi, 400002
Status: VERIFIED ✅
```

```
Email: sample.hospital3@example.com
Password: HospitalPass123!
Name: Central Health Institute
Location: Bangalore, 400003
Status: VERIFIED ✅
```

---

### ADMIN

```
Email: admin@lifechain.com
Password: Admin@123456
Role: Admin
```

---

### EXISTING TEST ACCOUNTS (From Previous Testing)

```
Email: test.donor@example.com
Password: TestPassword123!
Role: Donor
```

```
Email: donor.1772299902464@example.com
Password: password123
Role: Donor (has 3 donations)
```

```
Email: test.hospital@example.com
Password: HospitalPass123!
Role: Hospital
Status: VERIFIED ✅
```

---

## 🚨 Troubleshooting Invalid Credentials

### Issue: "Invalid email or password" error

**Possible Causes:**
1. Sample accounts not created yet
2. Password was changed or corrupted
3. Database connection issue

**Solutions:**

#### Solution 1: Verify Credentials
```bash
cd backend
node verify-sample-credentials.js
```

This will show which accounts are valid and which are not.

#### Solution 2: Re-create Sample Accounts
```bash
cd backend
node populate-sample-data.js
```

This will:
- Delete existing sample accounts
- Create fresh sample accounts with correct passwords
- Verify all credentials work

#### Solution 3: Test Specific Account
```bash
cd backend
node test-sample-login.js
```

This will test login for `sample.donor1@example.com` and show detailed error information.

---

## 📋 Quick Test Commands

### Test All Credentials
```bash
node backend/verify-sample-credentials.js
```

**Expected Output:**
```
✅ DONOR: sample.donor1@example.com
   Password: SamplePass123!
   Status: Credentials valid ✓

✅ DONOR: sample.donor2@example.com
   Password: SamplePass123!
   Status: Credentials valid ✓

... (all accounts)

📊 VERIFICATION SUMMARY
✅ Valid Credentials: 12
❌ Invalid Credentials: 0
📝 Total Tested: 12
```

### Test Single Account
```bash
node backend/test-sample-login.js
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

## 🔄 Reset All Sample Accounts

If you're having issues with any sample accounts, reset them all:

```bash
cd backend
node populate-sample-data.js
```

This will:
1. Delete all existing sample accounts
2. Create 10 new donors with correct passwords
3. Create 3 new hospitals with correct passwords
4. Create 15 blood units with mock blockchain hashes
5. Create 2 emergency requests

**Time:** ~10 seconds

---

## ✅ Verification Checklist

Before starting Task 31 testing:

- [ ] Run `node backend/verify-sample-credentials.js`
- [ ] Verify all 12 accounts show "✅ Credentials valid"
- [ ] If any show "❌ Invalid", run `node backend/populate-sample-data.js`
- [ ] Re-run verification to confirm all accounts work
- [ ] Proceed with frontend testing

---

## 🎯 Recommended Testing Order

1. **Verify credentials first:**
   ```bash
   node backend/verify-sample-credentials.js
   ```

2. **If any fail, re-populate:**
   ```bash
   node backend/populate-sample-data.js
   ```

3. **Verify again:**
   ```bash
   node backend/verify-sample-credentials.js
   ```

4. **Start frontend testing:**
   - Login as donor: `sample.donor1@example.com` / `SamplePass123!`
   - Login as hospital: `sample.hospital1@example.com` / `HospitalPass123!`
   - Login as admin: `admin@lifechain.com` / `Admin@123456`

---

## 📞 Still Having Issues?

If credentials still don't work after running populate script:

1. **Check backend is running:**
   ```bash
   # Should see: Server running on port 5000
   ```

2. **Check MongoDB connection:**
   ```bash
   # Backend logs should show: MongoDB Connected
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for error messages
   - Check Network tab for failed requests

4. **Try different browser:**
   - Clear cache and cookies
   - Try incognito mode
   - Try different browser

---

## 💡 Password Requirements

All sample passwords follow these rules:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Sample Passwords:**
- Donors: `SamplePass123!`
- Hospitals: `HospitalPass123!`
- Admin: `Admin@123456`

---

## 🔒 Security Note

These are TEST ACCOUNTS ONLY for development and demonstration purposes.

**DO NOT use these passwords in production!**

In production:
- Use strong, unique passwords
- Enable two-factor authentication
- Implement password rotation policies
- Use environment variables for sensitive data

