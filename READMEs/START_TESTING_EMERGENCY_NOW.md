# 🚀 START TESTING EMERGENCY REQUEST NOW!

## ✅ Everything is Ready!

All systems configured and tested:
- ✅ Email system working
- ✅ SMTP sender: sabalen666@gmail.com
- ✅ All 3 donor emails mapped
- ✅ Locations configured
- ✅ Test email sent successfully

---

## 🎯 Quick Start - Test A- Blood Request

### Step 1: Start Servers (if not running)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 2: Login to Hospital

Open browser: http://localhost:5173

**Login Credentials:**
- Email: sample.hospital1@example.com
- Password: Hospital@123

### Step 3: Create Emergency Request

1. Click "Emergency Request" in sidebar
2. Fill in form:
   - Blood Group: **A-**
   - Quantity: **2**
   - City: **Mumbai**
   - Pincode: **400001**
   - Urgency: **Critical**
   - Notes: Test emergency request
3. Click "Create Request"

### Step 4: Check Email

**Open inbox:** ns7499244144@gmail.com

**Look for:**
- From: sabalen666@gmail.com
- Subject: 🚨 Critical Priority: Blood Donation Needed - A-
- Check spam folder if not in inbox

---

## 📧 Email Mapping Reference

| Blood Type | Donor Email (Real) |
|------------|-------------------|
| A- | ns7499244144@gmail.com |
| B+ | kingmaker0633@gmail.com |
| B- | userns3106@gmail.com |

---

## 🏥 Hospital Login Credentials

| Hospital | Email | Password | City | Blood Type to Test |
|----------|-------|----------|------|-------------------|
| City General | sample.hospital1@example.com | Hospital@123 | Mumbai | A- |
| Metro Medical | sample.hospital2@example.com | Hospital@123 | Delhi | B+ |
| Central Health | sample.hospital3@example.com | Hospital@123 | Bangalore | B- |

---

## ✅ What You Should See

### In Frontend:
- "Emergency request created successfully"
- "1 donor notified" (or similar message)

### In Backend Console:
```
🚨 Emergency request created: [ID] for A- at Mumbai
👥 Found 1 donors in location
✅ 1 donors are eligible
📧 1 donors will be notified
📧 Email mapping: sample.donor1@example.com → ns7499244144@gmail.com
✅ Email sent to ns7499244144@gmail.com
```

### In Email Inbox:
- Email from sabalen666@gmail.com
- Subject: 🚨 Critical Priority: Blood Donation Needed - A-
- Body with hospital details and request information

---

## 🔍 If Email Not Received

1. **Check spam/junk folder** (most common issue)
2. **Wait 1-2 minutes** for email delivery
3. **Check backend console** for "✅ Email sent" message
4. **Verify SMTP config** in backend/.env:
   ```
   SMTP_USER=sabalen666@gmail.com
   SMTP_PASS=kcbj pihu cbxl whji
   ```

---

## 💰 About Wallet Address

**Your question:** Which wallet address to use?
- `0x1234567890abcdef1234567890abcdef12345678` ❌
- `0xAbC1234567890dEf1234567890AbC1234567890` ❌

**Answer:** NEITHER! These are example addresses.

**Your REAL wallet address:**
- Open MetaMask
- Click on account name at top
- Copy the address shown (starts with 0x)
- That's your unique wallet address!

See `WALLET_ADDRESS_EXPLANATION.md` for detailed explanation.

---

## 🎉 Ready to Test!

**Everything is configured and working!**

Just follow the 4 steps above:
1. Start servers
2. Login to hospital
3. Create emergency request
4. Check email inbox

**Good luck! 🚀**
