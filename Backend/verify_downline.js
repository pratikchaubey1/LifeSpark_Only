const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const inviteCode = 'LS340816';

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ inviteCode: inviteCode });

        if (!user) {
            console.log("User not found: " + inviteCode);
            process.exit(0);
        }

        console.log("User: " + user.name + " (" + inviteCode + ")");
        console.log("Total Direct Referrals: " + (user.directInviteIds ? user.directInviteIds.length : 0));

        const directUsers = await User.find({ _id: { $in: user.directInviteIds || [] } });
        console.log("Direct Referrals Details:");
        directUsers.forEach(u => {
            console.log(`- ${u.name} (${u.inviteCode}): Status: ${u.isActivated ? 'ACTIVE' : 'INACTIVE'}, ActivatedAt: ${u.activatedAt}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
