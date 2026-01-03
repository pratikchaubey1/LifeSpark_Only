const User = require('../models/User');

/**
 * Recursively get all user IDs in the downline up to N levels.
 * @param {Array} directIds - Immediate downline IDs.
 * @param {number} maxLevel - Depth limit.
 * @returns {Promise<Array>} - Flattened array of all unique user IDs in the downline.
 */
async function getAllDownlineIds(directIds, maxLevel = 10) {
    let allIds = new Set(directIds);
    let currentLevelIds = [...directIds];

    for (let level = 2; level <= maxLevel; level++) {
        if (currentLevelIds.length === 0) break;

        const nextLevelUsers = await User.find({
            _id: { $in: currentLevelIds }
        }).select('directInviteIds');

        const nextLevelIds = [];
        nextLevelUsers.forEach(u => {
            if (u.directInviteIds) {
                u.directInviteIds.forEach(id => {
                    if (!allIds.has(id)) {
                        allIds.add(id);
                        nextLevelIds.push(id);
                    }
                });
            }
        });
        currentLevelIds = nextLevelIds;
    }

    return Array.from(allIds);
}

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

/**
 * Calculate comprehensive team statistics and daily level income rate for a user.
 * @param {Object} user - Mongoose user object.
 * @returns {Promise<Object>} - Statistics object.
 */
async function getTeamStats(user) {
    const directIds = user.directInviteIds || [];

    // To calculate total daily level income, we need to know the depth of each user
    // We'll perform a level-by-level search to track depth
    let totalDailyLevelRate = 0;
    let allDownlineIds = [];
    let currentLevelIds = [...directIds];
    let processedIds = new Set(currentLevelIds);

    const today = new Date();

    for (let level = 1; level <= 10; level++) {
        if (currentLevelIds.length === 0) break;

        const levelUsers = await User.find({
            _id: { $in: currentLevelIds }
        }).select('isActivated activatedAt createdAt directInviteIds');

        const rate = LEVEL_INCOME_RATES[level] || 0;
        const nextLevelIds = [];

        for (const u of levelUsers) {
            // If user is active and within 30 days, they contribute to the sponsor's daily rate
            if (u.isActivated && u.activatedAt) {
                const daysSince = Math.floor((today - u.activatedAt) / (1000 * 60 * 60 * 24));
                if (daysSince < 30) {
                    totalDailyLevelRate += rate;
                }
            }

            // Track all downline for stats
            allDownlineIds.push(u._id.toString());

            // Collect next level
            if (u.directInviteIds) {
                u.directInviteIds.forEach(id => {
                    if (!processedIds.has(id)) {
                        processedIds.add(id);
                        nextLevelIds.push(id);
                    }
                });
            }
        }
        currentLevelIds = nextLevelIds;
    }

    // Fetch full team details for stats (total/active/today)
    const teamUsers = await User.find({
        _id: { $in: allDownlineIds }
    }).select('isActivated activatedAt createdAt');

    const directUsers = await User.find({
        _id: { $in: directIds }
    }).select('isActivated activatedAt createdAt');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const stats = {
        totalUser: teamUsers.length,
        totalActiveUser: teamUsers.filter(u => u.isActivated).length,
        totalInactiveUser: teamUsers.filter(u => !u.isActivated).length,

        totalDirect: directUsers.length,
        totalDirectActive: directUsers.filter(u => u.isActivated).length,
        totalDirectInactive: directUsers.filter(u => !u.isActivated).length,

        todayActive: teamUsers.filter(u => u.isActivated && u.activatedAt >= todayStart).length,
        todayInactive: teamUsers.filter(u => !u.isActivated && u.createdAt >= todayStart).length,
        todayTotalId: teamUsers.filter(u => u.createdAt >= todayStart).length,

        dailyLevelIncome: totalDailyLevelRate,
    };

    return stats;
}

module.exports = {
    getTeamStats
};
