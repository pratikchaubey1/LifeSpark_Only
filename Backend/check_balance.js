const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkBalance() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find().limit(5);
        users.forEach(u => console.log(`${u.name}: ${u.balance}`));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
checkBalance();
