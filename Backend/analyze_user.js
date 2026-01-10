const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function analyzeUser(inviteCode) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ inviteCode });

        if (!user) {
            console.log(`User ${inviteCode} not found`);
            process.exit(1);
        }

        console.log(`\n=== INCOME BREAKDOWN: ${user.name} (${inviteCode}) ===`);
        console.log(`Total Income: ₹${user.totalIncome}`);
        console.log(`Balance: ₹${user.balance}`);
        console.log(`\nIncome Components:`);
        console.log(`- Level Income: ₹${user.levelIncome}`);
        console.log(`- Daily Bonus: ₹${user.dailyBonusIncome}`);
        console.log(`- Freedom Income: ₹${user.freedomIncome}`);
        console.log(`- Rank Reward: ₹${user.rankRewardIncome}`);

        // Check referrals by level
        console.log(`\n=== REFERRAL STRUCTURE ===`);

        // Level 1
        const level1 = await User.find({ sponsorId: inviteCode });
        const l1Active = level1.filter(u => u.isActivated);
        console.log(`Level 1: ${level1.length} total (${l1Active.length} activated)`);
        l1Active.forEach(u => console.log(`  - ${u.name} (${u.inviteCode})`));

        // Level 2
        const l1Codes = level1.map(u => u.inviteCode);
        const level2 = await User.find({ sponsorId: { $in: l1Codes } });
        const l2Active = level2.filter(u => u.isActivated);
        console.log(`Level 2: ${level2.length} total (${l2Active.length} activated)`);
        l2Active.forEach(u => console.log(`  - ${u.name} (${u.inviteCode})`));

        // Level 3
        const l2Codes = level2.map(u => u.inviteCode);
        const level3 = await User.find({ sponsorId: { $in: l2Codes } });
        const l3Active = level3.filter(u => u.isActivated);
        console.log(`Level 3: ${level3.length} total (${l3Active.length} activated)`);
        l3Active.forEach(u => console.log(`  - ${u.name} (${u.inviteCode})`));

        console.log(`\n=== EXPECTED INCOME CALCULATION ===`);
        const directBonus = l1Active.length * 50;
        const l1Income = l1Active.length * 6;
        const l2Income = l2Active.length * 5;
        const l3Income = l3Active.length * 4;
        const expectedTotal = directBonus + l1Income + l2Income + l3Income;

        console.log(`Direct Sponsor Bonus: ${l1Active.length} × ₹50 = ₹${directBonus}`);
        console.log(`Level 1 Income: ${l1Active.length} × ₹6 = ₹${l1Income}`);
        console.log(`Level 2 Income: ${l2Active.length} × ₹5 = ₹${l2Income}`);
        console.log(`Level 3 Income: ${l3Active.length} × ₹4 = ₹${l3Income}`);
        console.log(`Expected Total: ₹${expectedTotal}`);
        console.log(`Actual Total: ₹${user.totalIncome}`);
        console.log(`Difference: ₹${user.totalIncome - expectedTotal}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

const code = process.argv[2] || 'LS999601';
analyzeUser(code);
