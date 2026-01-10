const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkTiming() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const sponsor = await User.findOne({ inviteCode: 'LS753401' });
        const referral = await User.findOne({ inviteCode: 'LS939413' });

        console.log("=== TIMING AUDIT ===");
        console.log(`Sponsor (LS753401): ${sponsor.name}`);
        console.log(`- Activated: ${sponsor.isActivated}`);
        console.log(`- Activated At: ${sponsor.activatedAt}`);

        console.log(`\nReferral (LS939413): ${referral.name}`);
        console.log(`- Activated: ${referral.isActivated}`);
        console.log(`- Activated At: ${referral.activatedAt}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTiming();
