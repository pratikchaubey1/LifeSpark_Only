const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetAutopool() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await User.updateMany({}, {
            $set: {
                autopoolStatus: 'inactive',
                autopoolParent: null,
                autopoolChildren: [],
                autopoolJoinDate: null,
                autopoolLevelIncome: 0,
                autopoolLevelsCompleted: []
            }
        });

        console.log(`Reset completed! Updated ${result.modifiedCount} users.`);
        console.log('Autopool tree has been cleared. You can now approve the correct person as the first user to establish a new root.');

    } catch (err) {
        console.error('Reset failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

resetAutopool();
