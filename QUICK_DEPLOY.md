# LifeChain - Quick Deploy Reference

**5-Minute Deployment Overview**

---

## 📦 What to Deploy

| Component | Platform | Folder | URL After Deploy |
|-----------|----------|--------|------------------|
| **Frontend** | Vercel | `frontend/` | https://your-app.vercel.app |
| **Backend** | Railway | `backend/` | https://your-backend.railway.app |
| **AI Service** | Railway | `ai-service/` | https://your-ai-service.railway.app |
| **Database** | MongoDB Atlas | N/A | Connection string |
| **Cache** | Upstash Redis | N/A | Connection string |

---

## 🚀 Deployment Order

```
1. MongoDB Atlas  →  Get connection string
2. Upstash Redis  →  Get Redis URL
3. Railway Backend  →  Get backend URL
4. Railway AI Service  →  Get AI service URL
5. Vercel Frontend  →  Get frontend URL
6. Update CORS in backend with frontend URL
```

---

## 🔑 Environment Variables Quick Reference

### Backend (Railway)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-32-char-secret
JWT_EXPIRE=24h
BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your-wallet-key
CONTRACT_ADDRESS=your-contract-address
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
AI_SERVICE_URL=https://your-ai-service.railway.app
REDIS_URL=redis://...
FRONTEND_URL=https://your-app.vercel.app
```

### AI Service (Railway)
```env
PORT=5001
FLASK_ENV=production
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.railway.app
```

---

## ⚡ Railway Deploy Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy Backend
cd backend
railway init
railway up

# Deploy AI Service
cd ../ai-service
railway init
railway up
```

---

## ⚡ Vercel Deploy Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy Frontend
cd frontend
vercel
vercel --prod
```

---

## 🔗 Important Links

- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com/
- **Upstash Console:** https://console.upstash.com/

---

## ✅ Post-Deploy Checklist

- [ ] All 3 services deployed (Frontend, Backend, AI)
- [ ] All environment variables set
- [ ] Frontend URL updated in backend CORS
- [ ] Test user registration
- [ ] Test user login
- [ ] Test blood donation
- [ ] Check all logs for errors

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend blank | Check VITE_API_URL, check browser console |
| API 500 error | Check Railway logs, verify MongoDB connection |
| CORS error | Update FRONTEND_URL in backend |
| Email not sending | Use Gmail app password, not regular password |
| AI not working | Check AI_SERVICE_URL in backend |

---

## 💰 Cost Summary

- **Vercel:** Free (hobby)
- **Railway:** $5/month free credit
- **MongoDB Atlas:** Free (512MB)
- **Upstash Redis:** Free (10K commands/day)
- **Total:** ~$0-5/month

---

## 📱 Test Your Deployment

1. Visit frontend URL
2. Register new user
3. Login
4. Create blood donation
5. Check admin panel
6. Verify email received

---

**Need detailed instructions? See `DEPLOYMENT_GUIDE.md`**
