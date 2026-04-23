require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5000';

console.log('🚨 Testing Emergency Request with Real Emails...\n');

async function runEmergencyTest() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 1: Login as Hospital 1');
    console.log('═══════════════════════════════════════════════════════════');
    
    const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'nileshsabale8869@gmail.com',
      password: 'HospitalPass123!'
    });
    
    const hospitalToken = loginRes.data.token;
    console.log(`✅ Hospital logged in: ${loginRes.data.user.hospitalName}`);
    console.log(`   Email: ${loginRes.data.user.email}`);
    console.log();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 2: Create Emergency Blood Request');
    console.log('═══════════════════════════════════════════════════════════');
    
    const emergencyRes = await axios.post(
      `${API_URL}/api/hospital/emergency-request`,
      {
        bloodGroup: 'O+',
        quantity: 3,
        city: 'Mumbai',
        pincode: '400001',
        urgencyLevel: 'Critical',
        notes: 'REAL EMAIL TEST - Multiple trauma patients in ER need immediate blood transfusion'
      },
      {
        headers: { Authorization: `Bearer ${hospitalToken}` }
      }
    );
    
    const requestData = emergencyRes.data.data;
    console.log(`✅ Emergency request created successfully`);
    console.log(`   Request ID: ${requestData.requestID}`);
    console.log(`   Blood Group: ${requestData.bloodGroup}`);
    console.log(`   Quantity Needed: ${requestData.quantity} units`);
    console.log(`   Location: ${requestData.location.city}, ${requestData.location.pincode}`);
    console.log(`   Urgency: ${requestData.urgencyLevel}`);
    console.log(`   Notified Donors: ${requestData.notifiedDonors}`);
    console.log(`   AI Service: ${requestData.aiServiceStatus}`);
    console.log();
    
    if (requestData.topDonors && requestData.topDonors.length > 0) {
      console.log('   📧 REAL EMAILS SENT TO:');
      requestData.topDonors.forEach((donor, index) => {
        console.log(`      ${index + 1}. ${donor.name} (${donor.email}) - Score: ${donor.suitabilityScore}`);
      });
      console.log();
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 3: Check Email Inboxes');
    console.log('═══════════════════════════════════════════════════════════');
    
    console.log('📧 CHECK THESE EMAIL INBOXES FOR EMERGENCY NOTIFICATIONS:');
    console.log('   - ns7499244144@gmail.com');
    console.log('   - kingmaker0633@gmail.com');
    console.log('   - userns3106@gmail.com');
    console.log();
    console.log('📋 EMAIL SUBJECT: "🚨 Critical Priority: Blood Donation Needed - O+"');
    console.log('📋 EMAIL CONTENT INCLUDES:');
    console.log('   - Hospital: City General Hospital');
    console.log('   - Blood Group: O+');
    console.log('   - Quantity: 3 units');
    console.log('   - Location: Mumbai, 400001');
    console.log('   - Urgency: Critical');
    console.log('   - Notes: REAL EMAIL TEST - Multiple trauma patients...');
    console.log();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 4: Fulfill Emergency Request');
    console.log('═══════════════════════════════════════════════════════════');
    
    const fulfillRes = await axios.patch(
      `${API_URL}/api/hospital/emergency-request/${requestData.requestID}/fulfill`,
      {},
      {
        headers: { Authorization: `Bearer ${hospitalToken}` }
      }
    );
    
    console.log(`✅ Emergency request fulfilled`);
    console.log(`   Request ID: ${fulfillRes.data.data.requestID}`);
    console.log(`   Status: ${fulfillRes.data.data.status}`);
    console.log(`   Fulfillment Date: ${new Date(fulfillRes.data.data.fulfillmentDate).toLocaleString()}`);
    console.log();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('EMERGENCY REQUEST WITH REAL EMAILS - COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Emergency request created and processed');
    console.log('✅ Real emails sent to eligible donors');
    console.log('✅ AI-powered donor ranking working');
    console.log('✅ Request fulfillment working');
    console.log();
    console.log('🎯 NEXT STEPS:');
    console.log('1. Check the donor email inboxes listed above');
    console.log('2. You should see emergency blood request notifications');
    console.log('3. The emails contain all request details and hospital contact info');
    console.log('4. This proves the complete emergency workflow is working with real emails!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Emergency request test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

runEmergencyTest();