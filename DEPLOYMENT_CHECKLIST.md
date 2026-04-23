# LifeChain Deployment Checklist

Use this checklist to ensure smooth deployment of your LifeChain application.

---

## 🎯 Pre-Deployment Checklist

### Code Preparation
- [ ] All code committed to Git
- [ ] No `.env` files in repository
- [ ] `.gitignore` includes sensitive files
- [ ] All dependencies listed in package.json/requirements.txt
- [ ] Build succeeds locally (`npm run build` in frontend)
- [ ] Backend starts without errors (`node server.js`)
- [ ] AI service starts without errors (`python app.py`)

### Environment Variables Prepared
- [ ] MongoDB connection string ready
- [ ] JWT secret generated (32+ characters)
- [ ] Blockchain private key and contract address ready
- [ ] Gmail app password generated
- [ ] Redis URL ready (from Upstash)

---

## 📦 Step 1: Database Setup

### MongoDB Atlas
- [ ] Account created at mongodb.com/cloud/atlas
- [ ] Free M0 cluster created
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0 or specific IPs)
- [ ] Connection string copied and saved
- [ ] Test connection from local machine

### Redis (Upstash)
- [ ] Account created at upstash.com
- [ ] Redis database created
- [ ] Redis URL copied and saved

---

## 🚂 Step 2: Backend Deployment (Railway)

### Railway Setup
- [ ] Account created at railway.app
- [ ] GitHub connected to Railway
- [ ] New project created
- [ ] Repository connected
- [ ] Root directory set to `backend`

### Environment Variables (Railway Backend)
- [ ] PORT=5000
- [ ] NODE_ENV=production
- [ ] MONGODB_URI (from MongoDB Atlas)
- [ ] JWT_SECRET (generated strong secret)
- [ ] JWT_EXPIRE=24h
- [ ] BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology
- [ ] PRIVATE_KEY (your wallet private key)
- [ ] CONTRACT_ADDRESS (your deployed contract)
- [ ] SMTP_HOST=smtp.gmail.com
- [ ] SMTP_PORT=587
- [ ] SMTP_SECURE=false
- [ ] SMTP_USER (your Gmail)
- [ ] SMTP_PASS (Gmail app password)
- [ ] REDIS_URL (from Upstash)
- [ ] AI_SERVICE_URL (will update after AI deployment)
- [ ] FRONTEND_URL (will update after Vercel deployment)

### Deployment
- [ ] Backend deployed successfully
- [ ] Backend URL noted (e.g., https://your-backend.railway.app)
- [ ] Backend health check passes (visit /api/health or root URL)
- [ ] Logs show no errors

---

## 🤖 Step 3: AI Service Deployment (Railway)

### Railway Setup
- [ ] New service created in Railway
- [ ] Same repository connected
- [ ] Root directory set to `ai-service`

### Environment Variables (Railway AI Service)
- [ ] PORT=5001
- [ ] FLASK_ENV=production

### Deployment
- [ ] AI service deployed successfully
- [ ] AI service URL noted (e.g., https://your-ai-service.railway.app)
- [ ] AI service health check passes
- [ ] Logs show no errors

### Update Backend
- [ ] Go back to backend Railway project
- [ ] Update AI_SERVICE_URL with AI service URL
- [ ] Backend redeployed automatically

---

## 🌐 Step 4: Frontend Deployment (Vercel)

### Vercel Setup
- [ ] Account created at vercel.com
- [ ] GitHub connected to Vercel
- [ ] New project created
- [ ] Repository imported
- [ ] Root directory set to `frontend`
- [ ] Framework preset set to "Vite"
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Environment Variables (Vercel)
- [ ] VITE_API_URL (backend Railway URL)

### Deployment
- [ ] Frontend deployed successfully
- [ ] Frontend URL noted (e.g., https://your-app.vercel.app)
- [ ] Website loads without errors
- [ ] No console errors in browser

### Update Backend CORS
- [ ] Go back to backend Railway project
- [ ] Update FRONTEND_URL with Vercel URL
- [ ] Backend redeployed automatically

---

## 🔧 Step 5: Post-Deployment Configuration

### Test All Features
- [ ] Visit frontend URL
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Donor dashboard accessible
- [ ] Hospital dashboard accessible
- [ ] Admin panel accessible
- [ ] Blood donation flow works
- [ ] Blood transfer works
- [ ] AI predictions work
- [ ] Email notifications sent
- [ ] Blockchain transactions recorded

### Check Integrations
- [ ] Frontend → Backend API calls work
- [ ] Backend → MongoDB connection works
- [ ] Backend → Redis connection works
- [ ] Backend → AI Service calls work
- [ ] Backend → Blockchain transactions work
- [ ] Backend → Email service works

### Monitor Logs
- [ ] Railway backend logs show no errors
- [ ] Railway AI service logs show no errors
- [ ] Vercel frontend logs show no errors
- [ ] MongoDB Atlas shows active connections

---

## 🔒 Step 6: Security Verification

### Secrets Management
- [ ] No secrets in Git repository
- [ ] All secrets in environment variables
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Private keys never exposed
- [ ] Gmail app password used (not regular password)

### Access Control
- [ ] MongoDB network access configured
- [ ] Redis password protected
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enabled (automatic on Railway/Vercel)

---

## 📊 Step 7: Performance & Monitoring

### Performance
- [ ] Frontend loads in < 3 seconds
- [ ] API responses in < 500ms
- [ ] Images optimized
- [ ] Build size reasonable

### Monitoring Setup
- [ ] Railway monitoring enabled
- [ ] Vercel analytics enabled
- [ ] Error tracking configured
- [ ] Uptime monitoring set up

---

## 🎉 Deployment Complete!

### URLs to Save
```
Frontend:     https://your-app.vercel.app
Backend API:  https://your-backend.railway.app
AI Service:   https://your-ai-service.railway.app
MongoDB:      mongodb+srv://...
Redis:        redis://...
```

### Share with Team
- [ ] Frontend URL shared
- [ ] API documentation shared
- [ ] Admin credentials shared securely
- [ ] Deployment guide shared

---

## 🐛 Troubleshooting Guide

### Frontend Issues
**Problem:** White screen / blank page
- Check browser console for errors
- Verify VITE_API_URL is correct
- Check Vercel build logs
- Verify dist folder generated correctly

**Problem:** API calls failing
- Check CORS configuration in backend
- Verify backend URL is correct
- Check network tab in browser
- Verify backend is running

### Backend Issues
**Problem:** 500 Internal Server Error
- Check Railway logs
- Verify MongoDB connection
- Check all environment variables set
- Verify Redis connection

**Problem:** MongoDB connection failed
- Check MONGODB_URI format
- Verify MongoDB user credentials
- Check network access in MongoDB Atlas
- Verify database name in connection string

**Problem:** Email not sending
- Verify Gmail app password (not regular password)
- Check SMTP settings
- Verify Gmail account has 2FA enabled
- Check Railway logs for email errors

### AI Service Issues
**Problem:** AI predictions not working
- Check AI service Railway logs
- Verify AI_SERVICE_URL in backend
- Check Python dependencies installed
- Verify trained models exist

### Blockchain Issues
**Problem:** Transactions failing
- Check PRIVATE_KEY is correct
- Verify CONTRACT_ADDRESS is correct
- Check wallet has MATIC for gas
- Verify RPC URL is correct

---

## 📞 Support Resources

- **Railway:** https://railway.app/help
- **Vercel:** https://vercel.com/support
- **MongoDB:** https://www.mongodb.com/support
- **Upstash:** https://upstash.com/docs

---

## 🔄 Redeployment

### When to Redeploy
- Code changes pushed to Git
- Environment variables updated
- Dependencies updated

### How to Redeploy
- **Vercel:** Automatic on Git push
- **Railway:** Automatic on Git push
- **Manual:** Use Railway/Vercel dashboard

---

**Congratulations! Your LifeChain application is now live! 🎉**
