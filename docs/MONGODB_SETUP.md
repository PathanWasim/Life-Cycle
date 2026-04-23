# MongoDB Atlas Setup Guide

Follow these steps to set up your free MongoDB database:

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email or Google account
3. Verify your email address

## Step 2: Create a Free Cluster

1. After logging in, click "Build a Database"
2. Select **M0 FREE** tier (512MB storage, perfect for development)
3. Choose a cloud provider and region (select one closest to you)
4. Cluster Name: `LifeChain` (or keep default)
5. Click "Create"

## Step 3: Create Database User

1. You'll see "Security Quickstart"
2. Choose "Username and Password" authentication
3. Create a username (e.g., `lifechain_admin`)
4. Create a strong password (save this!)
5. Click "Create User"

## Step 4: Set IP Whitelist

1. In "Where would you like to connect from?"
2. For development, click "Add My Current IP Address"
3. Or add `0.0.0.0/0` to allow from anywhere (less secure, only for development)
4. Click "Finish and Close"

## Step 5: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: **Node.js**
4. Version: **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update .env File

1. Open `backend/.env`
2. Replace `<password>` with your actual database password
3. Add database name after `.net/`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lifechain?retryWrites=true&w=majority
   ```

## Step 7: Test Connection

Run the backend server:
```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Database: lifechain
```

## Troubleshooting

### "MongoServerError: bad auth"
- Check your username and password are correct
- Make sure you replaced `<password>` with actual password

### "MongooseServerSelectionError: connect ETIMEDOUT"
- Check your IP is whitelisted in MongoDB Atlas
- Try adding `0.0.0.0/0` to IP whitelist

### "Database connection failed"
- Verify your internet connection
- Check the connection string format is correct
- Ensure database name is added after `.net/`

## For Now (Testing Without MongoDB)

If you haven't set up MongoDB yet, you can still test the server. It will show a connection error but the server will still run. We'll set up MongoDB before implementing features that need the database.
