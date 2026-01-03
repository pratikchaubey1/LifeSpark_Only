const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const inviteCode = 'LS340816';

async function breakdown() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ inviteCode: inviteCode });

        if (!user) {
            console.log("User not found: " + inviteCode);
            process.exit(0);
        }

        console.log("--- ALL NUMERIC FIELDS FOR " + user.name + " (" + inviteCode + ") ---");
        const obj = user.toObject();
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'number' && value !== 0) {
                console.log(`${key}: ${value}`);
            }
        }

        console.log("------------------------------");
        console.log("Invite Code: " + user.inviteCode);
        console.log("Is Activated: " + user.isActivated);
        console.log("Activated At: " + user.activatedAt);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

breakdown();
