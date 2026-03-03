const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    const inviteCode = process.argv[2] || 'LS570043';
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const usersCol = db.collection('users');

    const user = await usersCol.findOne({ inviteCode });
    if (!user) { console.error('User not found'); process.exit(1); }

    const todayStr = new Date().toISOString().slice(0, 10);

    console.log('User: ' + user.name + ' (' + user.inviteCode + ')');
    console.log('Today: ' + todayStr);
    console.log('lastDailyCredit: ' + (user.lastDailyCredit || 'never'));
    console.log('');
    console.log('--- Current Totals ---');
    console.log('Balance:        Rs.' + (user.balance || 0));
    console.log('Total Income:   Rs.' + (user.totalIncome || 0));
    console.log('Level Income:   Rs.' + (user.levelIncome || 0));
    console.log('Daily Bonus:    Rs.' + (user.dailyBonusIncome || 0));
    console.log('');

    if (user.lastDailyCredit === todayStr) {
        console.log('Cron DID run today');
    } else {
        console.log('Cron has NOT run today (last: ' + (user.lastDailyCredit || 'never') + ')');
    }

    if (user.isActivated && user.activatedAt) {
        const days = Math.floor((new Date() - new Date(user.activatedAt)) / 86400000);
        console.log('Activated: ' + new Date(user.activatedAt).toISOString().slice(0, 10) + ' (' + days + ' days ago)');
        console.log('Daily Bonus eligible: ' + (days < 30 ? 'YES' : 'NO (past 30 days)'));
    }

    // Calculate level income
    const RATES = { 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1, 7: 0.5, 8: 0.5, 9: 0.5, 10: 0.5 };
    const CAPS = { 1: 500, 2: 1000, 3: 1500, 4: 2000, 5: 2500, 6: 3000, 7: 3500, 8: 4000, 9: 4500, 10: 5000 };
    const THRESHOLDS = { 1: 10, 2: 50, 3: 150, 4: 300, 5: 600, 6: 1200, 7: 2400, 8: 4800, 9: 9600, 10: 20000 };

    let currentLevelIds = [];
    const direct = await usersCol.find({ sponsorId: inviteCode }).project({ _id: 1 }).toArray();
    currentLevelIds = direct.map(m => m._id.toString());

    let totalUncapped = 0;
    const levelInfo = [];

    for (let level = 1; level <= 10; level++) {
        let activeCount = 0, uncapped = 0;
        if (currentLevelIds.length > 0) {
            const oids = currentLevelIds.map(id => new mongoose.Types.ObjectId(id));
            const users = await usersCol.find({ _id: { $in: oids } }).project({ _id: 1, inviteCode: 1, isActivated: 1 }).toArray();
            activeCount = users.filter(u => u.isActivated).length;
            uncapped = activeCount * RATES[level];
            const codes = users.map(u => u.inviteCode).filter(Boolean);
            if (codes.length > 0) {
                const next = await usersCol.find({ sponsorId: { $in: codes } }).project({ _id: 1 }).toArray();
                currentLevelIds = next.map(m => m._id.toString());
            } else currentLevelIds = [];
        }
        totalUncapped += uncapped;
        levelInfo.push({ level, activeCount, met: activeCount >= THRESHOLDS[level] });
    }

    let effectiveCap = CAPS[1];
    for (const li of levelInfo) {
        if (li.met && CAPS[li.level + 1]) effectiveCap = CAPS[li.level + 1];
        else break;
    }

    const credited = Math.min(totalUncapped, effectiveCap);
    const dailyBonus = (user.isActivated && user.activatedAt && Math.floor((new Date() - new Date(user.activatedAt)) / 86400000) < 30) ? 50 : 0;

    console.log('');
    console.log('--- Cron Credits Today ---');
    console.log('Level Income (uncapped): Rs.' + totalUncapped);
    console.log('Effective Cap:           Rs.' + effectiveCap);
    console.log('Level Income (capped):   Rs.' + credited);
    console.log('Daily Bonus:             Rs.' + dailyBonus);
    console.log('TOTAL added today:       Rs.' + (credited + dailyBonus));

    await mongoose.connection.close();
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
