# 🚀 Quick Start: Task 31 Implementation

## Step-by-Step Instructions

### 1️⃣ Handle MATIC Issue (Choose One Option)

#### **Option A: Clear Retry Queue (Fastest - Recommended for Demo)**
```bash
cd backend
node check-retry-queue.js    # See what's in the queue
node clear-retry-queue.js     # Clear all 28 failed transactions
```

#### **Option B: Get More MATIC (For Production Demo)**
1. Visit: https://faucet.polygon.technology/
2. Connect MetaMask wallet
3. Select Polygon Amoy testnet
4. Request test MATIC
5. Wait for retry service to process queue automatically

---

### 2️⃣ Populate Sample Data

```bash
cd backend
node populate-sample-data.js
```

**This creates:**
- 10 donors (5 eligible, 5 ineligible)
- 3 verified hospitals
- 15 blood units with various statuses
- 2 active emergency requests
- Mock blockchain hashes (NO MATIC SPENT!)

---

### 3️⃣ Start All Services

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - AI Service  
cd ai-service
python app.py

# Terminal 3 - Frontend
cd frontend
npm run dev
```

---

### 4️⃣ Test with Sample Accounts

#### **Open 3 Browser Tabs/Windows:**

**Tab 1 - Donor (Chrome Regular)**
```
URL: http://localhost:5173
Email: sample.donor1@example.com
Password: SamplePass123!
```

**Tab 2 - Hospital (Chrome Incognito)**
```
URL: http://localhost:5173
Email: sample.hospital1@example.com
Password: HospitalPass123!
```

**Tab 3 - Admin (Firefox or Edge)**
```
URL: http://localhost:5173
Email: admin@lifechain.com
Password: Admin@123456
```

---

### 5️⃣ Test Each Dashboard

#### **Donor Dashboard** ✅
- View profile and eligibility status
- See donation history
- Download certificates (if donations exist)

#### **Hospital Dashboard** ✅
- View inventory (15 blood units should appear)
- Filter by blood group and status
- See expiry warnings (color-coded)
- View blockchain transaction links
- Test demand prediction (select blood group)
- View emergency requests

#### **Admin Panel** ✅
- View system statistics
- See total counts (donors, hospitals, blood units)
- View blood units breakdown by status
- View blood units breakdown by blood group

---

### 6️⃣ Demo Complete Workflow (Optional)

1. **Hospital**: Record new donation
   - Search donor: `sample.donor1@example.com`
   - Blood group: A+
   - Collection date: Today
   - Submit (will create blood unit, blockchain queued if no MATIC)

2. **Donor**: Refresh dashboard
   - Should see new donation in history

3. **Hospital**: Transfer blood unit
   - Select blood unit
   - Select destination hospital
   - Submit

4. **Hospital**: Create emergency request
   - Blood group: O+
   - Quantity: 2
   - Urgency: Critical
   - Submit (donors will be notified)

5. **Admin**: View updated statistics
   - Should see increased counts

---

## ✅ Task 31 Completion Checklist

- [ ] MATIC issue resolved (queue cleared OR more MATIC obtained)
- [ ] Sample data populated successfully
- [ ] All 3 services running (backend, AI, frontend)
- [ ] Tested donor dashboard with sample account
- [ ] Tested hospital dashboard with sample account
- [ ] Tested admin panel with admin account
- [ ] Verified multi-tab login works (3 roles simultaneously)
- [ ] All features working (inventory, donations, statistics)

---

## 🎉 When Complete

Mark Task 31 as complete and move to:
- **Task 32**: Deployment Preparation
- **Task 33**: Deploy to Production
- **Task 34**: Final Testing
- **Task 35**: System Complete! 🚀

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't see sample data | Re-run `populate-sample-data.js` |
| Retry queue growing | Run `clear-retry-queue.js` |
| Can't login multiple tabs | Use different browsers/incognito |
| Frontend shows old data | Hard refresh (Ctrl+Shift+R) |
| Services not starting | Check ports 5000, 5001, 5173 are free |

---

## 📞 Need Help?

Check these files:
- `TASK_31_IMPLEMENTATION_GUIDE.md` - Detailed guide
- `CORRECT_CREDENTIALS.md` - All login credentials
- `HOSPITAL_DASHBOARD_GUIDE.md` - Hospital testing guide
- `ADMIN_PANEL_GUIDE.md` - Admin testing guide

