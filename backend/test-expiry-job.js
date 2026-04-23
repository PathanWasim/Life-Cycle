require('dotenv').config();
const mongoose = require('mongoose');
const { runExpiryAlertsNow } = require('./jobs/expiryAlerts');

console.log('🧪 Testing Expiry Alert Job...\n');

async function testExpiryJob() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Run expiry alerts
    await runExpiryAlertsNow();
    
    console.log('\n✅ Expiry alert job test completed successfully!');
    
    // Close connection
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testExpiryJob();
