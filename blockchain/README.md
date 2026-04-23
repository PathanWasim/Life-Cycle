# LifeChain Smart Contracts

Solidity smart contracts for recording blood supply chain milestones on Polygon Amoy testnet.

## What is Blockchain?

Blockchain is a distributed ledger where data is stored permanently and cannot be altered. We use it to create an immutable audit trail for blood donations, transfers, and usage.

## What is Polygon Amoy?

Polygon Amoy is a test blockchain network (testnet) that works exactly like the real Polygon blockchain but uses fake cryptocurrency (test MATIC) that has no real-world value. Perfect for development!

## Setup

### 1. Install MetaMask

1. Install [MetaMask browser extension](https://metamask.io/)
2. Create a new wallet
3. **IMPORTANT**: Save your seed phrase securely (12 words)
4. Never share your seed phrase or private key!

### 2. Add Polygon Amoy Network

1. Open MetaMask
2. Click network dropdown → Add Network → Add network manually
3. Enter these details:
   - Network Name: `Polygon Amoy Testnet`
   - RPC URL: `https://rpc-amoy.polygon.technology`
   - Chain ID: `80002`
   - Currency Symbol: `MATIC`
   - Block Explorer: `https://amoy.polygonscan.com`

### 3. Get Test MATIC (Free!)

1. Copy your wallet address from MetaMask
2. Visit [Polygon Faucet](https://faucet.polygon.technology/)
3. Select "Polygon Amoy" network
4. Paste your address and request tokens
5. Wait 1-2 minutes for tokens to arrive

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
- Your wallet private key (from MetaMask: Settings → Security & Privacy → Show Private Key)
- **WARNING**: Never share or commit your private key!

### 6. Compile Smart Contract

```bash
npx hardhat compile
```

### 7. Deploy to Polygon Amoy

```bash
npm run deploy
```

Save the contract address that's printed - you'll need it for the backend!

## Verify Deployment

1. Copy the contract address from deployment output
2. Visit https://amoy.polygonscan.com/
3. Paste your contract address
4. You should see your deployed contract!

## Project Structure

```
blockchain/
├── contracts/       # Solidity smart contracts
├── scripts/         # Deployment scripts
├── test/           # Smart contract tests
└── hardhat.config.js # Hardhat configuration
```

## Troubleshooting

**"Insufficient funds" error**: Get more test MATIC from the faucet

**"Transaction failed"**: Check your wallet has test MATIC and network is set to Polygon Amoy

**"Cannot find module"**: Run `npm install` again
