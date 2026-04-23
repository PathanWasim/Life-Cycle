# LifeChain - Quick Test Reference Card

## 🔑 Login Credentials

| Role     | Email                        | Password          | What You'll See                                    |
|----------|------------------------------|-------------------|----------------------------------------------------|
| 🩸 Donor | test.donor@example.com       | TestPassword123!  | Profile, Eligibility (Eligible), No donations      |
| 🩸 Donor | donor.1772299902464@...      | password123       | Profile, Eligibility, **3 donations** with certs   |
| 🏥 Hospital | test.hospital@example.com | HospitalPass123!  | Pending verification badge, Warning message        |
| 👨‍💼 Admin | admin@lifechain.com        | Admin@123456      | Admin panel placeholder                            |

---

## 🎯 What Each Role Sees

### 🩸 DONOR (test.donor@example.com)
```
✅ Navigation: "Test Donor" + Red Logout Button
✅ Profile: Name, Email, Blood Group O+, Age 30, Weight 70kg, Location Mumbai
✅ Eligibility: Green "Eligible" box
✅ Donations: "No donations recorded yet."
```

### 🩸 DONOR with Donations (donor.1772299902464@example.com)
```
✅ Navigation: "Michael Brown" + Red Logout Button
✅ Profile: Name, Email, Blood Group O-, Age, Weight, Location
✅ Eligibility: Status based on last donation
✅ Donations: Table with 3 donations
   - Date, Blood Group, Hospital, Status badges
   - "View TX" blockchain links
   - "Download" certificate buttons
```

### 🏥 HOSPITAL (test.hospital@example.com)
```
✅ Navigation: "Test City Hospital" + Yellow "Pending" Badge + Red Logout Button
✅ Warning: Yellow box - "Pending admin verification"
✅ Message: Placeholder for Task 27 features
```

### 👨‍💼 ADMIN (admin@lifechain.com)
```
✅ Navigation: "Admin" + Red Logout Button
✅ Message: Placeholder for Task 28 features
```

---

## ⚡ Quick Test (2 minutes)

1. **Donor**: Login → See profile → Logout ✅
2. **Hospital**: Login → See pending badge → Logout ✅
3. **Admin**: Login → See placeholder → Logout ✅

---

## 🐛 Logout Button Not Visible?

**Do this NOW:**
1. Press: **Ctrl + Shift + R** (hard refresh)
2. If still not visible, restart frontend:
   ```bash
   # Stop dev server (Ctrl+C in terminal)
   cd frontend
   npm run dev
   ```

---

## 📋 Features Completed (Tasks 25-26)

✅ User registration (Donor/Hospital)
✅ User login with JWT
✅ Logout functionality
✅ Donor dashboard with profile
✅ Eligibility status display
✅ Donation history table
✅ Certificate downloads
✅ Blockchain transaction links
✅ Role-based access control
✅ Protected routes
✅ Session persistence

---

## 🔜 Coming Next (Task 27)

Hospital Dashboard will include:
- View inventory
- Record donations
- Transfer blood units
- Record usage
- Emergency requests
- AI demand predictions

---

## 💡 Need Help?

Check these files:
- `COMPLETE_TESTING_GUIDE.md` - Detailed testing instructions
- `VISUAL_TESTING_CHECKLIST.md` - Visual verification checklist
- `ROLE_TESTING_GUIDE.md` - Role-specific testing guide
- `FRONTEND_LOGIN_FIX.md` - Technical details of the fix
