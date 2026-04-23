# Frontend Complete - Testing Checklist

## Overview
This checklist verifies that all frontend features are working correctly across all three user roles: Donor, Hospital, and Admin.

---

## Prerequisites

### Services Running
- ✅ Backend: `cd backend && node server.js` (port 5000)
- ✅ AI Service: `cd ai-service && python app.py` (port 5001)
- ✅ Frontend: `cd frontend && npm run dev` (port 5173)

### Test Accounts
```
DONOR (No Donations):
Email: test.donor@example.com
Password: TestPassword123!

DONOR (With 3 Donations):
Email: donor.1772299902464@example.com
Password: password123

HOSPITAL (Unverified):
Email: test.hospital@example.com
Password: HospitalPass123!

ADMIN:
Email: admin@lifechain.com
Password: Admin@123456
```

---

## Testing Checklist

### 1. Registration Flow
- [ ] Navigate to http://localhost:5173/register
- [ ] Test donor registration with all required fields
- [ ] Test hospital registration with all required fields
- [ ] Verify password visibility toggle works
- [ ] Verify validation errors show for missing fields
- [ ] Verify successful registration redirects to login

### 2. Login Flow
- [ ] Navigate to http://localhost:5173/login
- [ ] Test login with invalid credentials (shows error)
- [ ] Test login with valid donor credentials (redirects to /donor/dashboard)
- [ ] Test login with valid hospital credentials (redirects to /hospital/dashboard)
- [ ] Test login with valid admin credentials (redirects to /admin/panel)
- [ ] Verify password visibility toggle works

### 3. Donor Dashboard
- [ ] Login as donor: `test.donor@example.com` / `TestPassword123!`
- [ ] Verify profile section shows: name, email, blood group, age, weight, location
- [ ] Verify eligibility status displays correctly (green=Eligible, red=Ineligible)
- [ ] Verify donation history table shows (empty for test.donor)
- [ ] Login as donor with donations: `donor.1772299902464@example.com` / `password123`
- [ ] Verify donation history shows 3 donations
- [ ] Click blockchain transaction link (opens Polygon Amoy explorer)
- [ ] Click "Download Certificate" button (downloads PDF)
- [ ] Verify logout button works

### 4. Hospital Dashboard (Unverified)
- [ ] Login as hospital: `test.hospital@example.com` / `HospitalPass123!`
- [ ] Verify yellow "Pending Verification" badge shows
- [ ] Verify yellow warning banner shows
- [ ] Verify tabs are hidden (only warning visible)
- [ ] Verify logout button works

### 5. Admin Panel - Approve Hospital
- [ ] Login as admin: `admin@lifechain.com` / `Admin@123456`
- [ ] Go to "Pending Hospitals" tab
- [ ] Verify test.hospital@example.com appears in table
- [ ] Click green "Approve" button
- [ ] Confirm approval
- [ ] Verify success message appears
- [ ] Verify hospital disappears from pending list
- [ ] Logout

### 6. Hospital Dashboard (Verified)
- [ ] Login as hospital: `test.hospital@example.com` / `HospitalPass123!`
- [ ] Verify "Pending Verification" badge is gone
- [ ] Verify all 6 tabs are visible

#### Tab 1: Inventory
- [ ] Verify inventory table shows blood units
- [ ] Test blood group filter
- [ ] Test status filter
- [ ] Verify expiry color coding (red <3 days, yellow 3-7 days, green >7 days)
- [ ] Click refresh button

#### Tab 2: Record Donation
- [ ] Enter donor email: `test.donor@example.com`
- [ ] Click "Search" button
- [ ] Select blood group
- [ ] Select collection date
- [ ] Click "Record Donation"
- [ ] Verify success message with Blood Unit ID
- [ ] Verify blockchain transaction hash shown

#### Tab 3: Transfer Blood
- [ ] Select a blood unit from dropdown
- [ ] Select destination hospital
- [ ] Click "Transfer Blood Unit"
- [ ] Verify success message with transaction hash
- [ ] Go to Inventory tab - verify unit status changed

#### Tab 4: Record Usage
- [ ] Select a blood unit from dropdown
- [ ] Enter patient ID
- [ ] Click "Record Usage"
- [ ] Verify success message with transaction hash
- [ ] Go to Inventory tab - verify unit status changed to "Used"

#### Tab 5: Emergency Requests
- [ ] Fill emergency request form (blood group, quantity, urgency, notes)
- [ ] Click "Create Emergency Request"
- [ ] Verify success message shows number of donors notified
- [ ] Verify request appears in "Active Emergency Requests" list
- [ ] Click "Mark Fulfilled" button
- [ ] Verify request disappears from active list

#### Tab 6: Demand Prediction
- [ ] Select blood group from dropdown
- [ ] Click "Get Prediction"
- [ ] Verify 7-day forecast table appears
- [ ] Verify confidence score and recommendation shown
- [ ] Test with different blood groups

### 7. Admin Panel - System Statistics
- [ ] Login as admin: `admin@lifechain.com` / `Admin@123456`
- [ ] Go to "System Statistics" tab
- [ ] Verify 4 summary cards show correct numbers
- [ ] Verify "Blood Units by Status" section shows breakdown
- [ ] Verify "Blood Units by Blood Group" section shows breakdown
- [ ] Wait 30 seconds - verify auto-refresh works
- [ ] Click manual refresh button

### 8. Role-Based Access Control
- [ ] Try accessing /admin/panel while logged in as donor (should redirect to /unauthorized)
- [ ] Try accessing /donor/dashboard while logged in as hospital (should redirect to /unauthorized)
- [ ] Try accessing /hospital/dashboard while logged in as admin (should redirect to /unauthorized)
- [ ] Verify Unauthorized page displays correctly

### 9. Responsive Design
- [ ] Resize browser window to mobile size (375px width)
- [ ] Verify all pages are readable and functional
- [ ] Verify tables scroll horizontally on mobile
- [ ] Verify forms are usable on mobile
- [ ] Test on tablet size (768px width)
- [ ] Test on desktop size (1920px width)

### 10. Error Handling
- [ ] Stop backend server
- [ ] Try any action in frontend
- [ ] Verify error message appears
- [ ] Restart backend
- [ ] Verify actions work again

---

## Expected Results

### All Tests Pass
✅ Registration works for all roles
✅ Login redirects to correct dashboard
✅ Donor dashboard shows profile and donations
✅ Hospital dashboard has all 6 tabs working
✅ Admin panel can verify hospitals and view statistics
✅ Role-based access control prevents unauthorized access
✅ Responsive design works on all screen sizes
✅ Error handling shows appropriate messages
✅ Blockchain transactions are recorded and visible
✅ Certificates can be downloaded

### Known Limitations
- Hospital transfer dropdown shows placeholder hospitals (needs real hospital list API)
- Blockchain transactions may be queued if MATIC balance is low
- Email notifications require SMTP configuration

---

## Next Steps

After completing this checklist:
1. All frontend features are verified working
2. Ready to proceed with deployment preparation (Task 32)
3. System is ready for production deployment

---

## Quick Test Commands

```bash
# Start all services
cd backend && node server.js
cd ai-service && python app.py
cd frontend && npm run dev

# Verify services
curl http://localhost:5000/api/health
curl http://localhost:5001/api/health
curl http://localhost:5173
```

---

## Troubleshooting

### Frontend not loading
- Check if Vite dev server is running
- Check browser console for errors
- Try hard refresh (Ctrl+Shift+R)

### API calls failing
- Check backend is running on port 5000
- Check VITE_API_URL in frontend/.env
- Check browser console Network tab

### Login not working
- Verify credentials from CORRECT_CREDENTIALS.md
- Check if JWT token is being stored in localStorage
- Try clearing localStorage and logging in again

### Dashboard blank after login
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Verify API responses in Network tab
