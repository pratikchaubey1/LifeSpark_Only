const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { distributeIncome } = require('../utils/income');

const router = express.Router();

// Middleware to check if user is a franchise
const franchiseAuth = (req, res, next) => {
    if (req.user.role !== 'franchise') {
        return res.status(403).json({ message: 'Access denied. Franchise role required.' });
    }
    next();
};

/**
 * GET /team
 * Get consolidated downline for franchise (L1 to L10)
 */
router.get('/team', auth, franchiseAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const directIds = user.directInviteIds || [];
        let allDownline = [];
        let currentLevelIds = [...directIds];
        let processedIds = new Set(currentLevelIds);

        for (let level = 1; level <= 10; level++) {
            if (currentLevelIds.length === 0) break;

            const levelUsers = await User.find({
                _id: { $in: currentLevelIds }
            }).select('name email inviteCode isActivated activatedAt createdAt directInviteIds bankDetails upiId upiNo');

            const nextLevelIds = [];
            for (const u of levelUsers) {
                allDownline.push({
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    inviteCode: u.inviteCode,
                    isActivated: u.isActivated,
                    activatedAt: u.activatedAt,
                    createdAt: u.createdAt,
                    level: level,
                    bankDetails: u.bankDetails,
                    upiId: u.upiId,
                    upiNo: u.upiNo
                });

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

        res.json({ team: allDownline });
    } catch (err) {
        console.error('Franchise team fetch error', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /activate/:userId
 * Allow franchise to activate a member in their downline
 */
router.post('/activate/:userId', auth, franchiseAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Verify target user is in franchise's downline
        const franchiseUser = await User.findById(req.user._id);
        const directIds = franchiseUser.directInviteIds || [];

        // Helper to check if id is in downline (up to 10 levels)
        let foundInDownline = false;
        let currentLevelIds = [...directIds];
        let processedIds = new Set(currentLevelIds);

        for (let level = 1; level <= 10; level++) {
            if (currentLevelIds.includes(userId)) {
                foundInDownline = true;
                break;
            }
            if (currentLevelIds.length === 0) break;

            const nextLevelUsers = await User.find({
                _id: { $in: currentLevelIds }
            }).select('directInviteIds');

            const nextLevelIds = [];
            nextLevelUsers.forEach(u => {
                if (u.directInviteIds) {
                    u.directInviteIds.forEach(id => {
                        if (!processedIds.has(id)) {
                            processedIds.add(id);
                            nextLevelIds.push(id);
                        }
                    });
                }
            });
            currentLevelIds = nextLevelIds;
        }

        if (!foundInDownline) {
            return res.status(403).json({ message: 'Access denied. You can only activate users in your downline.' });
        }

        // 2. Perform activation
        const targetUser = await User.findById(userId);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });
        if (targetUser.isActivated) return res.status(400).json({ message: 'User is already activated' });

        targetUser.isActivated = true;
        targetUser.activationPackage = 'FranchiseActivation';
        targetUser.activatedAt = new Date();
        targetUser.incomeExpiryDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
        targetUser.lastDailyCredit = null;

        // 3. Distribute income
        await distributeIncome(targetUser);

        await targetUser.save();

        res.json({
            message: `Successfully activated ${targetUser.name}`,
            user: {
                id: targetUser._id,
                isActivated: targetUser.isActivated,
                activatedAt: targetUser.activatedAt
            }
        });

    } catch (err) {
        console.error('Franchise activation error', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * PUT /update-bank/:userId
 * Allow franchise to update bank details of a member in their downline
 */
router.put('/update-bank/:userId', auth, franchiseAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { bankDetails, upiId, upiNo } = req.body;

        // 1. Verify target user is in franchise's downline
        const franchiseUser = await User.findById(req.user._id);
        const directIds = franchiseUser.directInviteIds || [];

        // Helper to check if id is in downline (up to 10 levels)
        let foundInDownline = false;
        let currentLevelIds = [...directIds];
        let processedIds = new Set(currentLevelIds);

        for (let level = 1; level <= 10; level++) {
            if (currentLevelIds.includes(userId)) {
                foundInDownline = true;
                break;
            }
            if (currentLevelIds.length === 0) break;

            const nextLevelUsers = await User.find({
                _id: { $in: currentLevelIds }
            }).select('directInviteIds');

            const nextLevelIds = [];
            nextLevelUsers.forEach(u => {
                if (u.directInviteIds) {
                    u.directInviteIds.forEach(id => {
                        if (!processedIds.has(id)) {
                            processedIds.add(id);
                            nextLevelIds.push(id);
                        }
                    });
                }
            });
            currentLevelIds = nextLevelIds;
        }

        if (!foundInDownline) {
            return res.status(403).json({ message: 'Access denied. You can only update users in your downline.' });
        }

        // 2. Perform update
        const targetUser = await User.findById(userId);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (bankDetails) {
            targetUser.bankDetails = {
                ...targetUser.bankDetails,
                ...bankDetails
            };
        }
        if (upiId !== undefined) targetUser.upiId = upiId;
        if (upiNo !== undefined) targetUser.upiNo = upiNo;

        await targetUser.save();

        res.json({
            message: `Successfully updated bank details for ${targetUser.name}`,
            user: {
                id: targetUser._id,
                bankDetails: targetUser.bankDetails,
                upiId: targetUser.upiId,
                upiNo: targetUser.upiNo
            }
        });

    } catch (err) {
        console.error('Franchise bank update error', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
