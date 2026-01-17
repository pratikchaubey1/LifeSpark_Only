const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function removeExtraBalance() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await User.updateMany({}, {
            $inc: { balance: -10000 }
        });

        console.log(`Successfully removed 10,000 from balance for ${result.modifiedCount} users.`);
        console.log(`Matched Count: ${result.matchedCount}`);

    } catch (err) {
        console.error('Error removing extra balance:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

removeExtraBalance();
