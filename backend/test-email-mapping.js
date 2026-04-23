require('dotenv').config();
const emailService = require('./services/emailService');
const emailMapping = require('./services/emailMapping');

console.log('🔄 Testing Email Mapping System...\n');

async function testEmailMapping() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 1: Verify Email Mappings');
    console.log('═══════════════════════════════════════════════════════════');
    
    const mappings = emailMapping.getAllMappings();
    console.log('📋 Demo Email → Real Email Mappings:');
    for (const [demoEmail, realEmail] of Object.entries(mappings)) {
      console.log(`   ${demoEmail} → ${realEmail}`);
    }
    console.log();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 2: Test Emergency Request Email (Demo → Real)');
    console.log('═══════════════════════════════════════════════════════════');
    
    const requestDetails = {
      bloodGroup: 'O+',
      quantity: 2,
      hospitalName: 'City General Hospital',
      city: 'Mumbai',
      pincode: '400001',
      urgencyLevel: 'Critical',
      notes: 'EMAIL MAPPING TEST - Emergency blood needed'
    };
    
    // Send to demo email (should be mapped to real email)
    console.log('Sending emergency request email to DEMO address: sample.donor1@example.com');
    console.log('Expected to be delivered to REAL address: ns7499244144@gmail.com');
    
    const emergencyResult = await emailService.sendEmergencyRequestEmail(
      'sample.donor1@example.com', // Demo email
      'Sample Donor 1',
      requestDetails
    );
    
    console.log('Emergency Request Email Result:');
    console.log(`   Success: ${emergencyResult.success}`);
    console.log(`   Original Email: ${emergencyResult.originalEmail}`);
    console.log(`   Real Email: ${emergencyResult.realEmail}`);
    console.log(`   Message ID: ${emergencyResult.messageId || 'N/A'}`);
    console.log();
    
    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 3: Test Expiry Alert Email (Demo → Real)');
    console.log('═══════════════════════════════════════════════════════════');
    
    const expiringUnits = [
      {
        bloodUnitID: 'BU-MAPPING-TEST-001',
        bloodGroup: 'A+',
        daysUntilExpiry: 3,
        priority: 'high'
      }
    ];
    
    console.log('Sending expiry alert email to DEMO address: sample.hospital1@example.com');
    console.log('Expected to be delivered to REAL address: nileshsabale8869@gmail.com');
    
    const expiryResult = await emailService.sendExpiryAlertEmail(
      'sample.hospital1@example.com', // Demo email
      'City General Hospital',
      expiringUnits
    );
    
    console.log('Expiry Alert Email Result:');
    console.log(`   Success: ${expiryResult.success}`);
    console.log(`   Original Email: ${expiryResult.originalEmail}`);
    console.log(`   Real Email: ${expiryResult.realEmail}`);
    console.log(`   Message ID: ${expiryResult.messageId || 'N/A'}`);
    console.log();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('EMAIL MAPPING TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    
    const totalSuccess = [emergencyResult, expiryResult].filter(r => r.success).length;
    const totalTests = 2;
    
    console.log(`📊 Email Mapping Tests: ${totalSuccess}/${totalTests} successful`);
    console.log();
    
    if (totalSuccess === totalTests) {
      console.log('🎉 EMAIL MAPPING SYSTEM WORKING PERFECTLY!');
      console.log();
      console.log('✅ Demo Credentials (for login):');
      console.log('   - sample.donor1@example.com / SamplePass123!');
      console.log('   - sample.hospital1@example.com / HospitalPass123!');
      console.log();
      console.log('✅ Real Email Delivery:');
      console.log('   - Emergency notifications → ns7499244144@gmail.com');
      console.log('   - Expiry alerts → nileshsabale8869@gmail.com');
      console.log();
      console.log('🎯 PERFECT FOR DEMO:');
      console.log('   - Teacher sees clean credentials');
      console.log('   - You receive real email notifications');
    } else {
      console.log('⚠️  Some email mapping tests failed. Check configuration.');
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Email mapping test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testEmailMapping();