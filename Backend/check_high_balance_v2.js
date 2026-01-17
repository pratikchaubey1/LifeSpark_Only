const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkHighBalances() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ balance: { $gt: 1000 } })
            .sort({ balance: -1 })
            .limit(20)
            .select('name balance');

        console.log('--- HIGH BALANCE USERS ---');
        users.forEach(u => console.log(`User: ${u.name}, Balance: ${u.balance}`));
        console.log('--------------------------');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
checkHighBalances();
