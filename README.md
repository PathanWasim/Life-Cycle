# 🩸 LifeChain - Intelligent Blood Supply Management System

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/cloud/atlas)
[![Polygon](https://img.shields.io/badge/Blockchain-Polygon%20Amoy-purple.svg)](https://polygon.technology/)

LifeChain is a hybrid healthcare supply-chain system that combines traditional database operations with selective blockchain verification to ensure transparency, medical compliance, and efficient blood distribution.

## 🎯 Features

- **Medical Compliance**: Enforces 56-day donation rule and health criteria validation
- **Blockchain Verification**: Immutable audit trail for donation, transfer, and usage milestones on Polygon Amoy testnet
- **AI-Powered**: Demand prediction, donor recommendations, and expiry alerts
- **Location-Based Matching**: Smart donor filtering for emergency requests
- **Digital Certificates**: Verifiable PDF certificates with QR codes
- **Role-Based Access**: Separate interfaces for donors, hospitals, and admins

## 🏗️ Architecture

```
LifeChain/
├── backend/          # Node.js + Express API
├── blockchain/       # Solidity Smart Contracts
├── ai-service/       # Python Flask AI Microservice
├── frontend/         # React Application (Coming Soon)
└── docs/            # Documentation
```

### Technology Stack

**Backend:**
- Node.js 18+ with Express.js
- MongoDB Atlas (Database)
- JWT Authentication
- Bcrypt Password Hashing

**Blockchain:**
- Solidity 0.8.20
- Hardhat Development Framework
- Ethers.js v6
- Polygon Amoy Testnet

**AI Service:**
- Python 3.9+ with Flask
- Scikit-learn for ML models
- Pandas for data processing

**Frontend:**
- React 18 with Vite
- Tailwind CSS
- Axios for API calls

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- Python 3.9 or higher
- MongoDB Atlas account (free tier)
- MetaMask wallet with Polygon Amoy testnet

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nilesh-sabale/LifeChain.git
cd LifeChain
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other credentials
npm start
```

3. **Blockchain Setup**
```bash
cd blockchain
npm install
cp .env.example .env
# Edit .env with your wallet private key
npx hardhat compile
npm run deploy
```

4. **AI Service Setup**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## 📚 Documentation

- [MongoDB Setup Guide](./docs/MONGODB_SETUP.md)
- [MetaMask & Blockchain Setup](./docs/METAMASK_SETUP.md)
- [Blockchain Setup Complete](./docs/BLOCKCHAIN_SETUP_COMPLETE.md)
- [Implementation Progress](./docs/PROGRESS.md)

## 🔐 Security

- All sensitive data is stored in `.env` files (not committed to Git)
- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Rate limiting enabled (100 requests per 15 minutes)
- Using testnet only (no real cryptocurrency)

## 🧪 Testing

```bash
# Backend tests
cd backend
node test-auth.js

# Blockchain tests
cd blockchain
npx hardhat test

# Verify blockchain setup
npx hardhat run scripts/verify-setup.js --network amoy
```

## 📊 Current Status

✅ **Completed:**
- Project setup and environment configuration
- MongoDB schemas and database connection
- Blockchain foundation (Smart contract deployed)
- Backend authentication and middleware
- JWT-based authentication system
- Role-based access control

🚧 **In Progress:**
- Blockchain service integration
- Donor eligibility validation
- Blood donation recording
- AI microservice implementation
- Frontend development

## 🔗 Deployed Smart Contract

- **Network**: Polygon Amoy Testnet
- **Contract Address**: `0xD14cd2fB4c97E980A6e93ee4C813787a23c1B009`
- **Explorer**: [View on PolygonScan](https://amoy.polygonscan.com/address/0xD14cd2fB4c97E980A6e93ee4C813787a23c1B009)

## 🤝 Contributing

This is an educational project. Feel free to fork and modify for learning purposes.

## 📄 License

ISC

## 👥 Author

Nilesh Sabale - [GitHub](https://github.com/nilesh-sabale)

## 🙏 Acknowledgments

- MongoDB Atlas for free database hosting
- Polygon for free testnet access
- Hardhat for blockchain development tools
- All open-source contributors

---

**⚠️ Disclaimer**: This is a development/educational project using testnet. Not for production use with real medical data.
