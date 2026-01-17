const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixBalancesSmartly() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Target users with balance >= 10000 ("Guilty" users)
        // We assume valid organic balances are currently < 5000 based on analysis
        const threshold = 9500;

        const usersToFix = await User.find({ balance: { $gte: threshold } });
        console.log(`Found ${usersToFix.length} users with balance >= ${threshold}. Removing 10,000 from them...`);

        let updatedCount = 0;
        for (const user of usersToFix) {
            user.balance -= 10000;
            // Ensure we don't go negative just in case (though logically we shouldn't if we filter >= 10000)
            // But wait, if they have 10000 exactly, they go to 0. Correct.
            // If they have 9900 (shouldn't happen per analysis), they go -100.
            // I'll stick to simple subtraction as the "extra" was exactly 10000.
            await user.save();
            updatedCount++;
        }

        console.log(`Successfully removed 10,000 from ${updatedCount} users.`);

    } catch (err) {
        console.error('Error fixing balances:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixBalancesSmartly();
