require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const emailService = require('./services/emailService');

async function testEmergencyEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('📧 SMTP Configuration:');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${process.env.SMTP_PORT}`);
    console.log(`   User (Sender): ${process.env.SMTP_USER}`);
    console.log(`   Pass: ${process.env.SMTP_PASS ? '***configured***' : 'MISSING'}\n`);
    
    // Get donor details
    const donor = await User.findOne({ email: 'sample.donor1@example.com' });
    
    if (!donor) {
      console.log('❌ Donor not found');
      process.exit(1);
    }
    
    console.log('👤 Donor Details:');
    console.log(`   Name: ${donor.name}`);
    console.log(`   Email (Demo): ${donor.email}`);
    console.log(`   Blood Group: ${donor.bloodGroup}`);
    console.log(`   City: ${donor.city}`);
    console.log(`   Pincode: ${donor.pincode}\n`);
    
    // Check email mapping
    const realEmail = emailService.emailMapping.getRealEmailForNotification(donor.email);
    console.log('📬 Email Mapping:');
    console.log(`   Demo Email: ${donor.email}`);
    console.log(`   Real Email (Receiver): ${realEmail}\n`);
    
    // Test emergency request email
    console.log('🚨 Sending Emergency Request Email...\n');
    
    const requestDetails = {
      bloodGroup: 'A-',
      quantity: 2,
      hospitalName: 'City General Hospital',
      city: 'Mumbai',
      pincode: '400001',
      urgencyLevel: 'Critical',
      notes: 'Test emergency request - please ignore'
    };
    
    const result = await emailService.sendEmergencyRequestEmail(
      donor.email,  // Demo email (will be mapped to real email)
      donor.name,
      requestDetails
    );
    
    console.log('\n📊 Email Send Result:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Original Email: ${result.originalEmail}`);
    console.log(`   Real Email: ${result.realEmail}`);
    console.log(`   Message ID: ${result.messageId || 'N/A'}`);
    console.log(`   Error: ${result.message || 'None'}\n`);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log(`\n📥 Check inbox: ${realEmail}`);
      console.log(`   Subject: 🚨 Critical Priority: Blood Donation Needed - A-`);
    } else {
      console.log('❌ Email failed to send');
      console.log(`   Reason: ${result.message}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testEmergencyEmail();
