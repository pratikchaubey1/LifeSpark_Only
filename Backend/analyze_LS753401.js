const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function analyzeUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ inviteCode: 'LS753401' });

        if (!user) {
            console.log("User not found");
            process.exit(1);
        }

        console.log("=== USER PROFILE ===");
        console.log(`Name: ${user.name}`);
        console.log(`Invite Code: ${user.inviteCode}`);
        console.log(`Role: ${user.role}`);
        console.log(`Is Activated: ${user.isActivated}`);
        console.log(`Balance: ${user.balance}`);
        console.log(`Total Income: ${user.totalIncome}`);
        console.log(`Level Income reported: ${user.levelIncome}`);
        console.log(`Daily Bonus Income reported: ${user.dailyBonusIncome}`);
        console.log(`Direct Invites: ${user.directInviteIds.length}`);

        const downline = await User.find({ sponsorId: 'LS753401' });
        const activatedDownline = downline.filter(u => u.isActivated);

        console.log("\n=== DOWNLINE (Level 1) ===");
        console.log(`Total Downline Count: ${downline.length}`);
        console.log(`Activated Downline Count: ${activatedDownline.length}`);

        activatedDownline.forEach(u => {
            console.log(`- ${u.name} (${u.inviteCode}): Activated at ${u.activatedAt}`);
        });

        // Check if there are deeper levels
        // For simplicity, let's just check level 2
        const l2 = await User.find({ sponsorId: { $in: downline.map(u => u.inviteCode) } });
        const activatedL2 = l2.filter(u => u.isActivated);
        console.log(`\n=== DOWNLINE (Level 2) ===`);
        console.log(`Total L2 Count: ${l2.length}`);
        console.log(`Activated L2 Count: ${activatedL2.length}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

analyzeUser();
