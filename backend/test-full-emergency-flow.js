require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const EmergencyRequest = require('./models/EmergencyRequest');
const aiService = require('./services/aiService');
const emailService = require('./services/emailService');

async function testFullEmergencyFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get hospital
    const hospital = await User.findOne({ email: 'sample.hospital1@example.com' });
    
    if (!hospital) {
      console.log('❌ Hospital not found');
      process.exit(1);
    }
    
    console.log('🏥 Hospital:', hospital.hospitalName);
    console.log(`   City: ${hospital.city}`);
    console.log(`   Pincode: ${hospital.pincode}\n`);
    
    // Emergency request data
    const bloodGroup = 'A-';
    const quantity = 2;
    const city = hospital.city;
    const pincode = hospital.pincode;
    const urgencyLevel = 'Critical';
    const notes = 'Test emergency request';
    
    console.log('🚨 Creating Emergency Request:');
    console.log(`   Blood Group: ${bloodGroup}`);
    console.log(`   Quantity: ${quantity}`);
    console.log(`   City: ${city}`);
    console.log(`   Pincode: ${pincode}\n`);
    
    // Create emergency request
    const emergencyRequest = new EmergencyRequest({
      hospitalID: hospital._id,
      bloodGroup,
      quantity,
      city,
      pincode,
      urgencyLevel,
      status: 'Active',
      notes
    });
    
    await emergencyRequest.save();
    console.log(`✅ Emergency request created: ${emergencyRequest._id}\n`);
    
    // Find eligible donors
    console.log('Step 1: Finding eligible donors...');
    const eligibleDonors = await User.find({
      role: 'Donor',
      bloodGroup: bloodGroup,
      $or: [
        { city: city },
        { pincode: pincode }
      ]
    });
    
    console.log(`   Found ${eligibleDonors.length} donors in location\n`);
    
    // Filter by eligibility
    const trulyEligibleDonors = eligibleDonors.filter(donor => {
      return donor.checkEligibility() === 'Eligible';
    });
    
    console.log(`   ${trulyEligibleDonors.length} donors are eligible\n`);
    
    if (trulyEligibleDonors.length === 0) {
      console.log('❌ No eligible donors found');
      await EmergencyRequest.findByIdAndDelete(emergencyRequest._id);
      process.exit(0);
    }
    
    // Call AI service for donor recommendations
    console.log('Step 2: Getting AI donor recommendations...');
    const location = { city, pincode };
    const donorData = trulyEligibleDonors.map(donor => ({
      id: donor._id.toString(),
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      bloodGroup: donor.bloodGroup,
      city: donor.city,
      pincode: donor.pincode,
      donationsPerYear: donor.donationHistory?.length || 0,
      daysSinceLastDonation: donor.lastDonationDate 
        ? Math.floor((new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24))
        : 365
    }));
    
    console.log(`   Sending ${donorData.length} donors to AI service...\n`);
    
    const recommendationResult = await aiService.recommendDonors(bloodGroup, location, donorData);
    
    console.log('📊 AI Service Result:');
    console.log(`   Success: ${recommendationResult.success}`);
    console.log(`   Message: ${recommendationResult.message}\n`);
    
    const topDonors = recommendationResult.data.topDonors || [];
    console.log(`   Top Donors: ${topDonors.length}\n`);
    
    if (topDonors.length === 0) {
      console.log('⚠️  AI service returned no donors, using all eligible donors');
      // Fallback: use all eligible donors
      topDonors.push(...trulyEligibleDonors.map(donor => ({
        id: donor._id.toString(),
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
        suitabilityScore: 0.5
      })));
    }
    
    const notifiedDonorIDs = topDonors.slice(0, 10).map(d => d.donorID || d.id);
    
    // Update emergency request with notified donors
    emergencyRequest.notifiedDonors = notifiedDonorIDs;
    await emergencyRequest.save();
    
    console.log(`✅ Updated emergency request with ${notifiedDonorIDs.length} notified donors\n`);
    
    // Send email notifications
    console.log('Step 3: Sending email notifications...\n');
    
    for (let i = 0; i < Math.min(topDonors.length, 10); i++) {
      const donor = topDonors[i];
      
      try {
        const requestDetails = {
          bloodGroup,
          quantity,
          hospitalName: hospital.hospitalName,
          city,
          pincode,
          urgencyLevel,
          notes: notes || ''
        };
        
        const result = await emailService.sendEmergencyRequestEmail(donor.email, donor.name, requestDetails);
        
        if (result.success) {
          console.log(`   ${i + 1}. ✅ ${donor.name} (${donor.email}) → ${result.realEmail}`);
        } else {
          console.log(`   ${i + 1}. ❌ ${donor.name} (${donor.email}) - ${result.message}`);
        }
      } catch (emailError) {
        console.log(`   ${i + 1}. ❌ ${donor.name} (${donor.email}) - ${emailError.message}`);
      }
    }
    
    console.log('\n✅ Emergency request flow completed!');
    console.log(`\n📊 Summary:`);
    console.log(`   Request ID: ${emergencyRequest._id}`);
    console.log(`   Blood Group: ${bloodGroup}`);
    console.log(`   Notified Donors: ${notifiedDonorIDs.length}`);
    
    // Clean up test request
    await EmergencyRequest.findByIdAndDelete(emergencyRequest._id);
    console.log('\n🧹 Test request cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFullEmergencyFlow();
