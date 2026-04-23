// Deployment script for BloodChain smart contract
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting BloodChain smart contract deployment...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("📝 Deploying contract with account:", deployer.address);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC\n");
  
  if (balance === 0n) {
    console.error("❌ Error: Deployer account has no MATIC!");
    console.log("Please get test MATIC from: https://faucet.polygon.technology/");
    process.exit(1);
  }

  // Get the contract factory
  console.log("📦 Getting BloodChain contract factory...");
  const BloodChain = await hre.ethers.getContractFactory("BloodChain");
  
  // Deploy the contract
  console.log("⏳ Deploying BloodChain contract...");
  const bloodChain = await BloodChain.deploy();
  
  // Wait for deployment to complete
  await bloodChain.waitForDeployment();
  
  const contractAddress = await bloodChain.getAddress();
  
  console.log("\n✅ BloodChain contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 View on Polygon Amoy Explorer:");
  console.log(`   https://amoy.polygonscan.com/address/${contractAddress}`);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update backend/.env file:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log("3. Verify the contract on the explorer (link above)");
  console.log("\n🎉 Deployment complete!");
  
  // Save deployment info to a file
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    deploymentTime: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to: blockchain/deployment-info.json");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
