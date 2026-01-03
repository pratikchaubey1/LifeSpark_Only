const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { getUsersAtLevel } = require('../utils/team');

const router = express.Router();

// Income per user at each level
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

router.get('/', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id)
            .select('directInviteIds')
            .lean();

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const directIds = Array.isArray(currentUser.directInviteIds)
            ? currentUser.directInviteIds
            : [];

        const levels = [];
        let totalLevelIncome = 0;

        // Pre-calculate user IDs for all levels
        const levelUserIdsMap = {};

        for (let level = 1; level <= 10; level++) {
            if (level === 1) {
                levelUserIdsMap[level] = directIds;
            } else {
                levelUserIdsMap[level] = await getUsersAtLevel(directIds, level);
            }
        }

        // Fetch users for each level (parallelized)
        const levelPromises = Object.entries(levelUserIdsMap).map(
            async ([level, userIds]) => {
                const levelNum = Number(level);
                if (!userIds.length) {
                    return {
                        level: levelNum,
                        incomePerUser: LEVEL_INCOME_RATES[levelNum],
                        userCount: 0,
                        totalIncome: 0,
                        users: []
                    };
                }

                const today = new Date();
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(today.getDate() - 30);

                // Filter for users who are active and within their 30-day bonus window
                const activeInWindowUsers = await User.find({
                    _id: { $in: userIds },
                    isActivated: true,
                    activatedAt: { $gte: thirtyDaysAgo }
                })
                    .select('_id name email inviteCode isActivated activatedAt createdAt')
                    .lean();

                const userCount = activeInWindowUsers.length;
                const incomePerUser = LEVEL_INCOME_RATES[levelNum];
                const totalIncome = userCount * incomePerUser;

                return {
                    level: levelNum,
                    incomePerUser,
                    userCount,
                    totalIncome,
                    users: activeInWindowUsers.map(u => ({
                        id: u._id.toString(),
                        name: u.name,
                        email: u.email,
                        inviteCode: u.inviteCode,
                        isActivated: !!u.isActivated,
                        createdAt: u.createdAt,
                        activatedAt: u.activatedAt
                    }))
                };
            }
        );

        const levelResults = await Promise.all(levelPromises);

        for (const levelData of levelResults) {
            totalLevelIncome += levelData.totalIncome;
            levels.push(levelData);
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
