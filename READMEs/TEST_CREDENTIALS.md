# LifeChain - Test Credentials Quick Reference

## 🚀 Frontend URL
**http://localhost:5173**

---

## 🔑 Test Accounts

### 🩸 DONOR
```
Email:    test.donor@example.com
Password: TestPassword123!
```

**After Login You'll See:**
- ✅ Complete profile (Name, Email, Blood Group O+, Age 30, Weight 70kg, Location Mumbai)
- ✅ Green "Eligible" status box
- ✅ Empty donation history (no donations yet)
- ✅ Logout button (top right, red)

---

### 🏥 HOSPITAL
```
Email:    test.hospital@example.com
Password: TestPassword123!
```

**After Login You'll See:**
- ✅ Hospital name: "Test City Hospital"
- ✅ Yellow "Pending Verification" badge
- ✅ Warning message about pending verification
- ✅ Placeholder dashboard message
- ✅ Logout button (top right, red)

**Note**: This hospital is NOT verified. It cannot record donations until an admin verifies it.

---

### 👨‍💼 ADMIN
```
Email:    admin@lifechain.com
Password: Admin@1234
```

**After Login You'll See:**
- ✅ Admin Panel heading
- ✅ Placeholder message
- ✅ Logout button (top right, red)

**Note**: Full admin features (verify hospitals, view stats) will be implemented in Task 28.

---

## 🎯 Quick Test Flow

### 1. Test Donor Role (2 minutes)
```
1. Go to http://localhost:5173
2. Login: test.donor@example.com / TestPassword123!
3. Verify: Profile, Eligibility, Empty donations
4. Click: Logout button
```

### 2. Test Hospital Role (2 minutes)
```
1. Login: test.hospital@example.com / TestPassword123!
2. Verify: Hospital name, Pending badge, Warning message
3. Click: Logout button
```

### 3. Test Admin Role (2 minutes)
```
1. Login: admin@lifechain.com / Admin@1234
2. Verify: Admin panel placeholder
3. Click: Logout button
```

### 4. Test Access Control (2 minutes)
```
1. Login as donor
2. Try URL: http://localhost:5173/hospital/dashboard
3. Verify: Redirected to /unauthorized
4. Try URL: http://localhost:5173/admin/panel
5. Verify: Redirected to /unauthorized
```

---

## 🐛 Troubleshooting

### Logout Button Not Visible?
1. **Hard refresh**: Ctrl + Shift + R
2. **Check console**: F12 → Console tab (look for errors)
3. **Restart frontend**: Stop dev server (Ctrl+C) and run `npm run dev` again

### Login Fails?
- Double-check password (case-sensitive!)
- Make sure backend is running: http://localhost:5000/api/health

### Dashboard Blank?
- Check browser console (F12) for errors
- Check Network tab for failed API calls
- Verify backend is responding: http://localhost:5000/api/health

---

## 📊 What's Working (Tasks 25-26)

✅ **Authentication System**
- Registration (Donor/Hospital)
- Login with JWT
- Logout
- Session persistence

✅ **Donor Dashboard**
- Profile display
- Eligibility status
- Donation history (empty for test account)
- Certificate download (when donations exist)

✅ **Role-Based Access**
- Protected routes
- Unauthorized redirects
- Role-specific dashboards

🔄 **Coming Next (Task 27)**
- Hospital Dashboard with full features
- Inventory management
- Record donations
- Transfer blood units
- Record usage

---

## 💡 Pro Tips

1. **Keep DevTools open** (F12) while testing to catch errors immediately
2. **Use Network tab** to see all API calls and responses
3. **Test in incognito mode** to verify fresh session behavior
4. **Try different browsers** (Chrome, Firefox, Edge) to ensure compatibility

---

## 🎉 Success!

If you can see all the elements in the checklists above, your frontend is working perfectly! You've completed Tasks 25-26 successfully.

**Ready to continue?** Let me know and we'll move on to Task 27 (Hospital Dashboard)!
