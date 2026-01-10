const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function listAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);

        users.forEach(u => {
            console.log(`[${u.inviteCode}] ${u.name} - Sponsor: ${u.sponsorId} - Activated: ${u.isActivated} - Income: ${u.totalIncome}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listAll();
