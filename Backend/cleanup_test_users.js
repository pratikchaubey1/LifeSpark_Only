const mongoose = require('mongoose');
const User = require('./models/User');
const Epin = require('./models/Epin');
const EpinTransfer = require('./models/EpinTransfer');
const Withdrawal = require('./models/Withdrawal');
require('dotenv').config();

async function cleanupTestUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Identify test users
        const testUsers = await User.find({
            $or: [
                { email: /@test\.com$/i },
                { name: /^User L/i },
                { inviteCode: /^TEST/i }
            ]
        });

        if (testUsers.length === 0) {
            console.log('No test users found.');
            await mongoose.disconnect();
            return;
        }

        const testUserIds = testUsers.map(u => u._id);
        const testInviteCodes = testUsers.map(u => u.inviteCode);

        console.log(`Found ${testUsers.length} test users to delete:`);
        testUsers.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.inviteCode}]`));

        // Delete associated records first
        console.log('Deleting associated records...');
        await Epin.deleteMany({ ownerUserId: { $in: testUserIds } });
        await EpinTransfer.deleteMany({
            $or: [
                { toUserId: { $in: testUserIds } },
                { fromUserId: { $in: testUserIds } }
            ]
        });
        await Withdrawal.deleteMany({ userId: { $in: testUserIds } });

        // Update other users who might refer to these test users (as sponsor or parent)
        console.log('Cleaning up references in other users...');
        await User.updateMany(
            { sponsorId: { $in: testInviteCodes } },
            { $set: { sponsorId: 'WSE-COMPANY', sponsorName: 'WSE Company' } }
        );

        // Remove from autopoolChildren arrays
        await User.updateMany(
            {},
            { $pull: { autopoolChildren: { $in: testUserIds } } }
        );

        // Finally delete the users
        console.log('Deleting users...');
        const result = await User.deleteMany({ _id: { $in: testUserIds } });
        console.log(`Successfully deleted ${result.deletedCount} users.`);

    } catch (err) {
        console.error('Cleanup error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

cleanupTestUsers();
