const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function analyzeBalances() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const countOver9k = await User.countDocuments({ balance: { $gt: 9000 } });
        console.log(`Users > 9000: ${countOver9k}`);

        const top5 = await User.find({ balance: { $gt: 9000 } }).sort({ balance: -1 }).limit(5).select('name balance');
        top5.forEach(u => console.log(`${u.name}: ${u.balance}`));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
analyzeBalances();
