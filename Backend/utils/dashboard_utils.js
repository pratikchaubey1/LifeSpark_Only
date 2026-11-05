const User = require('../models/User');
const { getDownlineByLevels } = require('./team');

async function getAllDownlineIds(inviteCode, maxLevel = 10) {
    const directMembers = await User.find({ sponsorId: inviteCode }).select('_id').lean();
    const directIds = directMembers.map(m => m._id.toString());

    const levelMap = await getDownlineByLevels(directIds);
    const allIds = [];
    Object.values(levelMap).forEach(ids => allIds.push(...ids));
    return allIds;
}

const LEVEL_INCOME_RATES = {
    1: 300,
    2: 100,
    3: 100,
    4: 100,
    5: 50,
    6: 50,
    7: 50,
    8: 50,
    9: 50,
    10: 50
};

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

// Helper to check if a user is expired for RECEIVING income (REMOVED: Accounts have lifetime validity)
function isUserExpired(user) {
    // 60-day expiry rule has been removed - IDs never close or expire
    return false;
}

// Helper to check if a user is expired for GENERATING income for upline (REMOVED: Accounts have lifetime validity)
function isIncomeGenerationExpired(user) {
    // 60-day expiry rule has been removed - IDs always generate upline income
    return false;
}

/**
 * Calculate comprehensive team statistics and daily level income rate for a user.
 * @param {Object} user - Mongoose user object.
 * @returns {Promise<Object>} - Statistics object.
 */
async function getTeamStats(user) {
    const levelUncapped = {}; 
    const levelActiveCountsForActual = {}; 
    let actualLevelUncappedTotal = 0;

    // 1. Get downline ID map (Recursive lookup)
    const directMembers = await User.find({ sponsorId: user.inviteCode }).select('_id isActivated activatedAt createdAt isBlocked incomeExpiryDate').lean();
    const directIds = directMembers.map(m => m._id.toString());
    const levelUserIdsMap = await getDownlineByLevels(directIds);

    // Flatten all IDs to fetch in one go
    const allDownlineIds = [];
    Object.values(levelUserIdsMap).forEach(ids => allDownlineIds.push(...ids));

    // 2. Single batch fetch for ALL downline users
    const allTeamUsers = await User.find({
        _id: { $in: allDownlineIds }
    }).select('_id isActivated activatedAt createdAt isBlocked incomeExpiryDate').lean();

    // Index them by ID for fast lookup
    const userMap = {};
    allTeamUsers.forEach(u => userMap[u._id.toString()] = u);

    // 3. Process Levels in-memory
    for (let level = 1; level <= 10; level++) {
        const userIds = levelUserIdsMap[level] || [];
        const rate = LEVEL_INCOME_RATES[level] || 0;
        let activeCountForActual = 0;

        for (const id of userIds) {
            const u = userMap[id];
            if (u && u.isActivated) {
                // Potential Income (just check activation)
                levelUncapped[level] = (levelUncapped[level] || 0) + rate;
                
                // Actual Income Generation (check if they generate income for upline)
                if (!u.isBlocked && !isIncomeGenerationExpired(u)) {
                    actualLevelUncappedTotal += rate;
                    activeCountForActual++;
                }
            }
        }
        levelActiveCountsForActual[level] = activeCountForActual;
    }

    const potentialDailyLevelRate = Object.values(levelUncapped).reduce((sum, v) => sum + v, 0);

    // 4. Apply Caps to calculate Actual Credited Income
    let actualCreditedIncome = 0;
    const totalDirectActive = directMembers.filter(u => u.isActivated).length;

    // A sponsor only receives income if they themselves are active, not blocked, and not expired
    if (user.isActivated && !user.isBlocked && !isUserExpired(user)) {
        // Direct referral cap: if < 5 active directs, cap at ₹200
        let directCap = Infinity;
        if (totalDirectActive < 5) {
            directCap = 200;
        }

        // Progressive cap based on meeting thresholds at each level
        let effectiveCap = LEVEL_INCOME_CAPS[1] || 500;
        for (let level = 1; level <= 10; level++) {
            const count = levelActiveCountsForActual[level] || 0;
            const threshold = CAP_UNLOCK_THRESHOLDS[level] || Infinity;
            if (count >= threshold && LEVEL_INCOME_CAPS[level + 1]) {
                effectiveCap = LEVEL_INCOME_CAPS[level + 1];
            } else {
                break;
            }
        }

        effectiveCap = Math.min(effectiveCap, directCap);
        actualCreditedIncome = Math.min(actualLevelUncappedTotal, effectiveCap);
    }

    // 5. Calculate stats from memory
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const stats = {
        totalUser: allTeamUsers.length,
        totalActiveUser: allTeamUsers.filter(u => u.isActivated).length,
        totalInactiveUser: allTeamUsers.filter(u => !u.isActivated).length,

        totalDirect: directMembers.length,
        totalDirectActive: totalDirectActive,
        totalDirectInactive: directMembers.filter(u => !u.isActivated).length,

        todayActive: allTeamUsers.filter(u => u.isActivated && u.activatedAt >= todayStart).length,
        todayInactive: allTeamUsers.filter(u => !u.isActivated && u.createdAt >= todayStart).length,
        todayTotalId: allTeamUsers.filter(u => u.createdAt >= todayStart).length,

        dailyLevelIncome: 0,
        actualCreditedIncome: user.levelIncome || 0
    };

    return stats;
}

module.exports = {
    getTeamStats
};
