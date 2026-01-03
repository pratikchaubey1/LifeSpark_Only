const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function analyzeSponsor() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ inviteCode: 'LS753401' });

        if (!user) {
            console.log("User LS753401 not found");
            process.exit(1);
        }

        console.log(`User: ${user.name} (${user.inviteCode})`);
        console.log(`Sponsor ID (Invite Code): ${user.sponsorId}`);
        console.log(`Sponsor Name: ${user.sponsorName}`);

        if (user.sponsorId) {
            const sponsor = await User.findOne({ inviteCode: user.sponsorId });
            if (sponsor) {
                console.log("\n=== SPONSOR PROFILE ===");
                console.log(`Name: ${sponsor.name}`);
                console.log(`Invite Code: ${sponsor.inviteCode}`);
                console.log(`Balance: ${sponsor.balance}`);
                console.log(`Total Income: ${sponsor.totalIncome}`);
                console.log(`Level Income: ${sponsor.levelIncome}`);
                console.log(`Daily Bonus Income: ${sponsor.dailyBonusIncome}`);
            } else {
                console.log("\nSponsor not found in DB.");
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

analyzeSponsor();
