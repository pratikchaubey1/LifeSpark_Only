const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkLevel2() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // Direct Referral
        const level1 = await User.find({ sponsorId: 'LS753401' });
        const l1Codes = level1.map(u => u.inviteCode);

        // Level 2 (Sponsored by any of Level 1)
        const level2 = await User.find({ sponsorId: { $in: l1Codes } });

        console.log(`Level 1 Count: ${level1.length}`);
        console.log(`Level 2 Count: ${level2.length}`);

        level2.forEach(u => {
            console.log(`- L2 User: ${u.name} (Active: ${u.isActivated})`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkLevel2();
