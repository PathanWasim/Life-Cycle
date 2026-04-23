# Emergency Request Demo Guide

## 🚨 How to Test Emergency Request Workflow

### Prerequisites
1. Backend server running on port 5000
2. Frontend running on port 5173
3. AI service running on port 5001 (optional - has fallback)

### Step-by-Step Demo

#### 1. Login as Hospital
```
Email: sample.hospital1@example.com
Password: HospitalPass123!
```

#### 2. Navigate to Emergency Requests
- In hospital dashboard, look for "Emergency Requests" section
- Click "Create Emergency Request" or similar button

#### 3. Fill Emergency Request Form
```
Blood Group: O+
Quantity: 2 units
City: Mumbai
Pincode: 400001
Urgency Level: Critical
Notes: Accident victim needs immediate transfusion
```

#### 4. Submit Request
- Click "Submit" or "Create Request"
- System will:
  - Find eligible donors in Mumbai with O+ blood
  - Use AI to rank donors by suitability
  - Send email notifications to top 10 donors
  - Display confirmation with donor count

#### 5. Check Console Logs
In the backend console, you'll see:
```
🚨 Emergency request created: [REQUEST_ID] for O+ at Mumbai
👥 Found X donors in location
✅ Y donors are eligible
📧 Z donors will be notified
   1. ✅ Email sent to [Donor Name] ([email]) - Score: 0.XX
   2. ✅ Email sent to [Donor Name] ([email]) - Score: 0.XX
   ...
```

#### 6. View Emergency Requests List
- Go back to emergency requests list
- You'll see your request with status "Active"
- Shows blood group, quantity, urgency, created date

#### 7. Fulfill Request (Optional)
- Click "Fulfill" button on the request
- Status changes to "Fulfilled"
- Fulfillment date is recorded

## 📧 Email Notifications (Currently Simulated)

### What Donors Would Receive:
```
Subject: 🚨 Critical Priority: Blood Donation Needed - O+

Dear [Donor Name],

An emergency blood request has been issued by City General Hospital.

Request Details:
- Blood Group Needed: O+
- Quantity Needed: 2 units
- Hospital: City General Hospital
- Location: Mumbai, 400001
- Urgency Level: Critical
- Additional Notes: Accident victim needs immediate transfusion

Your donation can save lives!
```

### Current Behavior:
- Emails are logged to backend console
- All functionality works except actual email delivery
- To enable real emails: Configure SMTP in backend/.env

## 🤖 AI-Powered Features Working

### 1. Donor Ranking Algorithm
- **Proximity Score**: Same city/pincode gets higher score
- **Donation Frequency**: 2-4 donations/year is optimal
- **Time Since Last Donation**: 60-90 days is ideal
- **Final Score**: Weighted combination of all factors

### 2. Intelligent Filtering
- Only eligible donors (can donate based on last donation date)
- Location-based filtering (city or pincode match)
- Blood group compatibility

### 3. Top 10 Selection
- AI ranks all eligible donors
- Selects top 10 most suitable
- Sends notifications in priority order

## 🔍 Verification Steps

### Check Database Records:
1. Emergency request is saved with all details
2. Notified donor IDs are recorded
3. AI recommendation scores are stored
4. Request status can be updated

### Check AI Integration:
1. AI service provides donor rankings
2. Fallback works if AI service unavailable
3. Suitability scores are calculated correctly

### Check Email System:
1. Email templates are generated correctly
2. Recipient lists are accurate
3. Email content includes all required details

## 🎯 Expected Results

When you create an emergency request, you should see:

1. **Success Message**: "Emergency request created and donors notified"
2. **Donor Count**: Number of eligible donors found and notified
3. **AI Status**: "available" or "unavailable" (with fallback)
4. **Request ID**: Unique identifier for tracking
5. **Console Logs**: Detailed process logs in backend

The workflow is **fully functional** - the only difference from production is that emails are simulated instead of actually sent.