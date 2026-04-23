# Task 31: Testing and Quality Assurance - Implementation Guide

## 🎯 Overview

This guide covers Task 31 implementation with a focus on **manual end-to-end testing** and **handling the MATIC shortage issue**.

---

## ⚠️ CRITICAL: Handling MATIC Shortage (28 Failed Transactions)

### Problem
You have 28 failed blockchain transactions in the retry queue due to insufficient MATIC. The retry service keeps attempting to process them, consuming more gas.

### Solution Options

#### **Option 1: Get More Test MATIC (Recommended for Production Demo)**

1. **Visit Polygon Faucet**:
   ```
   https://faucet.polygon.technology/
   ```

2. **Alternative Faucets** (if first one doesn't work):
   ```
   https://www.alchemy.com/faucets/polygon-amoy
   https://amoy-faucet.polygon.technology/
   ```

3. **Request MATIC**:
   - Connect your MetaMask wallet
   - Select Polygon Amoy testnet
   - Request test MATIC (usually 0.5-1 MATIC per request)
   - Wait 1-2 minutes for confirmation

4. **Verify Balance**:
   ```bash
   # Check your wallet on Polygon Amoy explorer
   https://amoy.polygonscan.com/address/YOUR_WALLET_ADDRESS
   ```

5. **Let Retry Queue Process**:
   - The retry service runs every 5 minutes
   - It will automatically process the 28 failed transactions
   - Monitor backend logs to see progress

---

#### **Option 2: Clear Retry Queue (Recommended for Testing/Demo)**

If you don't need actual blockchain verification for your demo, you can clear the retry queue:

**Create a script to clear the queue:**

```bash
# Run this in backend directory
node backend/clear-retry-queue.js
```

I'll create this script for you below.

---

#### **Option 3: Disable Blockchain for Testing (Quick Demo)**

Temporarily disable blockchain recording to test other features:

**Modify `backend/services/blockchainService.js`**:
- Add a flag to skip blockchain calls
- Return mock transaction hashes instead

This allows you to test all features without MATIC costs.

---

## 📋 Task 31.3: Manual End-to-End Testing (Main Focus)

### Step 1: Populate Sample Data

Run the sample data population script:

```bash
cd backend
node populate-sample-data.js
```

**What this creates:**
- ✅ 10 sample donors (5 eligible, 5 with recent donations)
- ✅ 3 verified hospitals with inventory
- ✅ 15 blood units (various statuses: Collected, Stored, Transferred, Used)
- ✅ 2 active emergency requests
- ✅ Mock blockchain hashes (no MATIC spent!)

**Sample Credentials Created:**
```
DONORS (Eligible):
• sample.donor1@example.com / SamplePass123!
• sample.donor2@example.com / SamplePass123!
• sample.donor3@example.com / SamplePass123!
• sample.donor4@example.com / SamplePass123!
• sample.donor5@example.com / SamplePass123!

HOSPITALS (Verified):
• sample.hospital1@example.com / HospitalPass123!
• sample.hospital2@example.com / HospitalPass123!
• sample.hospital3@example.com / HospitalPass123!

ADMIN (Existing):
• admin@lifechain.com / Admin@123456
```

---

### Step 2: Test Donor Dashboard

1. **Login as Sample Donor**:
   ```
   Email: sample.donor1@example.com
   Password: SamplePass123!
   ```

2. **Verify You See**:
   - ✅ Profile information (name, blood group, age, weight)
   - ✅ Eligibility status (should show "Eligible")
   - ✅ Donation history (may be empty for new donors)
   - ✅ Certificate download buttons (if donations exist)

3. **Test Certificate Download**:
   - Click "Download Certificate" for any donation
   - Verify PDF downloads with QR code

---

### Step 3: Test Hospital Dashboard

1. **Login as Sample Hospital**:
   ```
   Email: sample.hospital1@example.com
   Password: HospitalPass123!
   ```

2. **Test Inventory Tab**:
   - ✅ See list of blood units
   - ✅ Filter by blood group
   - ✅ Filter by status
   - ✅ See expiry warnings (color-coded)
   - ✅ View blockchain transaction links

3. **Test Record Donation Tab**:
   - Search for donor: `sample.donor1@example.com`
   - Select blood group: A+
   - Select collection date: Today
   - Click "Record Donation"
   - ⚠️ **If MATIC is low**: Transaction will be queued for retry
   - ✅ Blood unit should still be created in MongoDB

4. **Test Transfer Blood Tab**:
   - Select a blood unit from dropdown
   - Select destination hospital
   - Click "Transfer Blood"
   - ⚠️ **If MATIC is low**: Transaction will be queued for retry

5. **Test Record Usage Tab**:
   - Select a blood unit
   - Enter patient ID: PAT-12345
   - Click "Record Usage"
   - ⚠️ **If MATIC is low**: Transaction will be queued for retry

6. **Test Emergency Requests Tab**:
   - Create new emergency request
   - Blood group: O+
   - Quantity: 2
   - Urgency: Critical
   - Click "Create Request"
   - ✅ Should see number of donors notified

7. **Test Demand Prediction Tab**:
   - Select blood group: A+
   - Click "Predict Demand"
   - ✅ Should see 7-day forecast
   - ✅ Should see confidence score

---

### Step 4: Test Admin Panel

1. **Login as Admin**:
   ```
   Email: admin@lifechain.com
   Password: Admin@123456
   ```

2. **Test System Statistics Tab**:
   - ✅ See total donors count
   - ✅ See total hospitals count
   - ✅ See total blood units count
   - ✅ See active emergency requests count
   - ✅ See blood units by status breakdown
   - ✅ See blood units by blood group breakdown

3. **Test Pending Hospitals Tab**:
   - Should show "No pending hospitals" (sample hospitals are pre-verified)
   - To test approval: Register a new hospital via frontend
   - Then approve/reject from admin panel

---

### Step 5: Test Multi-Tab Login (Your Use Case)

You mentioned wanting to open 3 tabs with different roles:

**Browser Tab Setup**:

1. **Tab 1 - Donor** (Chrome Regular):
   ```
   http://localhost:5173
   Login: sample.donor1@example.com / SamplePass123!
   ```

2. **Tab 2 - Hospital** (Chrome Incognito):
   ```
   http://localhost:5173
   Login: sample.hospital1@example.com / HospitalPass123!
   ```

3. **Tab 3 - Admin** (Firefox or another browser):
   ```
   http://localhost:5173
   Login: admin@lifechain.com / Admin@123456
   ```

**Why different browsers/modes?**
- Each browser/incognito session has separate localStorage
- This allows you to stay logged in as different users simultaneously
- Perfect for demonstrating the complete workflow

---

## 🛠️ Utility Scripts

### Script 1: Clear Retry Queue

```javascript
// backend/clear-retry-queue.js
require('dotenv').config();
const mongoose = require('mongoose');
const BlockchainRetry = require('./models/BlockchainRetry');

async function clearRetryQueue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await BlockchainRetry.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} failed transactions from retry queue`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearRetryQueue();
```

### Script 2: Check Retry Queue Status

```javascript
// backend/check-retry-queue.js
require('dotenv').config();
const mongoose = require('mongoose');
const BlockchainRetry = require('./models/BlockchainRetry');

async function checkRetryQueue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const retries = await BlockchainRetry.find({});
    console.log(`\n📊 Retry Queue Status: ${retries.length} pending transactions\n`);
    
    retries.forEach((retry, index) => {
      console.log(`${index + 1}. ${retry.milestoneType} - ${retry.bloodUnitID}`);
      console.log(`   Attempts: ${retry.retryCount}`);
      console.log(`   Last Error: ${retry.lastError}`);
      console.log(`   Created: ${retry.createdAt}\n`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRetryQueue();
```

---

## 📊 Task 31 Completion Checklist

### ✅ Task 31.3: Manual End-to-End Testing (Required)

- [ ] Run sample data population script
- [ ] Test donor dashboard with sample donor account
- [ ] Test hospital dashboard with sample hospital account
- [ ] Test admin panel with admin account
- [ ] Test multi-tab login (3 different roles simultaneously)
- [ ] Verify all features work without blockchain (if MATIC is low)
- [ ] Document any issues found

### ⏭️ Task 31.1 & 31.2: Automated Tests (Optional - Can Skip)

These are marked as optional (`*`) in the task list. You can skip them for now and focus on manual testing.

### ⏭️ Task 31.4: Test Blockchain Retry Queue (Optional)

- [ ] Clear existing retry queue (if needed)
- [ ] Get more test MATIC from faucet
- [ ] Verify retry queue processes successfully
- [ ] OR: Document that blockchain is disabled for demo

---

## 🎬 Demo Workflow (Recommended Order)

1. **Start All Services**:
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

2. **Populate Sample Data**:
   ```bash
   # Terminal 4
   cd backend
   node populate-sample-data.js
   ```

3. **Open 3 Browser Tabs/Windows**:
   - Tab 1: Donor dashboard
   - Tab 2: Hospital dashboard
   - Tab 3: Admin panel

4. **Demonstrate Complete Flow**:
   - Admin: Show system statistics
   - Hospital: Show inventory with existing blood units
   - Donor: Show profile and eligibility
   - Hospital: Record new donation (will queue if no MATIC)
   - Donor: Refresh to see new donation in history
   - Hospital: Transfer blood unit to another hospital
   - Hospital: Record blood usage
   - Hospital: Create emergency request
   - Admin: Show updated statistics

---

## 🚨 Troubleshooting

### Issue: "Insufficient MATIC" errors
**Solution**: Use Option 1 (get more MATIC) or Option 2 (clear retry queue)

### Issue: Retry queue keeps growing
**Solution**: Stop the backend, clear retry queue, restart backend

### Issue: Can't login to multiple tabs
**Solution**: Use different browsers or incognito mode for each role

### Issue: Sample data not showing
**Solution**: Check MongoDB connection, re-run populate script

### Issue: Frontend shows old data
**Solution**: Hard refresh (Ctrl+Shift+R) or clear browser cache

---

## ✅ Mark Task 31 Complete When:

1. ✅ Sample data is populated
2. ✅ All three dashboards tested and working
3. ✅ Multi-tab demo workflow verified
4. ✅ MATIC issue resolved (either got more MATIC or cleared queue)
5. ✅ All features demonstrated successfully

---

## 📝 Next Steps After Task 31

Once Task 31 is complete, you'll move to:
- **Task 32**: Deployment Preparation (create deployment docs)
- **Task 33**: Deploy to Production (Render, Vercel)
- **Task 34**: Final Testing in Production
- **Task 35**: Final Checkpoint - System Complete! 🎉

