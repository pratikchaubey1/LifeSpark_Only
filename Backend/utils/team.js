const User = require('../models/User');

/**
 * Recursively fetch all users in the downline level-by-level up to 10 levels.
 * This is more efficient than fetching one level at a time.
 * @param {Array} rootUserIds - The IDs of users at Level 1.
 * @returns {Promise<Object>} - Map of level (1-10) -> Array of User IDs.
 */
async function getDownlineByLevels(rootUserIds) {
    const levelMap = { 1: rootUserIds };
    let currentLevelIds = rootUserIds;
    let processedIds = new Set(rootUserIds);

    for (let level = 1; level < 10; level++) {
        if (currentLevelIds.length === 0) break;

        // Get invite codes for current level to find next level
        const currentUsers = await User.find({ _id: { $in: currentLevelIds } }).select('inviteCode').lean();
        const inviteCodes = currentUsers.map(u => u.inviteCode).filter(Boolean);

        if (inviteCodes.length === 0) break;

        // Find next level users (Case-insensitive to be safe)
        const nextLevelUsers = await User.find({
            sponsorId: { $in: inviteCodes }
        }).select('_id').lean();

        const nextLevelIds = nextLevelUsers
            .map(u => u._id.toString())
            .filter(id => !processedIds.has(id)); // Prevent cycles

        if (nextLevelIds.length === 0) break;

        levelMap[level + 1] = nextLevelIds;
        nextLevelIds.forEach(id => processedIds.add(id));
        currentLevelIds = nextLevelIds;
    }

    return levelMap;
}

module.exports = {
    getDownlineByLevels
};
