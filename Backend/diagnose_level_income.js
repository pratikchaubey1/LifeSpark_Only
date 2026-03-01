/**
 * Diagnose level income with per-level thresholds.
 * Usage: node diagnose_level_income.js LS570043
 */

const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://pratikup42_db_user:vaUJqTtHFheWKaLr@cluster0.bvyo9tk.mongodb.net/mydatabase?retryWrites=true&w=majority';

const LEVEL_INCOME_RATES = { 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1, 7: 0.5, 8: 0.5, 9: 0.5, 10: 0.5 };
const LEVEL_INCOME_CAPS = { 1: 500, 2: 1000, 3: 1500, 4: 2000, 5: 2500, 6: 3000, 7: 3500, 8: 4000, 9: 4500, 10: 5000 };
const CAP_UNLOCK_THRESHOLDS = { 1: 10, 2: 50, 3: 150, 4: 300, 5: 600, 6: 1200, 7: 2400, 8: 4800, 9: 9600, 10: 20000 };

async function run() {
    const inviteCode = process.argv[2] || 'LS570043';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCol = db.collection('users');

    const user = await usersCol.findOne({ inviteCode });
    if (!user) { console.error('User not found:', inviteCode); process.exit(1); }

    console.log(`👤 User: ${user.name} (${user.inviteCode})`);
    console.log(`   Balance: ₹${user.balance || 0}\n`);

    let currentLevelIds = [];
    const directMembers = await usersCol.find({ sponsorId: inviteCode }).project({ _id: 1 }).toArray();
    currentLevelIds = directMembers.map(m => m._id.toString());

    const levelData = [];

    console.log('══════════════════════════════════════════════════════════════════════════════');
    console.log(' Level │ Active │ Threshold │ Met? │ Uncapped │ Unlocks');
    console.log('───────┼────────┼───────────┼──────┼──────────┼────────');

    for (let level = 1; level <= 10; level++) {
        let activeCount = 0, uncapped = 0;
        const rate = LEVEL_INCOME_RATES[level];
        const threshold = CAP_UNLOCK_THRESHOLDS[level];

        if (currentLevelIds.length > 0) {
            const objectIds = currentLevelIds.map(id => new mongoose.Types.ObjectId(id));
            const usersAtLevel = await usersCol.find({ _id: { $in: objectIds } })
                .project({ _id: 1, inviteCode: 1, isActivated: 1 }).toArray();

            activeCount = usersAtLevel.filter(u => u.isActivated).length;
            uncapped = activeCount * rate;

            const inviteCodes = usersAtLevel.map(u => u.inviteCode).filter(Boolean);
            if (inviteCodes.length > 0) {
                const nextLevel = await usersCol.find({ sponsorId: { $in: inviteCodes } }).project({ _id: 1 }).toArray();
                currentLevelIds = nextLevel.map(m => m._id.toString());
            } else {
                currentLevelIds = [];
            }
        }

        const meetsThreshold = activeCount >= threshold;
        levelData.push({ level, activeCount, rate, uncapped, meetsThreshold, threshold });

        const unlockText = meetsThreshold && LEVEL_INCOME_CAPS[level + 1] ? `→ ₹${LEVEL_INCOME_CAPS[level + 1]}` : '-';
        console.log(`   ${level.toString().padStart(2)}  │ ${activeCount.toString().padStart(6)} │ ${threshold.toString().padStart(9)} │  ${meetsThreshold ? '✅' : '❌'}  │  ₹${uncapped.toString().padStart(5)} │ ${unlockText}`);
    }

    console.log('══════════════════════════════════════════════════════════════════════════════');

    const totalUncapped = levelData.reduce((sum, l) => sum + l.uncapped, 0);

    let effectiveCap = LEVEL_INCOME_CAPS[1];
    for (const ld of levelData) {
        if (ld.meetsThreshold && LEVEL_INCOME_CAPS[ld.level + 1]) {
            effectiveCap = LEVEL_INCOME_CAPS[ld.level + 1];
        } else {
            break;
        }
    }

    const finalIncome = Math.min(totalUncapped, effectiveCap);

    console.log(`\n📊 Total Uncapped (shown on frontend): ₹${totalUncapped}`);
    console.log(`🔒 Effective Cap (applied in cron):     ₹${effectiveCap}`);
    console.log(`💰 Actual Credited by Cron:             ₹${finalIncome}${totalUncapped > effectiveCap ? ` (CAPPED from ₹${totalUncapped})` : ''}`);

    await mongoose.connection.close();
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
