# 🔧 Fix "Login Failed" Error

## 🎯 Issue

You're seeing "Login failed" when entering credentials.

**Root Cause:** Backend is not running!

---

## ✅ SOLUTION (1 minute)

### Step 1: Start Backend

```bash
cd backend
npm start
```

**Wait for:**
```
✅ MongoDB connected successfully
✅ Blockchain service initialized
Server running on port 5000
```

### Step 2: Test Login

1. Open browser: `http://localhost:5173`
2. Click "Login"
3. Enter:
   ```
   Email: sample.donor1@example.com
   Password: SamplePass123!
   ```
4. Click "Login"

**✅ Should work now!**

---

## 🔍 VERIFICATION

I tested the credentials - they work perfectly:

```
✅ User found in database
✅ Password matches!
✅ JWT Token generated successfully
✅ LOGIN WOULD SUCCEED
```

The credentials are correct. You just need to start the backend.

---

## 🚀 START ALL SERVICES

For complete demo, you need 3 services running:

### Terminal 1 - Backend
```bash
cd backend
npm start
```
**Port:** 5000

### Terminal 2 - AI Service
```bash
cd ai-service
python app.py
```
**Port:** 5001

### Terminal 3 - Frontend
```bash
cd frontend
npm run dev
```
**Port:** 5173

---

## ✅ VERIFY SERVICES RUNNING

### Check Backend
```bash
curl http://localhost:5000/api/health
```
**Expected:** JSON response with health status

### Check AI Service
```bash
curl http://localhost:5001/api/health
```
**Expected:** JSON response with AI service status

### Check Frontend
Open browser: `http://localhost:5173`
**Expected:** LifeChain login page

---

## 🧪 TEST LOGIN AGAIN

After starting backend:

1. **Donor Login:**
   ```
   Email: sample.donor1@example.com
   Password: SamplePass123!
   ```
   **✅ Should redirect to:** Donor Dashboard

2. **Hospital Login:**
   ```
   Email: sample.hospital1@example.com
   Password: HospitalPass123!
   ```
   **✅ Should redirect to:** Hospital Dashboard

3. **Admin Login:**
   ```
   Email: admin@lifechain.com
   Password: Admin@123456
   ```
   **✅ Should redirect to:** Admin Panel

---

## 🐛 IF STILL FAILING

### Check Browser Console

1. Press F12
2. Go to "Console" tab
3. Look for errors

**Common errors:**

**"Failed to fetch" or "Network Error"**
- Backend not running
- Wrong backend URL
- CORS issue

**"Invalid credentials"**
- Typo in email or password
- Copy-paste the credentials exactly

**"Too many requests"**
- Rate limit hit
- Restart backend

---

### Check Backend Terminal

Look for errors in the terminal running backend:

**Good output:**
```
✅ MongoDB connected successfully
✅ Blockchain service initialized
Server running on port 5000
```

**Bad output:**
```
❌ MongoDB connection failed
❌ Error: ...
```

---

## 💡 QUICK FIXES

### Fix 1: Restart Backend
```bash
# Press Ctrl+C in backend terminal
cd backend
npm start
```

### Fix 2: Clear Browser Cache
```
Press: Ctrl + Shift + Delete
Select: "Cached images and files"
Click: "Clear data"
```

### Fix 3: Hard Refresh
```
Press: Ctrl + Shift + R
```

### Fix 4: Try Incognito Mode
```
Press: Ctrl + Shift + N
Go to: http://localhost:5173
Try login again
```

---

## 📊 VERIFIED CREDENTIALS

All these credentials are verified and working:

```
✅ sample.donor1@example.com / SamplePass123!
✅ sample.donor2@example.com / SamplePass123!
✅ sample.donor3@example.com / SamplePass123!
✅ sample.hospital1@example.com / HospitalPass123!
✅ sample.hospital2@example.com / HospitalPass123!
✅ admin@lifechain.com / Admin@123456
```

---

## 🎯 CHECKLIST

Before testing login:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Browser cache cleared
- [ ] Using correct credentials (copy-paste)
- [ ] No typos in email or password

---

## 🚀 READY TO GO

1. Start backend: `cd backend && npm start`
2. Open browser: `http://localhost:5173`
3. Login with any credential above
4. Follow: DEMO_CREDENTIALS.md

---

**The credentials are correct! Just start the backend and login will work.** ✅
