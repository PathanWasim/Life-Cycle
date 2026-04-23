# LifeChain Deployment Guide

Complete guide for deploying LifeChain Blood Supply Management System to production.

---

## 📋 Project Structure Overview

Your LifeChain project consists of **4 main components**:

```
LifeChain/
├── frontend/          # React + Vite (Deploy to Vercel)
├── backend/           # Node.js + Express API (Deploy to Railway)
├── blockchain/        # Smart Contracts (Already deployed to Polygon Amoy)
└── ai-service/        # Python Flask AI Service (Deploy to Railway)
```

---

## 🎯 Deployment Strategy

### **Recommended Hosting Plan:**

| Component | Platform | Why |
|-----------|----------|-----|
| **Frontend** | Vercel | Best for React/Vite, automatic builds, CDN, free SSL |
| **Backend API** | Railway | Node.js support, MongoDB integration, environment variables |
| **AI Service** | Railway | Python support, can run alongside backend |
| **Database** | MongoDB Atlas | Free tier, reliable, global distribution |
| **Blockchain** | Polygon Amoy | Already deployed (no hosting needed) |
| **Redis** | Upstash | Free tier, serverless Redis |

---

## 📦 What to Deploy

### ✅ **Deploy These Folders:**
1. **`frontend/`** → Vercel
2. **`backend/`** → Railway
3. **`ai-service/`** → Railway (separate service)

### ❌ **Don't Deploy These:**
- `blockchain/` - Smart contracts are already deployed to Polygon Amoy
- `.git/` - Version control (not needed in production)
- `.kiro/` - Development specs
- `node_modules/` - Will be installed automatically
- `.env` files - Use platform environment variables instead

---

## 🚀 Step-by-Step Deployment

---

## PART 1: Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (Free M0 tier)
4. Choose cloud provider and region (closest to your users)

### 2. Configure Database Access
1. Go to **Database Access** → Add New Database User
2. Create username and password (save these!)
3. Set privileges to "Read and write to any database"

### 3. Configure Network Access
1. Go to **Network Access** → Add IP Address
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Or add specific IPs for better security

### 4. Get Connection String
1. Click **Connect** on your cluster
2. Choose "Connect your application"
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lifechain?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your credentials

---

## PART 2: Redis Setup (Upstash)

### 1. Create Upstash Account
1. Go to https://upstash.com/
2. Sign up for free account
3. Create a new Redis database

### 2. Get Redis URL
1. Copy the Redis URL from dashboard:
   ```
   redis://default:xxxxx@xxxxx.upstash.io:6379
   ```

---

## PART 3: Backend Deployment (Railway)

### 1. Prepare Backend for Deployment

Create `backend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Deploy to Railway

#### Option A: Using Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to backend folder
cd backend

# Initialize Railway project
railway init

# Deploy
railway up
```

#### Option B: Using Railway Dashboard (Recommended)
1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose "backend" folder as root directory
6. Railway will auto-detect Node.js

### 3. Configure Environment Variables in Railway

Go to your Railway project → Variables → Add all these:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lifechain?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=24h

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your-wallet-private-key
CONTRACT_ADDRESS=your-deployed-contract-address

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# AI Service URL (will update after AI service deployment)
AI_SERVICE_URL=https://your-ai-service.railway.app

# Redis (from Upstash)
REDIS_URL=redis://default:xxxxx@xxxxx.upstash.io:6379

# Frontend URL (will update after frontend deployment)
FRONTEND_URL=https://your-app.vercel.app
```

### 4. Get Backend URL
After deployment, Railway will provide a URL like:
```
https://your-backend.railway.app
```
Save this URL - you'll need it for frontend configuration.

---

## PART 4: AI Service Deployment (Railway)

### 1. Prepare AI Service for Deployment

Create `ai-service/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python app.py",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `ai-service/runtime.txt`:
```
python-3.11
```

### 2. Deploy to Railway
1. In Railway dashboard, click "New" → "Empty Service"
2. Connect to your GitHub repo
3. Choose "ai-service" folder as root directory
4. Railway will auto-detect Python

### 3. Configure Environment Variables
```env
PORT=5001
FLASK_ENV=production
```

### 4. Get AI Service URL
After deployment, Railway will provide a URL like:
```
https://your-ai-service.railway.app
```

### 5. Update Backend Environment Variable
Go back to your backend Railway project and update:
```env
AI_SERVICE_URL=https://your-ai-service.railway.app
```

---

## PART 5: Frontend Deployment (Vercel)

### 1. Prepare Frontend for Deployment

Update `frontend/vite.config.js` to ensure proper build:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
})
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend folder
cd frontend

# Deploy
vercel

# For production
vercel --prod
```

#### Option B: Using Vercel Dashboard (Recommended)
1. Go to https://vercel.com/
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3. Configure Environment Variables in Vercel

Go to Project Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend.railway.app
```

### 4. Deploy
Click "Deploy" - Vercel will build and deploy automatically.

### 5. Get Frontend URL
Vercel will provide a URL like:
```
https://your-app.vercel.app
```

### 6. Update Backend CORS
Go back to Railway backend and update:
```env
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS in Backend
Ensure `backend/server.js` has correct CORS configuration:
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 2. Test All Endpoints
Visit your frontend URL and test:
- ✅ User registration
- ✅ User login
- ✅ Blood donation
- ✅ Hospital inventory
- ✅ Admin panel
- ✅ AI predictions

### 3. Monitor Logs
- **Railway:** Check logs in Railway dashboard
- **Vercel:** Check logs in Vercel dashboard

---

## 📝 Environment Variables Checklist

### Backend (Railway)
- [ ] PORT
- [ ] NODE_ENV
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] JWT_EXPIRE
- [ ] BLOCKCHAIN_RPC_URL
- [ ] PRIVATE_KEY
- [ ] CONTRACT_ADDRESS
- [ ] SMTP_HOST
- [ ] SMTP_PORT
- [ ] SMTP_USER
- [ ] SMTP_PASS
- [ ] AI_SERVICE_URL
- [ ] REDIS_URL
- [ ] FRONTEND_URL

### AI Service (Railway)
- [ ] PORT
- [ ] FLASK_ENV

### Frontend (Vercel)
- [ ] VITE_API_URL

---

## 🔒 Security Checklist

- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Never commit .env files to Git
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB IP whitelist (or use 0.0.0.0/0 for Railway)
- [ ] Use HTTPS for all services (automatic on Railway/Vercel)
- [ ] Keep private keys secure
- [ ] Use Gmail App Passwords (not regular password)
- [ ] Enable rate limiting in production

---

## 🐛 Troubleshooting

### Frontend can't connect to Backend
- Check VITE_API_URL is correct
- Check CORS configuration in backend
- Check backend is running (visit backend URL)

### Backend can't connect to MongoDB
- Check MONGODB_URI is correct
- Check MongoDB Network Access allows Railway IPs
- Check MongoDB user has correct permissions

### Email not sending
- Check SMTP credentials
- Use Gmail App Password (not regular password)
- Check SMTP_PORT and SMTP_HOST are correct

### AI Service not responding
- Check AI_SERVICE_URL in backend
- Check AI service is running in Railway
- Check Python dependencies installed correctly

---

## 📊 Cost Estimate

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Vercel** | Unlimited hobby projects | $20/month Pro |
| **Railway** | $5 free credit/month | $5/month + usage |
| **MongoDB Atlas** | 512MB free | $9/month+ |
| **Upstash Redis** | 10K commands/day | $0.20/100K commands |
| **Polygon Amoy** | Free testnet | Mainnet gas fees |
| **Total** | ~$0-5/month | ~$35+/month |

---

## 🎉 Deployment Complete!

Your LifeChain application is now live at:
- **Frontend:** https://your-app.vercel.app
- **Backend API:** https://your-backend.railway.app
- **AI Service:** https://your-ai-service.railway.app

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Upstash Documentation](https://docs.upstash.com/)
- [Polygon Documentation](https://docs.polygon.technology/)

---

## 🆘 Need Help?

If you encounter issues:
1. Check Railway/Vercel logs
2. Verify all environment variables
3. Test each service independently
4. Check MongoDB connection
5. Verify blockchain contract address

---

**Good luck with your deployment! 🚀**
