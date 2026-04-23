/**
 * Run this script once to create the admin user in production MongoDB
 * Usage: node create-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    isVerified: { type: Boolean, default: true },
    walletAddress: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function createAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const existing = await User.findOne({ email: 'admin@lifechain.com' });
        if (existing) {
            console.log('ℹ️  Admin already exists:', existing.email);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('Admin@123456', 12);

        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@lifechain.com',
            password: hashedPassword,
            role: 'Admin',
            isVerified: true,
            walletAddress: '0x0000000000000000000000000000000000000000'
        });

        console.log('✅ Admin created successfully!');
        console.log('   Email:    admin@lifechain.com');
        console.log('   Password: Admin@123456');
        console.log('   ID:', admin._id);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

createAdmin();
