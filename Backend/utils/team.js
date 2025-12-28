const User = require('../models/User');

/**
 * Recursively get all users at a specific level in the downline
 * @param {Array} currentLevelUserIds - User IDs at the current level
 * @param {Number} targetLevel - The level we want to reach (1-10)
 * @param {Number} currentLevel - Current level in recursion
 * @returns {Array} User IDs at the target level
 */
async function getUsersAtLevel(currentLevelUserIds, targetLevel, currentLevel = 1) {
    if (currentLevel === targetLevel) {
        return currentLevelUserIds;
    }

    if (currentLevel > 10 || currentLevelUserIds.length === 0) {
        return [];
    }

    // Get all users who were invited by current level users
    const nextLevelUsers = await User.find({
        _id: { $in: currentLevelUserIds }
    }).select('directInviteIds');

    // Collect all direct invite IDs from current level
    const nextLevelUserIds = [];
    nextLevelUsers.forEach(user => {
        if (Array.isArray(user.directInviteIds)) {
            nextLevelUserIds.push(...user.directInviteIds);
        }
    });

    // Recursively get users at the target level
    return getUsersAtLevel(nextLevelUserIds, targetLevel, currentLevel + 1);
}

module.exports = {
    getUsersAtLevel
};
