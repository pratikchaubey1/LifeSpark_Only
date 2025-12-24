require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'admin1254@admin.com' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Invite Code:', existingAdmin.inviteCode);
            await mongoose.connection.close();
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin@vns', 10);

        // Create admin user
        const adminUser = new User({
            name: 'Admin',
            email: 'admin1254@admin.com',
            password: hashedPassword,
            phone: '9999999999',
            address: 'Admin Office',
            sponsorId: 'SYSTEM',
            sponsorName: 'System',
            inviteCode: 'ADMIN1254',
            role: 'franchise', // Highest role
            roleAssignedBy: 'system',
            roleAssignedAt: new Date(),
            isActivated: true,
            activationPackage: 'Admin',
            activatedAt: new Date(),
            balance: 0,
            totalIncome: 0,
            withdrawal: 0,
        });

        await adminUser.save();

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin1254@admin.com');
        console.log('Password: admin@vns');
        console.log('Invite Code:', adminUser.inviteCode);
        console.log('\nYou can now login with:');
        console.log('Username/Email: admin1254@admin.com (or just "admin1254")');
        console.log('Password: admin@vns');

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (err) {
        console.error('Error seeding admin user:', err);
        process.exit(1);
    }
}

seedAdminUser();
