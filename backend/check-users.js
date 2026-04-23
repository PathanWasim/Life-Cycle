require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const donors = await User.find({ role: 'Donor' }).select('email name bloodGroup');
    console.log('\n📋 Donors in database:', donors.length);
    donors.forEach(d => console.log(`  - ${d.email} (${d.name}, ${d.bloodGroup})`));
    
    const hospitals = await User.find({ role: 'Hospital' }).select('email hospitalName isVerified');
    console.log('\n🏥 Hospitals in database:', hospitals.length);
    hospitals.forEach(h => console.log(`  - ${h.email} (${h.hospitalName}, Verified: ${h.isVerified})`));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUsers();
