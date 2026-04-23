# Platform-Specific Deployment Commands

Quick reference for Railway and Vercel CLI commands.

---

## 🚂 Railway Commands

### Installation
```bash
npm install -g @railway/cli
```

### Login
```bash
railway login
```

### Deploy Backend
```bash
cd backend
railway init
railway up
```

### Deploy AI Service
```bash
cd ai-service
railway init
railway up
```

### View Logs
```bash
railway logs
```

### Open Dashboard
```bash
railway open
```

### Set Environment Variable
```bash
railway variables set KEY=value
```

### Link to Existing Project
```bash
railway link
```

---

## ▲ Vercel Commands

### Installation
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```

### Deploy Frontend (Development)
```bash
cd frontend
vercel
```

### Deploy Frontend (Production)
```bash
cd frontend
vercel --prod
```

### View Logs
```bash
vercel logs
```

### Set Environment Variable
```bash
vercel env add VITE_API_URL
```

### List Deployments
```bash
vercel ls
```

### Remove Deployment
```bash
vercel rm [deployment-url]
```

---

## 🔄 Continuous Deployment

### Railway
- Automatically deploys on Git push to main branch
- Configure in Railway dashboard → Settings → Deploy Triggers

### Vercel
- Automatically deploys on Git push to main branch
- Configure in Vercel dashboard → Settings → Git

---

## 🌐 Custom Domains

### Railway
```bash
# Add custom domain
railway domain add yourdomain.com

# View domains
railway domain list
```

### Vercel
```bash
# Add custom domain
vercel domains add yourdomain.com

# View domains
vercel domains ls
```

---

## 📊 Monitoring

### Railway
```bash
# View metrics
railway metrics

# View status
railway status
```

### Vercel
```bash
# View deployment info
vercel inspect [deployment-url]
```

---

## 🔧 Troubleshooting Commands

### Railway
```bash
# View environment variables
railway variables

# Restart service
railway restart

# View build logs
railway logs --build
```

### Vercel
```bash
# View build logs
vercel logs [deployment-url]

# Redeploy
vercel --force
```

---

## 🗑️ Cleanup

### Railway
```bash
# Remove project
railway down
```

### Vercel
```bash
# Remove project
vercel remove [project-name]
```

---

## 📝 Configuration Files

### Railway
- `railway.toml` - Railway configuration
- `Procfile` - Process definition
- `runtime.txt` - Python version (for AI service)

### Vercel
- `vercel.json` - Vercel configuration
- `.vercelignore` - Files to ignore

---

## 🔐 Secrets Management

### Railway
```bash
# Add secret
railway variables set SECRET_KEY=value

# View secrets (values hidden)
railway variables
```

### Vercel
```bash
# Add secret
vercel env add SECRET_KEY

# Pull environment variables
vercel env pull
```

---

## 🚀 Quick Deploy Script

Create `deploy.sh` in project root:

```bash
#!/bin/bash

echo "🚀 Deploying LifeChain..."

# Deploy Backend
echo "📦 Deploying Backend..."
cd backend
railway up
cd ..

# Deploy AI Service
echo "🤖 Deploying AI Service..."
cd ai-service
railway up
cd ..

# Deploy Frontend
echo "🌐 Deploying Frontend..."
cd frontend
vercel --prod
cd ..

echo "✅ Deployment complete!"
```

Make executable:
```bash
chmod +x deploy.sh
```

Run:
```bash
./deploy.sh
```

---

## 📱 Mobile App (Future)

If you build a mobile app later:

### Expo/React Native
```bash
# Deploy to Expo
expo publish

# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

---

## 🔄 Rollback

### Railway
```bash
# View deployments
railway deployments

# Rollback to previous
railway rollback [deployment-id]
```

### Vercel
```bash
# View deployments
vercel ls

# Promote deployment to production
vercel promote [deployment-url]
```

---

## 📊 Cost Management

### Railway
```bash
# View usage
railway usage

# View billing
railway billing
```

### Vercel
- Check dashboard for usage: https://vercel.com/dashboard/usage

---

## 🆘 Help Commands

### Railway
```bash
railway help
railway [command] --help
```

### Vercel
```bash
vercel help
vercel [command] --help
```

---

## 🔗 Useful Links

- **Railway CLI Docs:** https://docs.railway.app/develop/cli
- **Vercel CLI Docs:** https://vercel.com/docs/cli
- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard

---

**Pro Tip:** Use `railway link` and `vercel link` to connect your local project to deployed services for easier management!
