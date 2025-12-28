const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { getUsersAtLevel } = require('../utils/team');

const router = express.Router();

const REWARD_CONFIG = {
    1: { name: 'Silver Coin', target: 10 },
    2: { name: 'Mobile', target: 100 },
    3: { name: 'Tablet', target: 500 },
    4: { name: 'Laptop', target: 1000 },
    5: { name: 'Bike', target: 10000 },
    6: { name: '₹2,00,000 Cash', target: 25000 },
    7: { name: 'Alto Car', target: 60000 },
    8: { name: 'Swift Car', target: 150000 },
    9: { name: 'Scorpio Car', target: 350000 },
    10: { name: 'Luxury Bungalow', target: 1000000 },
};

/**
 * GET /api/rewards
 * Returns progress for all 10 reward levels
 */
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const progress = [];
        const directIds = Array.isArray(user.directInviteIds) ? user.directInviteIds : [];

        for (let level = 1; level <= 10; level++) {
            let count = 0;
            if (level === 1) {
                count = directIds.length;
            } else {
                const levelIds = await getUsersAtLevel(directIds, level);
                count = levelIds.length;
            }

            const config = REWARD_CONFIG[level];
            const savedStatus = user.rewardCompletions.find(c => c.level === level);

            progress.push({
                level,
                reward: config.name,
                target: config.target,
                currentCount: count,
                isCompleted: count >= config.target,
                status: savedStatus ? savedStatus.status : (count >= config.target ? 'pending' : 'none'),
                completedAt: savedStatus ? savedStatus.completedAt : null
            });

            // Auto-check for new completions (optional but helpful)
            if (count >= config.target && !savedStatus) {
                user.rewardCompletions.push({
                    level,
                    status: 'pending',
                    completedAt: new Date()
                });
            }
        }

        if (user.isModified('rewardCompletions')) {
            await user.save();
        }

        res.json({ progress });
    } catch (err) {
        console.error('Get rewards error', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
