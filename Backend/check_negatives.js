const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkNegatives() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const negatives = await User.countDocuments({ balance: { $lt: 0 } });
        console.log(`Users with negative balance: ${negatives}`);

        if (negatives > 0) {
            const sample = await User.find({ balance: { $lt: 0 } }).limit(5).select('name balance totalIncome withdrawal');
            sample.forEach(u => {
                console.log(`${u.name}: Bal ${u.balance} (Inc ${u.totalIncome} - Wd ${u.withdrawal})`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
checkNegatives();
