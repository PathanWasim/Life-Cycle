# 🚨 Emergency Request Testing Guide - FINAL

## ✅ System Status: READY

All systems are configured and working:
- ✅ SMTP Email: sabalen666@gmail.com
- ✅ Email Mapping: Configured for all 3 donors
- ✅ Hospital Locations: Set
- ✅ Donor Locations: Set
- ✅ Donor Eligibility: Working
- ✅ AI Service: Working
- ✅ Email Delivery: Tested & Working

---

## 📧 Email Configuration Summary

**Sender (FROM):**
- sabalen666@gmail.com (with app password)

**Receivers (TO):**
| Donor | Blood Type | Real Email |
|-------|-----------|------------|
| Sample Donor 1 | A- | ns7499244144@gmail.com |
| Sample Donor 2 | B+ | kingmaker0633@gmail.com |
| Sample Donor 3 | B- | userns3106@gmail.com |

---

## 🧪 Test Scenarios

### Test 1: A- Blood Request (Mumbai) ✅ TESTED

**Login:**
- Email: sample.hospital1@example.com
- Password: Hospital@123

**Create Emergency Request:**
- Blood Group: A-
- Quantity: 2
- City: Mumbai
- Pincode: 400001
- Urgency: Critical
- Notes: Test emergency request

**Expected Result:**
- ✅ 1 donor notified
- ✅ Email sent to: ns7499244144@gmail.com
- ✅ Subject: 🚨 Critical Priority: Blood Donation Needed - A-

**Check:**
- Open inbox: ns7499244144@gmail.com
- Look for email from: sabalen666@gmail.com
- Check spam folder if not in inbox

---

### Test 2: B+ Blood Request (Delhi)

**Login:**
- Email: sample.hospital2@example.com
- Password: Hospital@123

**Create Emergency Request:**
- Blood Group: B+
- Quantity: 2
- City: Delhi
- Pincode: 110001
- Urgency: High
- Notes: Urgent blood needed

**Expected Result:**
- ✅ 1 donor notified
- ✅ Email sent to: kingmaker0633@gmail.com
- ✅ Subject: 🚨 High Priority: Blood Donation Needed - B+


**Check:**
- Open inbox: kingmaker0633@gmail.com
- Look for email from: sabalen666@gmail.com
- Check spam folder if not in inbox

---

### Test 3: B- Blood Request (Bangalore)

**Login:**
- Email: sample.hospital3@example.com
- Password: Hospital@123

**Create Emergency Request:**
- Blood Group: B-
- Quantity: 1
- City: Bangalore
- Pincode: 560001
- Urgency: Medium
- Notes: Blood needed for surgery

**Expected Result:**
- ✅ 1 donor notified
- ✅ Email sent to: userns3106@gmail.com
- ✅ Subject: 🚨 Medium Priority: Blood Donation Needed - B-

**Check:**
- Open inbox: userns3106@gmail.com
- Look for email from: sabalen666@gmail.com
- Check spam folder if not in inbox

---

## 🔍 How to Verify Email Was Sent

### Method 1: Check Backend Console
When you create emergency request, backend console will show:
```
🚨 Emergency request created: [ID] for A- at Mumbai
👥 Found 1 donors in location
✅ 1 donors are eligible
📧 1 donors will be notified
📧 Email mapping: sample.donor1@example.com → ns7499244144@gmail.com
✅ Email sent to ns7499244144@gmail.com
   1. ✅ Email sent to Sample Donor 1 (sample.donor1@example.com)
```

### Method 2: Check Email Inbox
1. Open the donor's real email inbox
2. Look for email from: sabalen666@gmail.com
3. Subject will be: 🚨 [Urgency] Priority: Blood Donation Needed - [Blood Group]
4. Check spam/junk folder if not in inbox

### Method 3: Run Test Script
```bash
cd backend
node test-full-emergency-flow.js
```

This will:
- Create test emergency request
- Find eligible donors
- Send email
- Show detailed logs
- Clean up test data

---

## ⚠️ Troubleshooting

### Issue: "0 donors notified" in UI

**Reason:** Location or blood group mismatch

**Solution:**
1. Verify hospital city/pincode matches donor city/pincode
2. Verify blood group matches
3. Check backend console for actual notification count
4. Email may still be sent even if UI shows 0

### Issue: Email not received

**Checklist:**
1. ✅ Check spam/junk folder
2. ✅ Verify SMTP configuration in backend/.env
3. ✅ Check backend console for "✅ Email sent" message
4. ✅ Verify email mapping is correct
5. ✅ Wait 1-2 minutes for email delivery

### Issue: Wrong donor notified

**Reason:** Location matching logic

**How it works:**
- System finds donors with matching blood group
- AND (same city OR same pincode)
- Filters by eligibility (last donation >56 days ago)
- AI service ranks donors by suitability
- Top 10 donors receive email

---

## 📊 Expected Email Content

**Subject:**
```
🚨 [Urgency Level] Priority: Blood Donation Needed - [Blood Group]
```

**Body includes:**
- Donor name
- Blood group needed
- Quantity needed
- Hospital name
- Location (city, pincode)
- Urgency level
- Additional notes (if provided)
- Call to action

**Example:**
```
Dear Sample Donor 1,

An emergency blood request has been issued by City General Hospital.

Request Details:
- Blood Group Needed: A-
- Quantity Needed: 2 units
- Hospital: City General Hospital
- Location: Mumbai, 400001
- Urgency Level: Critical

Your donation can save lives!
```

---

## ✅ Quick Test Checklist

Before testing:
- [ ] Backend server is running
- [ ] AI service is running (optional)
- [ ] SMTP credentials are configured
- [ ] Email mapping is set up
- [ ] Hospital and donor locations are set

During test:
- [ ] Login to hospital account
- [ ] Create emergency request
- [ ] Check backend console logs
- [ ] Note "X donors notified" message
- [ ] Check donor email inbox
- [ ] Verify email received

After test:
- [ ] Confirm email delivery
- [ ] Check email content is correct
- [ ] Verify sender is sabalen666@gmail.com
- [ ] Verify receiver is correct donor email

---

## 🎯 Summary

**To test emergency request:**

1. **Start servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm start
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

2. **Login as hospital:**
   - Use credentials from table above

3. **Create emergency request:**
   - Match blood group with donor
   - Use same city/pincode as donor

4. **Check email:**
   - Open donor's real email inbox
   - Look for email from sabalen666@gmail.com
   - Check spam if not in inbox

5. **Verify:**
   - Backend console shows "✅ Email sent"
   - Email received in donor inbox
   - Email content is correct

**All systems ready! Start testing! 🚀**
