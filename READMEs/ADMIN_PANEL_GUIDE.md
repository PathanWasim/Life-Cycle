# Admin Panel Testing Guide

## Overview
The Admin Panel provides hospital verification and system statistics monitoring capabilities for administrators.

## Prerequisites
- Backend running on port 5000
- Frontend running on port 5173
- Admin account credentials

## Admin Login Credentials
```
Email: admin@lifechain.com
Password: Admin@123456
```

---

## Features Overview

### 1. Pending Hospitals Tab
- View all hospitals awaiting verification
- Approve or reject hospital registrations
- See hospital details (name, email, location, wallet address, registration date)

### 2. System Statistics Tab
- Real-time system metrics
- Auto-refreshes every 30 seconds
- Visual breakdown of blood units by status and blood group

---

## Testing Instructions

### Step 1: Login as Admin
1. Navigate to http://localhost:5173/login
2. Enter admin credentials:
   - Email: `admin@lifechain.com`
   - Password: `Admin@123456`
3. Click "Login"
4. You should be redirected to `/admin/panel`

### Step 2: Test Pending Hospitals Tab

#### View Pending Hospitals
1. The "Pending Hospitals" tab should be active by default
2. You should see a table with columns:
   - Hospital Name
   - Email
   - Location (City, Pincode)
   - Wallet Address (shortened format)
   - Registration Date
   - Actions (Approve/Reject buttons)

#### Approve a Hospital
1. Click the green "Approve" button for any pending hospital
2. Confirm the approval in the dialog
3. Success message should appear: "[Hospital Name] approved successfully!"
4. The hospital should disappear from the pending list
5. The hospital will receive a verification email
6. The hospital can now access all dashboard features

#### Reject a Hospital
1. Click the red "Reject" button for any pending hospital
2. Confirm the rejection in the dialog (warns that action cannot be undone)
3. Success message should appear: "[Hospital Name] rejected and deleted."
4. The hospital should disappear from the pending list
5. The hospital will receive a rejection email
6. The hospital account is permanently deleted

#### Refresh Pending List
1. Click the "Refresh" button in the top-right
2. The list should reload with current data

### Step 3: Test System Statistics Tab

#### View Statistics Dashboard
1. Click the "System Statistics" tab
2. You should see 4 summary cards:
   - **Total Donors** (blue card)
   - **Verified Hospitals** (green card)
   - **Total Blood Units** (purple card)
   - **Active Emergencies** (red card)

#### View Blood Units by Status
1. Scroll down to "Blood Units by Status" section
2. You should see cards for each status:
   - Collected (blue)
   - Stored (purple)
   - Transferred (yellow)
   - Used (green)
   - Expired (red)
3. Each card shows the count of blood units in that status

#### View Blood Units by Blood Group
1. Scroll down to "Blood Units by Blood Group" section
2. You should see cards for each blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
3. Each card shows the count of blood units for that blood group

#### Auto-Refresh Feature
1. Stay on the Statistics tab
2. The statistics will automatically refresh every 30 seconds
3. You can also manually refresh by clicking the "Refresh" button

#### Pending Hospitals Alert
1. If there are pending hospitals, you'll see a yellow alert banner
2. It shows: "[X] hospital(s) awaiting verification"
3. This reminds admins to check the Pending Hospitals tab

---

## Expected Behavior

### Navigation
- Admin name/email displayed in top-right
- Red "Logout" button logs out and redirects to login page
- Tab switching is instant and smooth

### Error Handling
- If API fails, red error message appears at top
- Loading states show "Loading..." text
- Empty states show appropriate messages

### Success Messages
- Green success messages appear after actions
- Success messages auto-dismiss after 3 seconds
- Messages are clear and informative

### Confirmation Dialogs
- Approve action: "Approve [Hospital Name]?"
- Reject action: "Reject and delete [Hospital Name]? This action cannot be undone."
- User must confirm before action proceeds

---

## Testing Scenarios

### Scenario 1: Approve Multiple Hospitals
1. Login as admin
2. Go to Pending Hospitals tab
3. Approve 2-3 hospitals one by one
4. Verify each disappears from the list
5. Check System Statistics - "Verified Hospitals" count should increase

### Scenario 2: Reject a Hospital
1. Login as admin
2. Go to Pending Hospitals tab
3. Reject one hospital
4. Confirm the action
5. Verify it's removed from the list
6. Try to login as that hospital - should fail (account deleted)

### Scenario 3: Monitor System Growth
1. Login as admin
2. Go to System Statistics tab
3. Note the current numbers
4. Have a donor register and donate blood
5. Refresh statistics
6. Verify "Total Donors" and "Total Blood Units" increased

### Scenario 4: Check Blood Distribution
1. Login as admin
2. Go to System Statistics tab
3. View "Blood Units by Blood Group"
4. Identify which blood groups have low inventory
5. This helps admins understand system-wide blood availability

---

## Common Issues and Solutions

### Issue: "Failed to load pending hospitals"
**Solution**: 
- Check backend is running on port 5000
- Verify admin token is valid (try logging out and back in)
- Check browser console for detailed error

### Issue: Approve/Reject buttons not working
**Solution**:
- Check if you confirmed the dialog
- Verify backend admin routes are working
- Check browser console for errors

### Issue: Statistics not loading
**Solution**:
- Check backend is running
- Verify MongoDB connection is active
- Try manual refresh button

### Issue: Auto-refresh not working
**Solution**:
- This is normal - auto-refresh only works when tab is active
- If you switch tabs, auto-refresh pauses
- Manual refresh always works

---

## API Endpoints Used

### Pending Hospitals Tab
- `GET /api/admin/pending-hospitals` - Fetch pending hospitals
- `POST /api/admin/verify-hospital/:hospitalID` - Approve hospital
- `DELETE /api/admin/reject-hospital/:hospitalID` - Reject hospital

### System Statistics Tab
- `GET /api/admin/statistics` - Fetch system statistics

---

## Visual Reference

### Pending Hospitals Table
```
Hospital Name          | Email                      | Location        | Wallet Address | Registration Date | Actions
City General Hospital  | test.hospital@example.com  | Mumbai, 400001  | 0x1234...5678  | 2024-01-15       | [Approve] [Reject]
Metro Medical Center   | metro@example.com          | Delhi, 110001   | 0xabcd...ef01  | 2024-01-16       | [Approve] [Reject]
```

### Statistics Summary Cards
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Total Donors    │  │ Verified        │  │ Total Blood     │  │ Active          │
│                 │  │ Hospitals       │  │ Units           │  │ Emergencies     │
│      64         │  │      60         │  │      150        │  │       3         │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Blood Units by Status
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Collected │  │  Stored  │  │Transferred│ │   Used   │  │ Expired  │
│    45    │  │    30    │  │    25     │ │    40    │  │    10    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## Next Steps After Testing

1. Verify approved hospitals can now access all dashboard features
2. Check that rejected hospitals cannot login
3. Monitor system statistics to understand blood supply trends
4. Use statistics to identify blood groups that need more donations

---

## Notes

- Admin panel is read-only except for hospital verification actions
- Statistics provide system-wide visibility for monitoring
- Auto-refresh ensures admins see latest data without manual intervention
- Confirmation dialogs prevent accidental approvals/rejections
- All actions are logged in backend console for audit trail
