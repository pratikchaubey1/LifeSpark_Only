const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function auditAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ inviteCode: 'LS958826' });

        console.log(`=== AUDIT FOR ADMIN (${admin.inviteCode}) ===`);
        console.log(`Total Income: ${admin.totalIncome}`);

        const downline = await User.find({ sponsorId: 'LS958826' });
        const activated = downline.filter(u => u.isActivated);

        console.log(`Direct Downline: ${downline.length} members`);
        console.log(`Activated Members: ${activated.length}`);

        activated.forEach(u => {
            console.log(`- ${u.name} (${u.inviteCode}) - Activated: ${u.activatedAt}`);
        });

        // Calculate expected income
        const expected = activated.length * 56;
        console.log(`\nExpected Income: ${activated.length} * 56 = ${expected}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

auditAdmin();
