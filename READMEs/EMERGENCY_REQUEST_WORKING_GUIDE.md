# ✅ Emergency Request System - Working Configuration

## 📧 Email Configuration

**SMTP Sender (FROM):**
- Email: sabalen666@gmail.com
- App Password: Configured ✅
- Service: Gmail SMTP

**Email Receivers (TO):**
| Donor | Blood Group | Demo Email | Real Email (Receiver) |
|-------|-------------|------------|----------------------|
| Sample Donor 1 | A- | sample.donor1@example.com | ns7499244144@gmail.com |
| Sample Donor 2 | B+ | sample.donor2@example.com | kingmaker0633@gmail.com |
| Sample Donor 3 | B- | sample.donor3@example.com | userns3106@gmail.com |

## 🏥 Hospital & Donor Locations

**Hospitals:**
| Hospital | City | Pincode |
|----------|------|---------|
| City General Hospital | Mumbai | 400001 |
| Metro Medical Center | Delhi | 110001 |
| Central Health Institute | Bangalore | 500003 |

**Donors:**
| Donor | Blood Group | City | Pincode |
|-------|-------------|------|---------|
| Sample Donor 1 | A- | Mumbai | 400001 |
| Sample Donor 2 | B+ | Delhi | 110001 |
| Sample Donor 3 | B- | Bangalore | 560001 |

## ✅ Test Results

**Emergency Request Flow Test:**
- ✅ Emergency request created successfully
- ✅ Found 1 eligible donor (A- in Mumbai)
- ✅ AI service returned donor recommendations
- ✅ Email sent successfully to ns7499244144@gmail.com
- ✅ Email mapping working correctly

**Email Delivery:**
```
FROM: sabalen666@gmail.com
TO: ns7499244144@gmail.com
SUBJECT: 🚨 Critical Priority: Blood Donation Needed - A-
STATUS: ✅ Sent successfully
```


## 🧪 How to Test Emergency Request

### Test 1: A- Blood Request (Mumbai)
1. Login as **Hospital 1** (City General Hospital)
   - Email: sample.hospital1@example.com
   - Password: Hospital@123
   
2. Create Emergency Request:
   - Blood Group: **A-**
   - Quantity: 2
   - City: Mumbai
   - Pincode: 400001
   - Urgency: Critical
   
3. Expected Result:
   - ✅ 1 donor notified
   - ✅ Email sent to: ns7499244144@gmail.com
   - Check inbox for emergency request email

### Test 2: B+ Blood Request (Delhi)
1. Login as **Hospital 2** (Metro Medical Center)
   - Email: sample.hospital2@example.com
   - Password: Hospital@123
   
2. Create Emergency Request:
   - Blood Group: **B+**
   - Quantity: 2
   - City: Delhi
   - Pincode: 110001
   - Urgency: High
   
3. Expected Result:
   - ✅ 1 donor notified
   - ✅ Email sent to: kingmaker0633@gmail.com
   - Check inbox for emergency request email

### Test 3: B- Blood Request (Bangalore)
1. Login as **Hospital 3** (Central Health Institute)
   - Email: sample.hospital3@example.com
   - Password: Hospital@123
   
2. Create Emergency Request:
   - Blood Group: **B-**
   - Quantity: 2
   - City: Bangalore
   - Pincode: 560001
   - Urgency: Medium
   
3. Expected Result:
   - ✅ 1 donor notified
   - ✅ Email sent to: userns3106@gmail.com
   - Check inbox for emergency request email


## 🔍 Troubleshooting

### Issue: "0 donors notified" shown in UI

**Possible Causes:**
1. **Location Mismatch**: Hospital and donor must be in same city OR same pincode
2. **Blood Group Mismatch**: Donor blood group must match request
3. **Donor Not Eligible**: Donor must have donated >56 days ago
4. **AI Service Down**: System falls back to all eligible donors

**Solution:**
- Check backend console logs for actual notification count
- Verify email was sent (check backend logs for "✅ Email sent")
- Check donor inbox for emergency request email

### Issue: Email not received

**Checklist:**
1. ✅ Check SMTP configuration in backend/.env
2. ✅ Verify SMTP_USER = sabalen666@gmail.com
3. ✅ Verify SMTP_PASS is set correctly
4. ✅ Check email mapping in backend/services/emailMapping.js
5. ✅ Check spam/junk folder in receiver inbox
6. ✅ Verify backend server is running

### Issue: Wrong email received

**Check Email Mapping:**
```javascript
// backend/services/emailMapping.js
const EMAIL_MAPPING = {
  'sample.donor1@example.com': 'ns7499244144@gmail.com',
  'sample.donor2@example.com': 'kingmaker0633@gmail.com',
  'sample.donor3@example.com': 'userns3106@gmail.com'
};
```

## 📊 Backend Console Logs

When emergency request is created, you should see:
```
🚨 Emergency request created: [ID] for A- at Mumbai
👥 Found 1 donors in location
✅ 1 donors are eligible
📧 1 donors will be notified
📧 Email mapping: sample.donor1@example.com → ns7499244144@gmail.com
✅ Email sent to ns7499244144@gmail.com
   1. ✅ Email sent to Sample Donor 1 (sample.donor1@example.com)
```

## ✅ System Status

- ✅ SMTP Configuration: Working
- ✅ Email Mapping: Configured
- ✅ Hospital Locations: Set
- ✅ Donor Locations: Set
- ✅ Donor Eligibility: Working
- ✅ AI Service: Working
- ✅ Email Delivery: Successful

**All systems operational! Ready for testing! 🎉**
