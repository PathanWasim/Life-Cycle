/**
 * Quick test to generate a new certificate
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function generateNewCertificate() {
  try {
    // Register donor
    const donorData = {
      email: `donor.new.${Date.now()}@example.com`,
      password: 'Donor@123456',
      role: 'Donor',
      name: 'New Certificate Test Donor',
      bloodGroup: 'A+',
      dateOfBirth: '1995-05-15',
      weight: 70,
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
    };
    
    const donorResult = await axios.post(`${API_URL}/api/auth/register`, donorData);
    const donorToken = donorResult.data.token;
    console.log('✅ Donor registered');
    
    // Register hospital
    const hospitalData = {
      email: `hospital.new.${Date.now()}@example.com`,
      password: 'Hospital@123456',
      role: 'Hospital',
      hospitalName: 'New Certificate Test Hospital',
      city: 'Mumbai',
      pincode: '400001',
      walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`
    };
    
    const hospitalResult = await axios.post(`${API_URL}/api/auth/register`, hospitalData);
    const hospitalToken = hospitalResult.data.token;
    const hospitalID = hospitalResult.data.user.id;
    console.log('✅ Hospital registered');
    
    // Verify hospital
    const mongoose = require('mongoose');
    const User = require('./models/User');
    await mongoose.connect(process.env.MONGODB_URI);
    await User.findByIdAndUpdate(hospitalID, { isVerified: true });
    await mongoose.disconnect();
    console.log('✅ Hospital verified');
    
    // Record donation
    const donationData = {
      donorEmail: donorData.email,
      bloodGroup: 'A+',
      collectionDate: new Date().toISOString()
    };
    
    const donationResult = await axios.post(
      `${API_URL}/api/hospital/donate`,
      donationData,
      { headers: { Authorization: `Bearer ${hospitalToken}` } }
    );
    
    const bloodUnitID = donationResult.data.data.bloodUnitID;
    console.log(`✅ Donation recorded: ${bloodUnitID}`);
    
    // Download certificate
    const certResponse = await axios.get(
      `${API_URL}/api/donor/certificate/${bloodUnitID}`,
      {
        headers: { Authorization: `Bearer ${donorToken}` },
        responseType: 'arraybuffer'
      }
    );
    
    const outputPath = path.join(__dirname, `certificate-${bloodUnitID}.pdf`);
    fs.writeFileSync(outputPath, certResponse.data);
    
    console.log(`✅ Certificate generated: ${outputPath}`);
    console.log(`   File size: ${(certResponse.data.length / 1024).toFixed(2)} KB`);
    console.log('\n🎉 Certificate generated successfully without footer text!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateNewCertificate();
