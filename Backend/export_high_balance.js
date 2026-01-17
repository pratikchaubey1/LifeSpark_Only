const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');
require('dotenv').config();

async function listHighBalanceUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ balance: { $gt: 5000 } })
            .select('name email balance');

        fs.writeFileSync('high_balance_users.json', JSON.stringify(users, null, 2));
        console.log(`Wrote ${users.length} users to high_balance_users.json`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
listHighBalanceUsers();
