/**
 * Clear Blockchain Retry Queue
 * 
 * This script clears all failed blockchain transactions from the retry queue.
 * Use this when you have insufficient MATIC and want to start fresh.
 * 
 * Run: node backend/clear-retry-queue.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const BlockchainRetry = require('./models/BlockchainRetry');

async function clearRetryQueue() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get count before deletion
    const count = await BlockchainRetry.countDocuments({});
    console.log(`📊 Found ${count} failed transactions in retry queue`);
    
    if (count === 0) {
      console.log('✅ Retry queue is already empty');
      await mongoose.connection.close();
      return;
    }
    
    // Show details of what will be deleted
    const retries = await BlockchainRetry.find({}).limit(5);
    console.log('\n📋 Sample of transactions to be cleared:');
    retries.forEach((retry, index) => {
      console.log(`  ${index + 1}. ${retry.milestoneType} - ${retry.bloodUnitID} (${retry.retryCount} attempts)`);
    });
    
    if (count > 5) {
      console.log(`  ... and ${count - 5} more`);
    }
    
    // Delete all retry queue entries
    console.log('\n🗑️  Clearing retry queue...');
    const result = await BlockchainRetry.deleteMany({});
    
    console.log(`\n✅ Successfully cleared ${result.deletedCount} failed transactions`);
    console.log('\n💡 Note: Blood units in MongoDB are preserved.');
    console.log('   Only the retry queue has been cleared.');
    console.log('   You can now record new donations without retry conflicts.\n');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error clearing retry queue:', error);
    process.exit(1);
  }
}

// Run the script
clearRetryQueue();
