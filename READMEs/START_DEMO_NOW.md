# 🚀 START DEMO NOW - Complete Setup

## ⚡ QUICK FIX: Login Failed

**Problem:** Login shows "Login failed"
**Cause:** Backend is not running
**Solution:** Start backend (see below)

---

## 🎯 3 STEPS TO START DEMO

### Step 1: Prepare System (30 seconds)

```bash
cd backend
node prepare-for-demo.js
```

**This resets Donor 1 & 2 and fixes any issues.**

---

### Step 2: Start All Services (2 minutes)

Open 3 terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Wait for: `Server running on port 5000`

**Terminal 2 - AI Service:**
```bash
cd ai-service
python app.py
```
Wait for: `Running on http://127.0.0.1:5001`

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```
Wait for: `Local: http://localhost:5173/`

---

### Step 3: Open Browser & Login

```
URL: http://localhost:5173
```

**Test Login:**
```
Email: sample.donor1@example.com
Password: SamplePass123!
```

**✅ Should redirect to:** Donor Dashboard

---

## 📋 DEMO CREDENTIALS

### Copy-Paste These (Case-Sensitive!)

**Donors:**
```
sample.donor1@example.com
SamplePass123!

sample.donor2@example.com
SamplePass123!

sample.donor3@example.com
SamplePass123!
```

**Hospitals:**
```
sample.hospital1@example.com
HospitalPass123!

sample.hospital2@example.com
HospitalPass123!
```

**Admin:**
```
admin@lifechain.com
Admin@123456
```

---

## 🎬 DEMO FLOW (40 minutes)

### 1. Donor Dashboard (5 min)
- Login: sample.donor1@example.com
- Show profile, eligibility, blood group

### 2. Record Donation (5 min)
- Login: sample.hospital1@example.com
- Record donation for Donor 2 (B+)
- Show success + Blood Unit ID

### 3. View Inventory (3 min)
- Inventory tab
- Show blood units, filters, expiry dates

### 4. Transfer Blood (5 min)
- Transfer Blood tab
- Transfer to Metro Medical Center
- Show success message

### 5. Hospital 2 Receives Blood (3 min)
- Login: sample.hospital2@example.com
- Inventory tab
- Show transferred unit appears

### 6. Record Usage (3 min)
- Record Usage tab
- Patient ID: PAT-DEMO-001
- Show success

### 7. Emergency Request (5 min)
- Emergency Requests tab
- O+, Quantity 3, Critical
- Show donors notified

### 8. Demand Prediction (5 min)
- Demand Prediction tab
- Select O-
- Show 7-day forecast

### 9. Donor History (3 min)
- Login: sample.donor3@example.com
- Hard refresh: Ctrl + Shift + R
- Show donation history

### 10. Admin Panel (5 min)
- Login: admin@lifechain.com
- Show system statistics

---

## 🐛 TROUBLESHOOTING

### "Login failed"
**Fix:** Start backend
```bash
cd backend
npm start
```

### "Network Error"
**Fix:** Check all 3 services are running

### "Too many requests"
**Fix:** Restart backend (resets rate limit)

### Page not loading
**Fix:** Hard refresh (Ctrl + Shift + R)

### Donors not eligible
**Fix:** Run prepare script
```bash
cd backend
node prepare-for-demo.js
```

---

## ✅ VERIFICATION

### Check Services Running:

**Backend (Port 5000):**
```bash
curl http://localhost:5000/api/health
```

**AI Service (Port 5001):**
```bash
curl http://localhost:5001/api/health
```

**Frontend (Port 5173):**
Open: `http://localhost:5173`

---

## 📚 DOCUMENTATION

**Main Guides:**
- DEMO_CREDENTIALS.md - Complete demo workflow
- DEMO_QUICK_REFERENCE.md - One-page reference
- DEMO_CREDENTIALS_CARD.txt - Printable card

**Technical Guides:**
- FIX_LOGIN_FAILED.md - Login troubleshooting
- TRANSFER_FIX_GUIDE.md - Transfer issues
- DEMO_SETUP_COMPLETE.md - Complete setup guide

---

## 🎯 SUCCESS CHECKLIST

Before demo:
- [ ] Run `node prepare-for-demo.js`
- [ ] Backend running (port 5000)
- [ ] AI service running (port 5001)
- [ ] Frontend running (port 5173)
- [ ] Test login works
- [ ] Browser cache cleared
- [ ] Demo guide open

---

## 📞 QUICK COMMANDS

```bash
# Prepare for demo
cd backend
node prepare-for-demo.js

# Start backend
npm start

# Test login
node test-login-now.js

# Check services
curl http://localhost:5000/api/health
curl http://localhost:5001/api/health
```

---

**Start backend first, then login will work!** 🎯

**Full guide:** DEMO_CREDENTIALS.md
