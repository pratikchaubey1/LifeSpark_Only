const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function findReferral() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const referral = await User.findOne({ sponsorId: 'LS753401' });

        if (referral) {
            console.log(`=== REFERRAL OF LS753401 ===`);
            console.log(`Name: ${referral.name}`);
            console.log(`Invite Code: ${referral.inviteCode}`);
            console.log(`Is Activated: ${referral.isActivated}`);
        } else {
            console.log("No referral found with sponsorId LS753401.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findReferral();
