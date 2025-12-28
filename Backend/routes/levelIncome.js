const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

const { getUsersAtLevel } = require('../utils/team');

// Income per user at each level (in rupees)
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
 * Get level income data for authenticated user
 * GET /api/level-income
 */
router.get('/', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const levels = [];
        let totalLevelIncome = 0;

        // Calculate for each level (1-10)
        for (let level = 1; level <= 10; level++) {
            let userIdsAtLevel = [];

            if (level === 1) {
                // Level 1 is direct referrals
                userIdsAtLevel = Array.isArray(currentUser.directInviteIds)
                    ? currentUser.directInviteIds
                    : [];
            } else {
                // For levels 2-10, recursively find users
                const level1Ids = Array.isArray(currentUser.directInviteIds)
                    ? currentUser.directInviteIds
                    : [];
                userIdsAtLevel = await getUsersAtLevel(level1Ids, level);
            }

            // Fetch user details for this level
            const usersAtLevel = await User.find({
                _id: { $in: userIdsAtLevel }
            }).select('_id name email inviteCode isActivated createdAt');

            const userCount = usersAtLevel.length;
            const incomePerUser = LEVEL_INCOME_RATES[level];
            const totalIncome = userCount * incomePerUser;
            totalLevelIncome += totalIncome;

            levels.push({
                level,
                incomePerUser,
                userCount,
                totalIncome,
                users: usersAtLevel.map(u => ({
                    id: u._id.toString(),
                    name: u.name,
                    email: u.email,
                    inviteCode: u.inviteCode,
                    isActivated: !!u.isActivated,
                    createdAt: u.createdAt
                }))
            });
        }

        return res.json({
            levels,
            totalLevelIncome
        });
    } catch (err) {
        console.error('Get level income error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
