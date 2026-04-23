# LifeChain Backend API

Node.js + Express backend for LifeChain blood supply management system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Environment Variables

See `.env.example` for all required configuration values.

### MongoDB Setup

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 free tier)
3. Create database user
4. Whitelist your IP (0.0.0.0/0 for development)
5. Get connection string and add to `.env`

### Email Setup (Gmail)

1. Enable 2-Step Verification in Google Account
2. Generate App Password: Account → Security → 2-Step Verification → App passwords
3. Use app password in `.env` (not your regular password)

## API Documentation

API endpoints are documented in the design document:
`.kiro/specs/lifechain-implementation-guide/design.md`

## Project Structure

```
backend/
├── config/          # Database and blockchain configuration
├── controllers/     # Request handlers
├── middleware/      # Auth, validation, rate limiting
├── models/          # MongoDB schemas
├── routes/          # API routes
├── services/        # Business logic (blockchain, email, AI)
├── utils/           # Helper functions
└── server.js        # Entry point
```
