const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAutopoolRoot() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const activeUsers = await User.find({ autopoolStatus: 'active' })
            .select('name email autopoolStatus autopoolParent autopoolChildren');

        if (activeUsers.length === 0) {
            console.log('No active Autopool users found.');
        } else {
            console.log('Active Autopool Users:');
            activeUsers.forEach(u => {
                console.log(`- ${u.name} (${u.email}) - Parent: ${u.autopoolParent || 'NONE (ROOT)'}, Children: ${u.autopoolChildren.length}`);
            });
        }

        const requestedUsers = await User.find({ autopoolStatus: 'requested' })
            .select('name email');
        console.log('\nUsers with Pending Requests:');
        requestedUsers.forEach(u => {
            console.log(`- ${u.name} (${u.email})`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkAutopoolRoot();
