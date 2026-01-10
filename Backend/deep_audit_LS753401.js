const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function deepAudit() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ inviteCode: 'LS753401' });

        if (!user) {
            console.log("User not found");
            process.exit(1);
        }

        console.log(`=== AUDIT FOR ${user.name} (${user.inviteCode}) ===`);
        console.log(`Balance: ${user.balance}`);
        console.log(`Total Income: ${user.totalIncome}`);
        console.log(`Level Income: ${user.levelIncome}`);
        console.log(`Daily Bonus: ${user.dailyBonusIncome}`);
        console.log(`Is Activated: ${user.isActivated}`);
        console.log(`Activated At: ${user.activatedAt}`);

        // Find all levels of downline (recursive)
        const levels = {};
        let currentLevel = [user.inviteCode];
        for (let i = 1; i <= 10; i++) {
            const downline = await User.find({ sponsorId: { $in: currentLevel } });
            if (downline.length === 0) break;
            levels[i] = downline;
            currentLevel = downline.map(d => d.inviteCode);
        }

        console.log("\n=== DOWNLINE AUDIT (Up to 10 Levels) ===");
        for (const [lvl, members] of Object.entries(levels)) {
            const activated = members.filter(m => m.isActivated);
            console.log(`Level ${lvl}: ${members.length} members (${activated.length} activated)`);
            activated.forEach(am => {
                console.log(`  - [L${lvl}] ${am.name} (${am.inviteCode}) - Activated: ${am.activatedAt}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

deepAudit();
