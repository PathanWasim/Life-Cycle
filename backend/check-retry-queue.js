/**
 * Check Blockchain Retry Queue Status
 * 
 * This script displays the current status of the blockchain retry queue,
 * showing all failed transactions and their retry attempts.
 * 
 * Run: node backend/check-retry-queue.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const BlockchainRetry = require('./models/BlockchainRetry');

async function checkRetryQueue() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const retries = await BlockchainRetry.find({}).sort({ createdAt: -1 });
    
    console.log('='.repeat(70));
    console.log(`📊 BLOCKCHAIN RETRY QUEUE STATUS: ${retries.length} Pending Transactions`);
    console.log('='.repeat(70));
    
    if (retries.length === 0) {
      console.log('\n✅ Retry queue is empty - no failed transactions!\n');
      await mongoose.connection.close();
      return;
    }
    
    // Group by milestone type
    const byType = {};
    retries.forEach(retry => {
      byType[retry.milestoneType] = (byType[retry.milestoneType] || 0) + 1;
    });
    
    console.log('\n📈 Breakdown by Type:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count} transactions`);
    });
    
    // Show detailed list
    console.log('\n📋 Detailed Transaction List:\n');
    retries.forEach((retry, index) => {
      const age = Math.floor((Date.now() - retry.createdAt) / (1000 * 60 * 60));
      
      console.log(`${index + 1}. ${retry.milestoneType.toUpperCase()}`);
      console.log(`   Blood Unit: ${retry.bloodUnitID}`);
      console.log(`   Retry Attempts: ${retry.retryCount}`);
      console.log(`   Age: ${age} hours`);
      console.log(`   Last Error: ${retry.lastError.substring(0, 80)}...`);
      console.log(`   Created: ${retry.createdAt.toLocaleString()}`);
      console.log('');
    });
    
    // Show recommendations
    console.log('='.repeat(70));
    console.log('💡 RECOMMENDATIONS:');
    console.log('='.repeat(70));
    
    if (retries.length > 20) {
      console.log('\n⚠️  Large number of failed transactions detected!');
      console.log('\n   Option 1: Get more test MATIC');
      console.log('   • Visit: https://faucet.polygon.technology/');
      console.log('   • Request test MATIC for your wallet');
      console.log('   • Wait for retry service to process queue (every 5 minutes)');
      
      console.log('\n   Option 2: Clear the retry queue');
      console.log('   • Run: node backend/clear-retry-queue.js');
      console.log('   • This will delete all failed transactions');
      console.log('   • Blood units in MongoDB will be preserved');
    } else {
      console.log('\n✅ Manageable number of failed transactions');
      console.log('   • Get more test MATIC from faucet');
      console.log('   • Retry service will process them automatically');
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error checking retry queue:', error);
    process.exit(1);
  }
}

// Run the script
checkRetryQueue();
