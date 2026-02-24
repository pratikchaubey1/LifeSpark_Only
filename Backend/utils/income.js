const User = require('../models/User');

const LEVEL_INCOME_RATES = {
    1: 6,
    2: 5,
    3: 4,
    4: 3,
    5: 2,
    6: 1,
    7: 0.5,
    8: 0.5,
    9: 0.5,
    10: 0.5
};

const SPONSOR_INCOME = 50;

// Maximum daily level income per level (capping)
const LEVEL_INCOME_CAPS = {
    1: 500,
    2: 1000,
    3: 1500,
    4: 2000,
    5: 2500,
    6: 3000,
    7: 3500,
    8: 4000,
    9: 4500,
    10: 5000
};

/**
 * Distribute income to 10 levels of sponsors when a user activates.
 * @param {Object} beneficiary - The user who just activated.
 */
async function distributeIncome(beneficiary) {
    try {
        if (!beneficiary.sponsorId) {
            console.log(`⚠️  No sponsor for ${beneficiary.inviteCode}, skipping income distribution`);
            return;
        }

        console.log(`\n💰 Starting income distribution for ${beneficiary.inviteCode}`);
        let currentSponsorCode = beneficiary.sponsorId;

        for (let level = 1; level <= 10; level++) {
            if (!currentSponsorCode) break;

            const sponsor = await User.findOne({ inviteCode: currentSponsorCode });
            if (!sponsor) {
                console.log(`⚠️  Sponsor not found at level ${level}: ${currentSponsorCode}`);
                break;
            }

            let totalToCredit = 0;
            const levelRate = LEVEL_INCOME_RATES[level] || 0;

            // 1. Level 1 logic: Give SPONSOR_INCOME (50) + Level 1 rate (6) = ₹56 total
            if (level === 1) {
                totalToCredit = SPONSOR_INCOME + levelRate;
                sponsor.levelIncome = (Number(sponsor.levelIncome) || 0) + levelRate;
            } else {
                // 2. Level 2-10 logic: Give the standard level rate
                totalToCredit = levelRate;
                sponsor.levelIncome = (Number(sponsor.levelIncome) || 0) + levelRate;
            }

            if (totalToCredit > 0) {
                sponsor.balance = (Number(sponsor.balance) || 0) + totalToCredit;
                sponsor.totalIncome = (Number(sponsor.totalIncome) || 0) + totalToCredit;

                console.log(`✅ Level ${level}: ${sponsor.inviteCode} (${sponsor.name}) +₹${totalToCredit}`);
                await sponsor.save();
            }

            // Move up to the next sponsor in the chain
            currentSponsorCode = sponsor.sponsorId;
        }
        console.log(`✅ Income distribution complete for ${beneficiary.inviteCode}\n`);
    } catch (err) {
        console.error('❌ Error distributing income:', err);
    }
}

/**
 * Distribute level income daily to 10 sponsors when a user receives their daily bonus.
 * (Legacy — kept for backward compatibility, but no longer called from cron.)
 * @param {Object} beneficiary - The user who just received daily bonus.
 */
async function distributeDailyLevelIncome(beneficiary) {
    try {
        if (!beneficiary.sponsorId) return;

        let currentSponsorCode = beneficiary.sponsorId;

        for (let level = 1; level <= 10; level++) {
            if (!currentSponsorCode) break;

            const sponsor = await User.findOne({ inviteCode: currentSponsorCode });
            if (!sponsor) break;

            const levelRate = LEVEL_INCOME_RATES[level] || 0;

            if (levelRate > 0) {
                sponsor.balance = (Number(sponsor.balance) || 0) + levelRate;
                sponsor.totalIncome = (Number(sponsor.totalIncome) || 0) + levelRate;
                sponsor.levelIncome = (Number(sponsor.levelIncome) || 0) + levelRate;

                await sponsor.save();
            }

            // Move up
            currentSponsorCode = sponsor.sponsorId;
        }
    } catch (err) {
        console.error('Error distributing daily level income:', err);
    }
}

/**
 * Distribute daily level income with per-level caps.
 * Aggregates all level income per sponsor across all active users,
 * applies LEVEL_INCOME_CAPS, then credits the capped amounts.
 * @param {Array} activeUsers - All activated users to process.
 */
async function distributeDailyLevelIncomeWithCaps(activeUsers) {
    try {
        // Map: sponsorId (string) -> { level -> uncappedTotal }
        const sponsorLevelIncome = {};

        // Phase 1: Aggregate uncapped level income per sponsor per level
        for (const user of activeUsers) {
            if (!user.sponsorId) continue;

            let currentSponsorCode = user.sponsorId;

            for (let level = 1; level <= 10; level++) {
                if (!currentSponsorCode) break;

                const sponsor = await User.findOne({ inviteCode: currentSponsorCode })
                    .select('_id inviteCode sponsorId').lean();
                if (!sponsor) break;

                const sponsorId = sponsor._id.toString();
                const levelRate = LEVEL_INCOME_RATES[level] || 0;

                if (levelRate > 0) {
                    if (!sponsorLevelIncome[sponsorId]) {
                        sponsorLevelIncome[sponsorId] = {};
                    }
                    sponsorLevelIncome[sponsorId][level] =
                        (sponsorLevelIncome[sponsorId][level] || 0) + levelRate;
                }

                // Move up
                currentSponsorCode = sponsor.sponsorId;
            }
        }

        // Phase 2: Apply caps and credit each sponsor
        for (const [sponsorId, levelMap] of Object.entries(sponsorLevelIncome)) {
            let totalCredited = 0;

            for (const [levelStr, uncapped] of Object.entries(levelMap)) {
                const level = Number(levelStr);
                const cap = LEVEL_INCOME_CAPS[level] || Infinity;
                const capped = Math.min(uncapped, cap);
                totalCredited += capped;
            }

            if (totalCredited > 0) {
                await User.findByIdAndUpdate(sponsorId, {
                    $inc: {
                        balance: totalCredited,
                        totalIncome: totalCredited,
                        levelIncome: totalCredited
                    }
                });
            }
        }

        console.log(`✅ Daily level income (with caps) distributed to ${Object.keys(sponsorLevelIncome).length} sponsors`);
    } catch (err) {
        console.error('❌ Error distributing daily level income with caps:', err);
    }
}

module.exports = {
    distributeIncome,
    distributeDailyLevelIncome,
    distributeDailyLevelIncomeWithCaps,
    LEVEL_INCOME_CAPS
};
