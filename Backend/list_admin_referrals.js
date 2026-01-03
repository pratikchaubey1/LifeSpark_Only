const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function listAdminReferrals() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminReferrals = await User.find({ sponsorId: 'LS958826' });
        console.log(`Total Direct Referrals for Admin (LS958826): ${adminReferrals.length}`);

        adminReferrals.forEach(u => {
            console.log(`- [${u.inviteCode}] ${u.name} - Activated: ${u.isActivated} - Income: ${u.totalIncome}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listAdminReferrals();
