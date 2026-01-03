const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const { distributeIncome, distributeDailyLevelIncome } = require('./utils/income');

async function verifyFix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Create a mock sponsor
        const sponsorCode = 'SPONSOR_' + Date.now();
        const sponsor = new User({
            name: 'Test Sponsor',
            email: sponsorCode + '@test.com',
            password: 'password',
            inviteCode: sponsorCode,
            balance: 0,
            totalIncome: 0,
            levelIncome: 0
        });
        await sponsor.save();
        console.log(`Created Sponsor: ${sponsorCode}`);

        // 2. Create a mock beneficiary tied to sponsor
        const beneficiary = new User({
            name: 'Test User',
            email: 'user_' + Date.now() + '@test.com',
            password: 'password',
            inviteCode: 'USER_' + Date.now(),
            sponsorId: sponsorCode,
            isActivated: true,
            activatedAt: new Date()
        });
        await beneficiary.save();
        console.log(`Created Beneficiary: ${beneficiary.inviteCode} (Sponsor: ${sponsorCode})`);

        // 3. Simulate ACTIVATION distribution
        console.log('\n--- Simulating ONE-TIME ACTIVATION ---');
        await distributeIncome(beneficiary);

        const updatedSponsor1 = await User.findOne({ inviteCode: sponsorCode });
        console.log(`Sponsor Balance: ${updatedSponsor1.balance} (Expected: 56)`);
        console.log(`Sponsor Total Income: ${updatedSponsor1.totalIncome} (Expected: 56)`);
        console.log(`Sponsor Level Income: ${updatedSponsor1.levelIncome} (Expected: 6)`);

        // 4. Simulate DAILY bonus distribution
        console.log('\n--- Simulating DAILY BONUS ---');
        await distributeDailyLevelIncome(beneficiary);

        const updatedSponsor2 = await User.findOne({ inviteCode: sponsorCode });
        console.log(`Sponsor Balance: ${updatedSponsor2.balance} (Expected: 56 + 6 = 62)`);
        console.log(`Sponsor Total Income: ${updatedSponsor2.totalIncome} (Expected: 62)`);
        console.log(`Sponsor Level Income: ${updatedSponsor2.levelIncome} (Expected: 12)`);

        // Cleanup
        await User.deleteOne({ inviteCode: sponsorCode });
        await User.deleteOne({ inviteCode: beneficiary.inviteCode });
        console.log('\nCleanup complete.');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verifyFix();
