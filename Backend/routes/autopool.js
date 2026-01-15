const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { findGlobalAutopoolParent, distributeAutopoolIncome } = require('../utils/autopool');
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

// Request to Join Autopool
router.post('/request', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.autopoolStatus !== 'inactive') {
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

        res.json({ message: 'User approved for Autopool', parent: parent ? parent.name : 'ROOT' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
