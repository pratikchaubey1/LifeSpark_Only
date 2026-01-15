const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function setRootUser() {
    const targetInviteCode = 'LS264436';
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ inviteCode: targetInviteCode });

        if (!user) {
            console.error(`User with invite code ${targetInviteCode} not found.`);
            return;
        }

        user.autopoolStatus = 'active';
        user.autopoolParent = null;
        user.autopoolChildren = [];
        user.autopoolJoinDate = new Date();
        user.autopoolLevelIncome = 0;
        user.autopoolLevelsCompleted = [];

        await user.save();

        console.log(`Success! User ${user.name} (${targetInviteCode}) is now the ROOT of the Autopool.`);
        console.log('All future approvals will now branch out from this user.');

    } catch (err) {
        console.error('Operation failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

setRootUser();
