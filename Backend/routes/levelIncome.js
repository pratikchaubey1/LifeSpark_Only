const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { getUsersAtLevel } = require('../utils/team');
const { LEVEL_INCOME_CAPS } = require('../utils/income');

const router = express.Router();

// Income per user at each level
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

router.get('/', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id)
            .select('inviteCode directInviteIds')
            .lean();

        if (!currentUser) {
            console.log(`❌ Level Income Error: User ${req.user._id} not found`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`\n🔍 Fetching Level Income for ${currentUser.name} (${currentUser.inviteCode})`);

        // LEVEL 1 IDs are now found by matching sponsorId in the database (Source of Truth)
        const directMembers = await User.find({ sponsorId: currentUser.inviteCode }).select('_id').lean();
        const directIds = directMembers.map(m => m._id.toString());

        console.log(`📡 Level 1: Found ${directIds.length} members matching sponsorId=${currentUser.inviteCode}`);

        // Fetch user IDs for ALL levels in one efficient recursive pass
        const { getDownlineByLevels } = require('../utils/team');
        console.log(`🚀 Starting getDownlineByLevels for ${directIds.length} direct members...`);
        const levelUserIdsMap = await getDownlineByLevels(directIds);
        console.log(`✅ Finished getDownlineByLevels. Found IDs for ${Object.keys(levelUserIdsMap).length} levels.`);

        // Initialize levels and total income outside the loop
        const levels = [];
        let totalLevelIncome = 0;

        // Fetch users for each level (parallelized)
        const levelPromises = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
            async (levelNum) => {
                const userIds = levelUserIdsMap[levelNum] || [];
                if (!userIds.length) {
                    return {
                        level: levelNum,
                        incomePerUser: LEVEL_INCOME_RATES[levelNum],
                        userCount: 0,
                        activeUserCount: 0,
                        totalIncome: 0,
                        users: []
                    };
                }

                // Get ALL users at this level
                const allUsersAtLevel = await User.find({
                    _id: { $in: userIds }
                })
                    .select('_id name email inviteCode isActivated activatedAt createdAt phone')
                    .lean();

                const today = new Date();

                // All activated users contribute to income (no 30-day window)
                const incomeEligibleUsers = allUsersAtLevel.filter(u => u.isActivated);

                const totalUserCount = allUsersAtLevel.length;
                const activeUserCount = incomeEligibleUsers.length;
                const incomeEligibleCount = incomeEligibleUsers.length;

                const incomePerUser = LEVEL_INCOME_RATES[levelNum];
                const uncappedIncome = incomeEligibleCount * incomePerUser;

                return {
                    level: levelNum,
                    incomePerUser,
                    userCount: totalUserCount,
                    activeUserCount: activeUserCount,
                    incomeEligibleCount,
                    totalIncome: uncappedIncome, // Will be adjusted after total cap below
                    users: allUsersAtLevel.map(u => ({
                        id: u._id.toString(),
                        name: u.name,
                        email: u.email,
                        phone: u.phone,
                        inviteCode: u.inviteCode,
                        isActivated: !!u.isActivated,
                        createdAt: u.createdAt,
                        activatedAt: u.activatedAt
                    }))
                };
            }
        );

        const levelResults = await Promise.all(levelPromises);
        console.log(`📊 Processing final results for ${currentUser.name}...`);

        // Sum total income across all levels (uncapped for display)
        for (const levelData of levelResults) {
            totalLevelIncome += levelData.totalIncome;
            levels.push(levelData);
            if (levelData.level <= 3) {
                console.log(`📡 Level ${levelData.level}: ${levelData.activeUserCount} Active / ${levelData.userCount} Total (Income: ₹${levelData.totalIncome})`);
            }
        }

        console.log(`💰 Total Level Income: ₹${totalLevelIncome}`);

        return res.json({
            levels,
            totalLevelIncome,
            currentUserInfo: {
                name: currentUser.name,
                inviteCode: currentUser.inviteCode
            }
        });

    } catch (err) {
        console.error('Get level income error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
