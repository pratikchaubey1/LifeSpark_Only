const User = require('../models/User');
const IncomeLog = require('../models/IncomeLog');

const LEVEL_INCOME_RATES = {
    1: 5,
    2: 4,
    3: 3,
    4: 2,
    5: 1,
    6: 1,
    7: 0.5,
    8: 0.5,
    9: 0.5,
    10: 0.5
};

const SPONSOR_INCOME = 50;

// Helper to check if a user is expired (60-day system)
function isUserExpired(user) {
    if (!user) return false;
    if (user.upgradeStatus === 'approved') return false;
    if (!user.firstReferralDate) return false;
    const msSinceFirst = Date.now() - new Date(user.firstReferralDate).getTime();
    const daysSinceFirst = msSinceFirst / (1000 * 60 * 60 * 24);
    return daysSinceFirst >= 60;
}

// Maximum daily level income caps (total income cap, unlocked progressively)
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

// Active user count required at each level to unlock the NEXT level's cap
const CAP_UNLOCK_THRESHOLDS = {
    1: 10,
    2: 50,
    3: 150,
    4: 300,
    5: 600,
    6: 1200,
    7: 2400,
    8: 4800,
    9: 9600,
    10: 20000
};

/**
 * Distribute income to 10 levels of sponsors when a user activates.
 * @param {Object} beneficiary - The user who just activated.
 */
async function distributeIncome(beneficiary) {
    try {
        if (beneficiary.isBlocked) {
            console.log(`🚫 ${beneficiary.inviteCode} is BLOCKED, skipping all income distribution`);
            return;
        }

        // 60-Day Upgrade Check for Beneficiary
        if (isUserExpired(beneficiary)) {
            console.log(`🚫 ${beneficiary.inviteCode} is EXPIRED (60-day rule), skipping upline income generation`);
            return;
        }

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

            // Skip blocked or expired sponsors — don't credit them, but continue walking up
            if (sponsor.isBlocked || isUserExpired(sponsor)) {
                console.log(`🚫 Sponsor ${sponsor.inviteCode} at level ${level} is BLOCKED or EXPIRED, skipping credit`);
                currentSponsorCode = sponsor.sponsorId;
                continue;
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

                // Log sponsor income (₹50) separately from level income
                if (level === 1) {
                    await IncomeLog.create({
                        userId: sponsor._id.toString(),
                        userName: sponsor.name,
                        userInviteCode: sponsor.inviteCode,
                        type: 'sponsor_income',
                        amount: SPONSOR_INCOME,
                        level: 1,
                        fromUserId: beneficiary._id.toString(),
                        fromUserName: beneficiary.name || beneficiary.inviteCode,
                        description: `Sponsor income ₹${SPONSOR_INCOME} from ${beneficiary.inviteCode} activation`
                    });
                }
                // Log level income
                await IncomeLog.create({
                    userId: sponsor._id.toString(),
                    userName: sponsor.name,
                    userInviteCode: sponsor.inviteCode,
                    type: 'level_income',
                    amount: levelRate,
                    level,
                    fromUserId: beneficiary._id.toString(),
                    fromUserName: beneficiary.name || beneficiary.inviteCode,
                    description: `Level ${level} income ₹${levelRate} from ${beneficiary.inviteCode} activation`
                });
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

            if (sponsor.isBlocked || isUserExpired(sponsor)) {
                currentSponsorCode = sponsor.sponsorId;
                continue;
            }

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
        // Map: sponsorId (string) -> { level -> { uncapped, activeCount } }
        const sponsorLevelData = {};

        // Phase 1: Aggregate uncapped level income AND active user count per sponsor per level
        for (const user of activeUsers) {
            if (!user.sponsorId) continue;
            // Blocked or Expired users don't generate level income for sponsors
            if (user.isBlocked || isUserExpired(user)) continue; 

            let currentSponsorCode = user.sponsorId;

            for (let level = 1; level <= 10; level++) {
                if (!currentSponsorCode) break;

                const sponsor = await User.findOne({ inviteCode: currentSponsorCode })
                    .select('_id inviteCode sponsorId firstReferralDate upgradeStatus').lean();
                if (!sponsor) break;

                // Skip expired sponsors in the aggregation
                if (isUserExpired(sponsor)) {
                    currentSponsorCode = sponsor.sponsorId;
                    continue;
                }

                const sponsorId = sponsor._id.toString();
                const levelRate = LEVEL_INCOME_RATES[level] || 0;

                if (levelRate > 0) {
                    if (!sponsorLevelData[sponsorId]) {
                        sponsorLevelData[sponsorId] = {};
                    }
                    if (!sponsorLevelData[sponsorId][level]) {
                        sponsorLevelData[sponsorId][level] = { uncapped: 0, activeCount: 0 };
                    }
                    sponsorLevelData[sponsorId][level].uncapped += levelRate;
                    sponsorLevelData[sponsorId][level].activeCount += 1;
                }

                // Move up
                currentSponsorCode = sponsor.sponsorId;
            }
        }

        // Phase 2: Apply total cap with progressive unlock and credit each sponsor
        for (const [sponsorId, levelMap] of Object.entries(sponsorLevelData)) {
            // Sum uncapped income across all levels
            let totalUncapped = 0;
            for (const [, data] of Object.entries(levelMap)) {
                totalUncapped += data.uncapped;
            }

            // --- Direct referral cap: if < 5 direct users, max ₹200 ---
            const sponsor = await User.findById(sponsorId).select('inviteCode').lean();
            let directCap = Infinity;
            if (sponsor) {
                const directCount = await User.countDocuments({ sponsorId: sponsor.inviteCode });
                if (directCount < 5) {
                    directCap = 200;
                }
            }

            // Determine effective cap: start at Level 1 cap (₹500)
            // Unlock higher caps when each level meets its threshold
            let effectiveCap = LEVEL_INCOME_CAPS[1] || 500;

            for (let level = 1; level <= 10; level++) {
                const data = levelMap[level];
                const activeCount = data ? data.activeCount : 0;
                const threshold = CAP_UNLOCK_THRESHOLDS[level] || Infinity;
                if (activeCount >= threshold && LEVEL_INCOME_CAPS[level + 1]) {
                    effectiveCap = LEVEL_INCOME_CAPS[level + 1];
                } else {
                    break;
                }
            }

            // Apply the more restrictive of the two caps
            effectiveCap = Math.min(effectiveCap, directCap);

            const totalCredited = Math.min(totalUncapped, effectiveCap);

            if (totalCredited > 0) {
                const sponsorDoc = await User.findByIdAndUpdate(sponsorId, {
                    $inc: {
                        balance: totalCredited,
                        totalIncome: totalCredited,
                        levelIncome: totalCredited
                    }
                }, { new: false }).select('name inviteCode').lean();

                // Log daily level income
                await IncomeLog.create({
                    userId: sponsorId,
                    userName: sponsorDoc?.name || '',
                    userInviteCode: sponsorDoc?.inviteCode || '',
                    type: 'daily_level_income',
                    amount: totalCredited,
                    description: `Daily level income ₹${totalCredited} (uncapped: ₹${totalUncapped}, cap: ₹${effectiveCap})`
                });
            }
        }

        console.log(`✅ Daily level income (with total cap) distributed to ${Object.keys(sponsorLevelData).length} sponsors`);
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
