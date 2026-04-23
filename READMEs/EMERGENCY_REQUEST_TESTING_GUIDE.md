# 🚨 Emergency Request Testing Guide

## Your 3 Demo Donors with Real Email Addresses

| Donor | Email (Login) | Real Email (Receives Notifications) | Blood Group | Location |
|-------|---------------|-------------------------------------|-------------|----------|
| **Donor 1** | sample.donor1@example.com | ns7499244144@gmail.com | **A-** | Mumbai, 400001 |
| **Donor 2** | sample.donor2@example.com | kingmaker0633@gmail.com | **B+** | Mumbai, 400001 |
| **Donor 3** | sample.donor3@example.com | userns3106@gmail.com | **B-** | Mumbai, 400001 |

---

## 🎯 Which Blood Type to Request for Testing

### Option 1: Request B+ (Will notify Donor 2)
- **Blood Group**: B+
- **Will notify**: sample.donor2@example.com
- **Email sent to**: kingmaker0633@gmail.com

### Option 2: Request B- (Will notify Donor 3)
- **Blood Group**: B-
- **Will notify**: sample.donor3@example.com
- **Email sent to**: userns3106@gmail.com

### Option 3: Request A- (Will notify Donor 1)
- **Blood Group**: A-
- **Will notify**: sample.donor1@example.com
- **Email sent to**: ns7499244144@gmail.com

---

## 📝 Step-by-Step Testing Instructions

### Step 1: Login as Hospital
1. Open: `http://localhost:5173`
2. Login with:
   - Email: `sample.hospital1@example.com`
   - Password: `HospitalPass123!`

### Step 2: Create Emergency Request
1. Click "Emergency Requests" tab
2. Scroll to "Create Emergency Request" form
3. Fill in the form:

**For Testing B+ (Donor 2):**
```
Blood Group: B+
Quantity: 2
City: Mumbai
Pincode: 400001
Urgency Level: Critical
Notes: Testing emergency request for B+ blood type
```

**For Testing B- (Donor 3):**
```
Blood Group: B-
Quantity: 3
City: Mumbai
Pincode: 400001
Urgency Level: High
Notes: Testing emergency request for B- blood type
```

**For Testing A- (Donor 1):**
```
Blood Group: A-
Quantity: 1
City: Mumbai
Pincode: 400001
Urgency Level: Critical
Notes: Testing emergency request for A- blood type
```

4. Click "Create Request"

