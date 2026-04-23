require('dotenv').config();
const emailService = require('./services/emailService');

console.log('🧪 Testing Email Workflow...\n');

async function testEmailWorkflow() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 1: Test Emergency Request Email');
    console.log('═══════════════════════════════════════════════════════════');
    
    const requestDetails = {
      bloodGroup: 'O+',
      quantity: 2,
      hospitalName: 'City General Hospital',
      city: 'Mumbai',
      pincode: '400001',
      urgencyLevel: 'Critical',
      notes: 'Accident victim needs immediate transfusion'
    };
    
    const emergencyResult = await emailService.sendEmergencyRequestEmail(
      'sample.donor1@example.com',
      'John Doe',
      requestDetails
    );
    
    console.log('Emergency Request Email Result:');
    console.log(`   Success: ${emergencyResult.success}`);
    console.log(`   Message: ${emergencyResult.message || 'Email sent'}`);
    console.log(`   Simulated: ${emergencyResult.simulated || false}`);
    console.log();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 2: Test Expiry Alert Email');
    console.log('═══════════════════════════════════════════════════════════');
    
    const expiringUnits = [
      {
        bloodUnitID: 'BU-1773254525408-c30533a8',
        bloodGroup: 'O+',
        daysUntilExpiry: 2,
        priority: 'high'
      },
      {
        bloodUnitID: 'BU-1773254525409-d40644b9',
        bloodGroup: 'A+',
        daysUntilExpiry: 5,
        priority: 'medium'
      }
    ];
    
    const expiryResult = await emailService.sendExpiryAlertEmail(
      'sample.hospital1@example.com',
      'City General Hospital',
      expiringUnits
    );
    
    console.log('Expiry Alert Email Result:');
    console.log(`   Success: ${expiryResult.success}`);
    console.log(`   Message: ${expiryResult.message || 'Email sent'}`);
    console.log(`   Simulated: ${expiryResult.simulated || false}`);
    console.log();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 3: Test Hospital Verification Email');
    console.log('═══════════════════════════════════════════════════════════');
    
    const verificationResult = await emailService.sendHospitalVerificationEmail(
      'sample.hospital2@example.com',
      'Metro Medical Center'
    );
    
    console.log('Hospital Verification Email Result:');
    console.log(`   Success: ${verificationResult.success}`);
    console.log(`   Message: ${verificationResult.message || 'Email sent'}`);
    console.log(`   Simulated: ${verificationResult.simulated || false}`);
    console.log();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('EMAIL WORKFLOW SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    
    if (emergencyResult.simulated || expiryResult.simulated || verificationResult.simulated) {
      console.log('📧 Email Service Status: NOT CONFIGURED (Simulated Mode)');
      console.log('   - Emergency request notifications: Simulated ✅');
      console.log('   - Expiry alerts: Simulated ✅');
      console.log('   - Hospital verification emails: Simulated ✅');
      console.log();
      console.log('⚠️  To enable real emails, configure SMTP settings in .env:');
      console.log('   SMTP_HOST=smtp.gmail.com');
      console.log('   SMTP_PORT=587');
      console.log('   SMTP_USER=your-email@gmail.com');
      console.log('   SMTP_PASS=your-app-specific-password');
    } else {
      console.log('📧 Email Service Status: CONFIGURED ✅');
      console.log('   - Emergency request notifications: Working ✅');
      console.log('   - Expiry alerts: Working ✅');
      console.log('   - Hospital verification emails: Working ✅');
    }
    
    console.log();
    console.log('🎉 Email workflow test completed!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Email workflow test failed:', error.message);
    process.exit(1);
  }
}

testEmailWorkflow();