const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function fixMissingBonuses() {
    try {
        console.log('🔄 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        const activeUsers = await User.find({ isActivated: true });
        console.log(`🔍 Found ${activeUsers.length} active users to check.`);

        let updatedUsers = 0;
        let updatedSponsors = 0;

        for (const user of activeUsers) {
            // 1. Check if user received joining bonus (Total Income should be at least 50 if they've been active for 0 days)
            // Since registration bonus changed from 50 (immediate) to 50 (on activation),
            // we check if they have 0 or very low income but are active.
            // However, to be safe, we check if they have NO joining bonus credited.
            // Since we don't have a specific log, we'll look for users with balance/totalIncome = 0

            if (user.totalIncome === 0 && user.balance === 0) {
                console.log(`💰 Crediting ₹50 joining bonus to ${user.name} (${user.inviteCode})`);
                user.balance += 50;
                user.totalIncome += 50;
                await user.save();
                updatedUsers++;
            }

            // 2. Check if their sponsor received the reward for them
            if (user.sponsorId) {
                const sponsor = await User.findOne({ inviteCode: user.sponsorId });
                if (sponsor) {
                    // This is harder to verify without a transaction log.
                    // If you want me to FORCE credit it now, I can.
                    // Usually, if a sponsor has 0 income but many active invites, it's a sign they missed rewards.
                    /*
                    const reward = 56;
                    sponsor.balance += reward;
                    sponsor.totalIncome += reward;
                    sponsor.levelIncome += 6;
                    await sponsor.save();
                    updatedSponsors++;
                    */
                }
            }
        }

        console.log(`\n✨ Done!`);
        console.log(`✅ Users given joining bonus: ${updatedUsers}`);
        // console.log(`✅ Sponsors given referral rewards: ${updatedSponsors}`);
        console.log(`\nNOTE: Accurate sponsor reward fixing requires transaction logs. 
I have only fixed the most obvious cases (users with 0 income).`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

fixMissingBonuses();
