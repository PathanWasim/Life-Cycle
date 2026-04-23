require('dotenv').config();
const emailService = require('./services/emailService');

console.log('📧 Testing Real Email Functionality...\n');

async function testRealEmails() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 1: Test Emergency Request Email to Donor');
    console.log('═══════════════════════════════════════════════════════════');
    
    const requestDetails = {
      bloodGroup: 'O+',
      quantity: 2,
      hospitalName: 'City General Hospital',
      city: 'Mumbai',
      pincode: '400001',
      urgencyLevel: 'Critical',
      notes: 'Accident victim needs immediate transfusion - DEMO TEST'
    };
    
    console.log('Sending emergency request email to: ns7499244144@gmail.com');
    const emergencyResult = await emailService.sendEmergencyRequestEmail(
      'ns7499244144@gmail.com',
      'Sample Donor 1',
      requestDetails
    );
    
    console.log('Emergency Request Email Result:');
    console.log(`   Success: ${emergencyResult.success}`);
    console.log(`   Message ID: ${emergencyResult.messageId || 'N/A'}`);
    console.log(`   Error: ${emergencyResult.message || 'None'}`);
    console.log();
    
    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 2: Test Expiry Alert Email to Hospital');
    console.log('═══════════════════════════════════════════════════════════');
    
    const expiringUnits = [
      {
        bloodUnitID: 'BU-TEST-001',
        bloodGroup: 'O+',
        daysUntilExpiry: 2,
        priority: 'high'
      },
      {
        bloodUnitID: 'BU-TEST-002',
        bloodGroup: 'A+',
        daysUntilExpiry: 5,
        priority: 'medium'
      }
    ];
    
    console.log('Sending expiry alert email to: nileshsabale8869@gmail.com');
    const expiryResult = await emailService.sendExpiryAlertEmail(
      'nileshsabale8869@gmail.com',
      'City General Hospital',
      expiringUnits
    );
    
    console.log('Expiry Alert Email Result:');
    console.log(`   Success: ${expiryResult.success}`);
    console.log(`   Message ID: ${expiryResult.messageId || 'N/A'}`);
    console.log(`   Error: ${expiryResult.message || 'None'}`);
    console.log();
    
    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 3: Test Hospital Verification Email');
    console.log('═══════════════════════════════════════════════════════════');
    
    console.log('Sending verification email to: nilesh.sabale.dev@gmail.com');
    const verificationResult = await emailService.sendHospitalVerificationEmail(
      'nilesh.sabale.dev@gmail.com',
      'Metro Medical Center'
    );
    
    console.log('Hospital Verification Email Result:');
    console.log(`   Success: ${verificationResult.success}`);
    console.log(`   Message ID: ${verificationResult.messageId || 'N/A'}`);
    console.log(`   Error: ${verificationResult.message || 'None'}`);
    console.log();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('REAL EMAIL TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    
    const totalSuccess = [emergencyResult, expiryResult, verificationResult].filter(r => r.success).length;
    const totalTests = 3;
    
    console.log(`📊 Email Tests: ${totalSuccess}/${totalTests} successful`);
    console.log();
    
    if (totalSuccess === totalTests) {
      console.log('🎉 ALL EMAILS SENT SUCCESSFULLY!');
      console.log('📧 Check the following inboxes for emails:');
      console.log('   - ns7499244144@gmail.com (Emergency Request)');
      console.log('   - nileshsabale8869@gmail.com (Expiry Alert)');
      console.log('   - nilesh.sabale.dev@gmail.com (Hospital Verification)');
    } else {
      console.log('⚠️  Some emails failed to send. Check SMTP configuration.');
    }
    
    console.log('\n📋 UPDATED LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Admin: sabalen666@gmail.com / Admin@123456');
    console.log('Hospital 1: nileshsabale8869@gmail.com / HospitalPass123!');
    console.log('Hospital 2: nilesh.sabale.dev@gmail.com / HospitalPass123!');
    console.log('Donor 1: ns7499244144@gmail.com / SamplePass123!');
    console.log('Donor 2: kingmaker0633@gmail.com / SamplePass123!');
    console.log('Donor 3: userns3106@gmail.com / SamplePass123!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Real email test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testRealEmails();