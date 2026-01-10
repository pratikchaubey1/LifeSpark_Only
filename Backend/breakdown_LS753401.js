const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function breakdown() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ inviteCode: 'LS753401' });

        console.log("=== INCOME BREAKDOWN: LS753401 ===");
        console.log(`Total Income: ${user.totalIncome}`);
        console.log(`- Level Income (Referral): ${user.levelIncome}`);
        console.log(`- Daily Bonus Income: ${user.dailyBonusIncome}`);
        console.log(`- Freedom Income: ${user.freedomIncome}`);
        console.log(`- Rank Reward: ${user.rankRewardIncome}`);
        console.log(`- Balance: ${user.balance}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

breakdown();
