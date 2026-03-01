const User = require('../models/User');

/**
 * Recursively get all user IDs in the downline up to N levels.
 * @param {Array} directIds - Immediate downline IDs.
 * @param {number} maxLevel - Depth limit.
 * @returns {Promise<Array>} - Flattened array of all unique user IDs in the downline.
 */
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
 * Calculate comprehensive team statistics and daily level income rate for a user.
 * @param {Object} user - Mongoose user object.
 * @returns {Promise<Object>} - Statistics object.
 */
async function getTeamStats(user) {
    const levelUncapped = {}; // Track uncapped income per level
    const levelActiveCounts = {}; // Track active user count per level

    const directMembers = await User.find({ sponsorId: user.inviteCode }).select('_id').lean();
    const directIds = directMembers.map(m => m._id.toString());

    const levelUserIdsMap = await getDownlineByLevels(directIds);
    const allDownlineIds = [];

    for (let level = 1; level <= 10; level++) {
        const userIds = levelUserIdsMap[level] || [];
        if (userIds.length === 0) continue;

        const levelUsers = await User.find({
            _id: { $in: userIds }
        }).select('_id isActivated activatedAt').lean();

        const rate = LEVEL_INCOME_RATES[level] || 0;
        let activeCount = 0;

        for (const u of levelUsers) {
            if (u.isActivated) {
                levelUncapped[level] = (levelUncapped[level] || 0) + rate;
                activeCount++;
            }
            allDownlineIds.push(u._id.toString());
        }
        levelActiveCounts[level] = activeCount;
    }

    // Total daily level rate = sum of all uncapped level incomes (display only, cap applied in cron)
    const totalDailyLevelRate = Object.values(levelUncapped).reduce((sum, v) => sum + v, 0);

    // Fetch full team details for stats (total/active/today)
    const teamUsers = await User.find({
        _id: { $in: allDownlineIds }
    }).select('isActivated activatedAt createdAt').lean();

    const directUsers = await User.find({
        sponsorId: user.inviteCode
    }).select('isActivated activatedAt createdAt').lean();

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
