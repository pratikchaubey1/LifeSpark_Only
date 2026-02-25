const mongoose = require('mongoose');
const User = require('./models/User');

async function debugData() {
    try {
        const MONGO_URI = 'mongodb+srv://pratikup42_db_user:vaUJqTtHFheWKaLr@cluster0.bvyo9tk.mongodb.net/mydatabase?retryWrites=true&w=majority';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({}).lean();
        console.log(`Total users: ${users.length}`);

        // Find users with many referrals (by sponsorId matching)
        const sponsorCounts = {};
        users.forEach(u => {
            if (u.sponsorId) {
                sponsorCounts[u.sponsorId] = (sponsorCounts[u.sponsorId] || 0) + 1;
            }
        });

        const sortedSponsors = Object.entries(sponsorCounts).sort((a, b) => b[1] - a[1]);
        console.log('Top Sponsors (by sponsorId):', sortedSponsors.slice(0, 5));

        const topSponsorId = sortedSponsors[0][0];
        const sponsorInDb = users.find(u => u.inviteCode === topSponsorId);

        if (sponsorInDb) {
            console.log(`\nAnalyzing Top Sponsor: ${sponsorInDb.name} (${sponsorInDb.inviteCode})`);
            console.log(`Sponsor ID in DB: ${sponsorInDb._id}`);
            console.log(`Reported referrals (sponsorId match): ${sortedSponsors[0][1]}`);

            const directInviteIdsCount = Array.isArray(sponsorInDb.directInviteIds) ? sponsorInDb.directInviteIds.length : 0;
            console.log(`Records in directInviteIds array: ${directInviteIdsCount}`);

            // Check for type mismatches (ObjectId vs String)
            const countObjectIds = users.filter(u => u.sponsorId && typeof u.sponsorId !== 'string').length;
            const countHexStrings = users.filter(u => u.sponsorId && typeof u.sponsorId === 'string' && u.sponsorId.length === 24 && /^[0-9a-fA-F]+$/.test(u.sponsorId)).length;

            console.log(`\nData type analysis:`);
            console.log(`- sponsorId as ObjectIds: ${countObjectIds}`);
            console.log(`- sponsorId as 24-char Hex Strings (potential IDs): ${countHexStrings}`);

            if (countObjectIds > 0 || countHexStrings > 0) {
                console.log(`⚠️  SYSTEM ALERT: Many users have sponsorId as an ID instead of an Invite Code!`);
            }

            const activeReferrals = referrals.filter(u => u.isActivated);
            console.log(`Active referrals: ${activeReferrals.length}`);

            // Check if any referrals have a different case sponsorId
            const insensitiveReferrals = users.filter(u => u.sponsorId && u.sponsorId.toLowerCase() === topSponsorId.toLowerCase());
            if (insensitiveReferrals.length > referrals.length) {
                console.log(`⚠️  FOUND CASE MISMATCH: ${insensitiveReferrals.length} found with case-insensitive search vs ${referrals.length} exact.`);
            }

            // Check for whitespace
            const spaceReferrals = users.filter(u => u.sponsorId && u.sponsorId.trim() !== u.sponsorId);
            if (spaceReferrals.length > 0) {
                console.log(`⚠️  FOUND WHITESPACE: ${spaceReferrals.length} users have leading/trailing spaces in sponsorId.`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

debugData();
