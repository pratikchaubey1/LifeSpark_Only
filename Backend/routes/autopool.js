const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { findGlobalAutopoolParent, distributeAutopoolIncome } = require('../utils/autopool');
const AutopoolHistory = require('../models/AutopoolHistory');
const auth = require('../middleware/auth'); // Assuming you have this
const adminAuth = require('../middleware/adminAuth'); // Assuming this too

// ---------------- USER ROUTES ----------------

// Get Autopool Status
router.get('/status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            status: user.autopoolStatus, // 'inactive', 'requested', 'active'
            joinDate: user.autopoolJoinDate,
            income: user.autopoolLevelIncome,
            levelsCompleted: user.autopoolLevelsCompleted
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Team Members at a specific level
router.get('/team/:level', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.autopoolStatus !== 'active') {
            return res.status(400).json({ message: 'You are not active in Autopool' });
        }

        const targetLevel = parseInt(req.params.level);
        if (isNaN(targetLevel) || targetLevel < 1 || targetLevel > 10) {
            return res.status(400).json({ message: 'Invalid level. Must be between 1 and 10.' });
        }

        // BFS to find all members at the target level
        let currentLevelNodes = [user._id];
        let currentDepth = 0;

        while (currentDepth < targetLevel && currentLevelNodes.length > 0) {
            currentDepth++;
            const parents = await User.find({ _id: { $in: currentLevelNodes } }).select('autopoolChildren');

            let nextLevelIds = [];
            for (const p of parents) {
                if (p.autopoolChildren && p.autopoolChildren.length > 0) {
                    nextLevelIds.push(...p.autopoolChildren);
                }
            }
            currentLevelNodes = nextLevelIds;
        }

        // Fetch details of members at this level
        const members = await User.find({ _id: { $in: currentLevelNodes } })
            .select('name inviteCode phone autopoolJoinDate');

        const teamData = members.map(m => ({
            name: m.name,
            inviteCode: m.inviteCode,
            phone: m.phone,
            joinDate: m.autopoolJoinDate ? new Date(m.autopoolJoinDate).toLocaleDateString() : 'N/A'
        }));

        res.json({
            level: targetLevel,
            count: teamData.length,
            members: teamData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Request to Join Autopool
router.post('/request', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.autopoolStatus !== 'inactive' && user.autopoolStatus !== 'rejected') {
            return res.status(400).json({ message: 'Autopool already requested or active' });
        }

        user.autopoolStatus = 'requested';
        await user.save();

        res.json({ message: 'Autopool request submitted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// ---------------- ADMIN ROUTES ----------------

// Get Pending Requests
router.get('/requests', adminAuth, async (req, res) => {
    try {
        const users = await User.find({ autopoolStatus: 'requested' })
            .select('name email phone inviteCode autopoolStatus');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Autopool History
router.get('/history', adminAuth, async (req, res) => {
    try {
        const history = await AutopoolHistory.find().sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Full Autopool Tree (Admin)
router.get('/tree', adminAuth, async (req, res) => {
    try {
        // Find the root user (active in autopool with no parent)
        const root = await User.findOne({ autopoolStatus: 'active', autopoolParent: null });

        if (!root) {
            return res.json({ tree: null, message: 'No autopool root found' });
        }

        // Build tree recursively with BFS to limit depth (max 5 levels for performance)
        async function buildNode(userId, currentDepth = 0, maxDepth = 5) {
            if (currentDepth >= maxDepth) return null;

            const user = await User.findById(userId).select('name inviteCode autopoolChildren autopoolJoinDate autopoolLevelIncome');
            if (!user) return null;

            const children = [];
            if (user.autopoolChildren && user.autopoolChildren.length > 0 && currentDepth < maxDepth) {
                for (const childId of user.autopoolChildren) {
                    const childNode = await buildNode(childId, currentDepth + 1, maxDepth);
                    if (childNode) children.push(childNode);
                }
            }

            return {
                id: user._id,
                name: user.name,
                inviteCode: user.inviteCode,
                joinDate: user.autopoolJoinDate ? new Date(user.autopoolJoinDate).toLocaleDateString() : 'N/A',
                income: user.autopoolLevelIncome || 0,
                children: children,
                childCount: user.autopoolChildren?.length || 0
            };
        }

        const tree = await buildNode(root._id, 0, 5);

        // Also get stats
        const totalActive = await User.countDocuments({ autopoolStatus: 'active' });

        res.json({
            tree,
            stats: {
                totalActive,
                rootName: root.name,
                rootCode: root.inviteCode
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Approve Request
router.post('/approve/:userId', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.autopoolStatus !== 'requested') {
            return res.status(400).json({ message: `User status is ${user.autopoolStatus}, not requested` });
        }

        // Find Parent
        const parent = await findGlobalAutopoolParent();

        // If NO parent found, this is the ROOT (Company)
        // But only if no root exists.
        // If parent is null and root exists (BFS error), we have a problem.
        // `findGlobalAutopoolParent` returns null if NO active users exist (first user).

        user.autopoolStatus = 'active';
        user.autopoolJoinDate = new Date();
        user.autopoolParent = parent ? parent._id : null;
        user.autopoolChildren = [];

        await user.save();

        if (parent) {
            parent.autopoolChildren.push(user._id);
            await parent.save();

            // Distribute Income
            // We call this for the NEW user, which will trigger income for ancestors.
            await distributeAutopoolIncome(user);
        }

        // Log History
        await AutopoolHistory.create({
            userId: user._id,
            userName: user.name,
            inviteCode: user.inviteCode,
            action: 'approved'
        });

        res.json({ message: 'User approved for Autopool', parent: parent ? parent.name : 'ROOT' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Reject Request
router.post('/reject/:userId', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.autopoolStatus !== 'requested') {
            return res.status(400).json({ message: `User status is ${user.autopoolStatus}, not requested` });
        }

        user.autopoolStatus = 'rejected';
        await user.save();

        // Log History
        await AutopoolHistory.create({
            userId: user._id,
            userName: user.name,
            inviteCode: user.inviteCode,
            action: 'rejected'
        });

        res.json({ message: 'User request rejected.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
