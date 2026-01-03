const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkDetails() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ inviteCode: 'LS753401' });
        const referrals = await User.find({ sponsorId: 'LS753401' });

        console.log(`User: ${user.name}`);
        console.log(`Level Income: ${user.levelIncome}`);
        console.log(`Referral Count: ${referrals.length}`);

        referrals.forEach(r => {
            console.log(`- ${r.name} (${r.inviteCode}): Activated=${r.isActivated}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDetails();
