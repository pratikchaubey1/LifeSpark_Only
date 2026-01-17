const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkHighBalances() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // Find users with balance > 1000 to see if there's a pattern
        const users = await User.find({ balance: { $gt: 1000 } })
            .sort({ balance: -1 })
            .limit(20)
            .select('name email balance');

        console.log('Users with balance > 1000:');
        users.forEach(u => console.log(`${u.name} (${u.email}): ${u.balance}`));

        console.log(`\nTotal users with balance > 1000: ${users.length}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
checkHighBalances();
