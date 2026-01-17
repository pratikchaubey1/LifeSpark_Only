const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkSampleUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // Check a mix of users
        const users = await User.find().limit(10).select('name email balance totalIncome withdrawal');

        console.log('--- SAMPLE USER BALANCES ---');
        users.forEach(u => {
            console.log(`User: ${u.name}`);
            console.log(`  Balance: ${u.balance}`);
            console.log(`  Income:  ${u.totalIncome}`);
            console.log(`  Withdrvn: ${u.withdrawal}`);
            console.log('----------------------------');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
checkSampleUsers();
