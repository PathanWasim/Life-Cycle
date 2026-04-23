# MetaMask Wallet Setup Guide

## What is MetaMask?

MetaMask is a cryptocurrency wallet that runs as a browser extension. Think of it like a digital wallet that:
- Stores your blockchain account (wallet address)
- Holds your private keys securely
- Lets you interact with blockchain networks
- Signs transactions on your behalf

**Important**: Your wallet is like a bank account. The private key is like your password - NEVER share it!

---

## Step 1: Install MetaMask

### For Chrome/Brave/Edge:
1. Go to [https://metamask.io/download/](https://metamask.io/download/)
2. Click "Install MetaMask for Chrome"
3. Click "Add to Chrome" → "Add Extension"
4. MetaMask icon will appear in your browser toolbar

### For Firefox:
1. Go to [https://metamask.io/download/](https://metamask.io/download/)
2. Click "Install MetaMask for Firefox"
3. Click "Add to Firefox" → "Add"

---

## Step 2: Create a New Wallet

1. Click the MetaMask icon in your browser
2. Click "Get Started"
3. Click "Create a new wallet"
4. Create a strong password (you'll use this to unlock MetaMask)
5. Click "I agree" to terms

---

## Step 3: Save Your Secret Recovery Phrase (CRITICAL!)

⚠️ **THIS IS THE MOST IMPORTANT STEP!**

1. Click "Secure my wallet"
2. You'll see 12 words (your "seed phrase" or "recovery phrase")
3. **Write these words down on paper** in order
4. **Store the paper in a safe place** (like a safe or locked drawer)
5. Click "Next"
6. Confirm the words by clicking them in order
7. Click "Confirm"

### Why is this important?
- These 12 words can recover your wallet if you lose access
- Anyone with these words can access your wallet
- **NEVER share these words with anyone**
- **NEVER type them into any website**
- **NEVER take a screenshot** (can be hacked)

---

## Step 4: Add Polygon Amoy Testnet

By default, MetaMask shows Ethereum mainnet. We need to add Polygon Amoy testnet.

### Method 1: Automatic (Easiest)
1. Go to [https://chainlist.org/](https://chainlist.org/)
2. Search for "Polygon Amoy"
3. Click "Connect Wallet" → Approve in MetaMask
4. Click "Add to MetaMask" next to Polygon Amoy
5. Approve the network addition

### Method 2: Manual
1. Open MetaMask
2. Click the network dropdown (top left, says "Ethereum Mainnet")
3. Click "Add Network" → "Add a network manually"
4. Enter these details:

```
Network Name: Polygon Amoy Testnet
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency Symbol: MATIC
Block Explorer: https://amoy.polygonscan.com
```

5. Click "Save"
6. Switch to "Polygon Amoy Testnet" from the network dropdown

---

## Step 5: Copy Your Wallet Address

1. Make sure you're on "Polygon Amoy Testnet"
2. Click on your account name at the top
3. Your wallet address will be shown (starts with 0x...)
4. Click on it to copy
5. Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

**Save this address** - you'll need it for:
- Getting test MATIC tokens
- Deploying smart contracts
- Backend configuration

---

## Step 6: Get Free Test MATIC Tokens

Test MATIC is fake cryptocurrency with no real value - perfect for development!

### Option 1: Polygon Faucet (Recommended)
1. Go to [https://faucet.polygon.technology/](https://faucet.polygon.technology/)
2. Select "Polygon Amoy" network
3. Paste your wallet address
4. Complete the CAPTCHA
5. Click "Submit"
6. Wait 1-2 minutes

### Option 2: Alchemy Faucet
1. Go to [https://www.alchemy.com/faucets/polygon-amoy](https://www.alchemy.com/faucets/polygon-amoy)
2. Sign in with Google/GitHub
3. Paste your wallet address
4. Click "Send Me MATIC"

### Option 3: QuickNode Faucet
1. Go to [https://faucet.quicknode.com/polygon/amoy](https://faucet.quicknode.com/polygon/amoy)
2. Paste your wallet address
3. Complete verification
4. Click "Request"

---

## Step 7: Verify You Received MATIC

1. Open MetaMask
2. Make sure you're on "Polygon Amoy Testnet"
3. You should see a balance (e.g., "0.5 MATIC")
4. If you don't see it, wait a few more minutes and refresh

---

## Step 8: Get Your Private Key (For Backend)

⚠️ **ONLY do this for development/testnet wallets!**

1. Open MetaMask
2. Click the 3 dots (⋮) next to your account
3. Click "Account Details"
4. Click "Show Private Key"
5. Enter your MetaMask password
6. Click "Confirm"
7. Copy the private key (long string of letters and numbers)

**IMPORTANT:**
- This private key is ONLY for your testnet wallet
- NEVER use your main wallet's private key
- NEVER commit this to Git
- Keep it in your `.env` file only

---

## Step 9: Update Backend Configuration

1. Open `backend/.env`
2. Find the line: `PRIVATE_KEY=your-wallet-private-key-from-metamask`
3. Replace with your actual private key:
   ```
   PRIVATE_KEY=abc123def456...your-actual-private-key
   ```
4. Save the file

---

## ✅ Verification Checklist

Before proceeding, make sure you have:

- [ ] MetaMask installed and unlocked
- [ ] Wallet created with 12-word recovery phrase saved safely
- [ ] Polygon Amoy Testnet added to MetaMask
- [ ] Switched to Polygon Amoy Testnet
- [ ] Wallet address copied (starts with 0x)
- [ ] Test MATIC received (check balance in MetaMask)
- [ ] Private key copied
- [ ] `backend/.env` updated with private key

---

## Troubleshooting

### "I don't see any MATIC in my wallet"
- Make sure you're on "Polygon Amoy Testnet" (not Ethereum Mainnet)
- Wait 2-3 minutes after requesting from faucet
- Try a different faucet
- Check transaction on [https://amoy.polygonscan.com/](https://amoy.polygonscan.com/)

### "Faucet says I already requested"
- Most faucets limit requests to once per 24 hours
- Try a different faucet
- 0.5 MATIC is enough for hundreds of transactions

### "I lost my recovery phrase"
- If you still have access to MetaMask, you can view it:
  - Settings → Security & Privacy → Reveal Secret Recovery Phrase
- If you lost access, you'll need to create a new wallet

### "MetaMask is locked"
- Click the MetaMask icon
- Enter your password
- Click "Unlock"

---

## Next Steps

Once you have:
1. ✅ MetaMask installed
2. ✅ Polygon Amoy testnet added
3. ✅ Test MATIC in your wallet
4. ✅ Private key in `backend/.env`

You're ready to proceed with smart contract development!

---

## Security Reminders

🔒 **DO:**
- Keep your recovery phrase on paper in a safe place
- Use a strong MetaMask password
- Keep your private key in `.env` file only
- Use separate wallets for testnet and mainnet

🚫 **DON'T:**
- Share your recovery phrase with anyone
- Screenshot your recovery phrase
- Use your main wallet for development
- Commit private keys to Git
- Send real cryptocurrency to testnet addresses
