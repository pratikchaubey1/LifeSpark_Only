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
    const levelUncapped = {}; 
    const levelActiveCounts = {}; 

    // 1. Get downline ID map (Recursive lookup)
    const directMembers = await User.find({ sponsorId: user.inviteCode }).select('_id isActivated activatedAt createdAt').lean();
    const directIds = directMembers.map(m => m._id.toString());
    const levelUserIdsMap = await getDownlineByLevels(directIds);

    // Flatten all IDs to fetch in one go
    const allDownlineIds = [];
    Object.values(levelUserIdsMap).forEach(ids => allDownlineIds.push(...ids));

    // 2. Single batch fetch for ALL downline users
    const allTeamUsers = await User.find({
        _id: { $in: allDownlineIds }
    }).select('_id isActivated activatedAt createdAt').lean();

    // Index them by ID for fast lookup
    const userMap = {};
    allTeamUsers.forEach(u => userMap[u._id.toString()] = u);

    // 3. Process Levels in-memory
    for (let level = 1; level <= 10; level++) {
        const userIds = levelUserIdsMap[level] || [];
        const rate = LEVEL_INCOME_RATES[level] || 0;
        let activeCount = 0;

        for (const id of userIds) {
            const u = userMap[id];
            if (u && u.isActivated) {
                levelUncapped[level] = (levelUncapped[level] || 0) + rate;
                activeCount++;
            }
        }
        levelActiveCounts[level] = activeCount;
    }

    const totalDailyLevelRate = Object.values(levelUncapped).reduce((sum, v) => sum + v, 0);

    // 4. Calculate stats from memory
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const stats = {
        totalUser: allTeamUsers.length,
        totalActiveUser: allTeamUsers.filter(u => u.isActivated).length,
        totalInactiveUser: allTeamUsers.filter(u => !u.isActivated).length,

        totalDirect: directMembers.length,
        totalDirectActive: directMembers.filter(u => u.isActivated).length,
        totalDirectInactive: directMembers.filter(u => !u.isActivated).length,

        todayActive: allTeamUsers.filter(u => u.isActivated && u.activatedAt >= todayStart).length,
        todayInactive: allTeamUsers.filter(u => !u.isActivated && u.createdAt >= todayStart).length,
        todayTotalId: allTeamUsers.filter(u => u.createdAt >= todayStart).length,

        dailyLevelIncome: totalDailyLevelRate,
    };

    return stats;
}

module.exports = {
    getTeamStats
};
