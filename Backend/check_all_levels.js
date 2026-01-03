const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkDeeper() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ inviteCode: 'LS999601' });

        // Check all levels up to 10
        console.log('=== CHECKING ALL 10 LEVELS ===');

        let currentCodes = ['LS999601'];
        let totalExpected = 0;
        const rates = { 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1, 7: 0.5, 8: 0.5, 9: 0.5, 10: 0.5 };

        for (let level = 1; level <= 10; level++) {
            const downline = await User.find({ sponsorId: { $in: currentCodes } });
            const activated = downline.filter(u => u.isActivated);

            if (activated.length > 0) {
                const levelIncome = activated.length * rates[level];
                const sponsorBonus = level === 1 ? activated.length * 50 : 0;
                totalExpected += levelIncome + sponsorBonus;

                console.log(`Level ${level}: ${activated.length} activated × ₹${rates[level]} = ₹${levelIncome}${sponsorBonus ? ` + ₹${sponsorBonus} (sponsor)` : ''}`);
                activated.forEach(u => console.log(`  - ${u.name} (${u.inviteCode})`));
            }

            currentCodes = downline.map(u => u.inviteCode);
            if (currentCodes.length === 0) break;
        }

        console.log(`\nTotal Expected: ₹${totalExpected}`);
        console.log(`Actual Income: ₹${user.totalIncome}`);
        console.log(`Difference: ₹${user.totalIncome - totalExpected}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDeeper();
