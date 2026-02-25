const mongoose = require('mongoose');
const User = require('./models/User');
const { getDownlineByLevels } = require('./utils/team');

async function testApi() {
    try {
        const MONGO_URI = 'mongodb+srv://pratikup42_db_user:vaUJqTtHFheWKaLr@cluster0.bvyo9tk.mongodb.net/mydatabase?retryWrites=true&w=majority';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const currentUser = await User.findOne({ name: /rajkishor/i }).lean();
        if (!currentUser) {
            console.log('Rajkishor not found');
            return;
        }

        console.log(`\nTesting for user: ${currentUser.name} (${currentUser.inviteCode})`);

        // Exact match check
        const directMembers = await User.find({ sponsorId: currentUser.inviteCode }).select('_id isActivated').lean();
        console.log(`📡 Direct Members (Exact Match): ${directMembers.length}`);

        // Case-insensitive check
        const directMembersCI = await User.find({ sponsorId: { $regex: new RegExp('^' + currentUser.inviteCode + '$', 'i') } }).select('_id').lean();
        console.log(`📡 Direct Members (Case-Insensitive): ${directMembersCI.length}`);

        // Trim check
        const directMembersTrim = await User.find({ sponsorId: { $regex: new RegExp('^\\s*' + currentUser.inviteCode + '\\s*$', 'i') } }).select('_id').lean();
        console.log(`📡 Direct Members (Trim + CI): ${directMembersTrim.length}`);

        if (directMembers.length > 0) {
            const directIds = directMembers.map(m => m._id.toString());
            const levelUserIdsMap = await getDownlineByLevels(directIds);

            console.log('\nLevel Map Results:');
            for (let i = 1; i <= 3; i++) {
                console.log(`Level ${i}: ${levelUserIdsMap[i] ? levelUserIdsMap[i].length : 0} IDs`);
            }

            // check level 1 activation
            const level1Users = await User.find({ _id: { $in: directIds } }).select('isActivated').lean();
            const activeLevel1 = level1Users.filter(u => u.isActivated).length;
            console.log(`Level 1 Activated Users: ${activeLevel1}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

testApi();
