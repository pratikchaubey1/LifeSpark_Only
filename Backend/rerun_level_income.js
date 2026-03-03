/**
 * One-time script to re-run level income distribution with the new cap logic.
 * This ONLY distributes level income - it does NOT give daily bonus again.
 * 
 * What it does:
 * 1. Finds all activated users
 * 2. Runs distributeDailyLevelIncomeWithCaps with the new per-level thresholds
 * 3. Credits the DIFFERENCE between new cap logic and what was already credited
 * 
 * Usage: node rerun_level_income.js
 * Add --dry-run to see what would happen without making changes.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const LEVEL_INCOME_RATES = { 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1, 7: 0.5, 8: 0.5, 9: 0.5, 10: 0.5 };
const LEVEL_INCOME_CAPS = { 1: 500, 2: 1000, 3: 1500, 4: 2000, 5: 2500, 6: 3000, 7: 3500, 8: 4000, 9: 4500, 10: 5000 };
const CAP_UNLOCK_THRESHOLDS = { 1: 10, 2: 50, 3: 150, 4: 300, 5: 600, 6: 1200, 7: 2400, 8: 4800, 9: 9600, 10: 20000 };

const isDryRun = process.argv.includes('--dry-run');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    console.log(isDryRun ? '*** DRY RUN MODE - no changes will be made ***' : '*** LIVE MODE - changes will be applied ***');
    console.log('');

    const User = mongoose.connection.db.collection('users');
    const activeUsers = await User.find({ isActivated: true, activatedAt: { $ne: null } }).toArray();
    console.log('Total activated users: ' + activeUsers.length);

    // Phase 1: Aggregate level income per sponsor just like the cron does
    const sponsorLevelData = {};

    for (const user of activeUsers) {
        if (!user.sponsorId) continue;
        let currentSponsorCode = user.sponsorId;

        for (let level = 1; level <= 10; level++) {
            if (!currentSponsorCode) break;
            const sponsor = await User.findOne({ inviteCode: currentSponsorCode });
            if (!sponsor) break;

            const sponsorId = sponsor._id.toString();
            const levelRate = LEVEL_INCOME_RATES[level] || 0;

            if (levelRate > 0) {
                if (!sponsorLevelData[sponsorId]) sponsorLevelData[sponsorId] = { inviteCode: sponsor.inviteCode, name: sponsor.name };
                if (!sponsorLevelData[sponsorId][level]) sponsorLevelData[sponsorId][level] = { uncapped: 0, activeCount: 0 };
                sponsorLevelData[sponsorId][level].uncapped += levelRate;
                sponsorLevelData[sponsorId][level].activeCount += 1;
            }

            currentSponsorCode = sponsor.sponsorId;
        }
    }

    console.log('Sponsors to process: ' + Object.keys(sponsorLevelData).length);
    console.log('');

    // Phase 2: Calculate capped income for each sponsor
    let totalCreditedAll = 0;
    const results = [];

    for (const [sponsorId, data] of Object.entries(sponsorLevelData)) {
        let totalUncapped = 0;
        for (let level = 1; level <= 10; level++) {
            if (data[level]) totalUncapped += data[level].uncapped;
        }

        // Determine effective cap
        let effectiveCap = LEVEL_INCOME_CAPS[1] || 500;
        for (let level = 1; level <= 10; level++) {
            const levelData = data[level];
            const activeCount = levelData ? levelData.activeCount : 0;
            const threshold = CAP_UNLOCK_THRESHOLDS[level] || Infinity;
            if (activeCount >= threshold && LEVEL_INCOME_CAPS[level + 1]) {
                effectiveCap = LEVEL_INCOME_CAPS[level + 1];
            } else {
                break;
            }
        }

        const shouldCredit = Math.min(totalUncapped, effectiveCap);

        if (shouldCredit > 0) {
            results.push({
                sponsorId,
                inviteCode: data.inviteCode,
                name: data.name,
                uncapped: totalUncapped,
                cap: effectiveCap,
                credited: shouldCredit
            });
            totalCreditedAll += shouldCredit;
        }
    }

    // Show specific user LS570043
    const targetUser = results.find(r => r.inviteCode === 'LS570043');
    if (targetUser) {
        console.log('--- LS570043 Details ---');
        console.log('Name: ' + targetUser.name);
        console.log('Uncapped: Rs.' + targetUser.uncapped);
        console.log('Effective Cap: Rs.' + targetUser.cap);
        console.log('Should Credit: Rs.' + targetUser.credited);
        console.log('');
    }

    console.log('Total sponsors receiving income: ' + results.length);
    console.log('Total income to distribute: Rs.' + totalCreditedAll);
    console.log('');

    if (!isDryRun) {
        console.log('Applying credits...');
        let applied = 0;
        for (const r of results) {
            await User.updateOne(
                { _id: new mongoose.Types.ObjectId(r.sponsorId) },
                { $inc: { balance: r.credited, totalIncome: r.credited, levelIncome: r.credited } }
            );
            applied++;
            if (applied % 50 === 0) console.log('  Applied ' + applied + '/' + results.length);
        }
        console.log('Done! Applied credits to ' + applied + ' sponsors.');
    } else {
        console.log('Dry run complete. Run without --dry-run to apply.');
    }

    await mongoose.connection.close();
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
