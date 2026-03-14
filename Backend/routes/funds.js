const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');
const DannFundLog = require('../models/DannFundLog');
const router = express.Router();

// -------------------- USER: CONTRIBUTE --------------------
router.post('/dann/contribute', auth, async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid contribution amount is required.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (amount > user.balance) {
            return res.status(400).json({ message: 'Insufficient balance in your wallet.' });
        }

        // Deduct from user
        user.balance -= amount;
        await user.save();

        // Add to collective fund
        let settings = await SiteSettings.findOne();
        if (!settings) settings = await SiteSettings.create({});

        settings.dannFundBalance = (settings.dannFundBalance || 0) + amount;
        await settings.save();

        // Log the action
        await DannFundLog.create({
            userId: user._id.toString(),
            userName: user.name,
            userInviteCode: user.inviteCode,
            type: 'contribution',
            amount,
            description: `Contributed to Dann Fund from main balance`
        });

        res.json({
            message: `Successfully contributed ₹${amount} to Dann Fund.`,
            newBalance: user.balance
        });
    } catch (err) {
        console.error('Dann contribution error', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// -------------------- GLOBAL: GET STATS --------------------
router.get('/dann/stats', auth, async (req, res) => {
    try {
        const settings = await SiteSettings.findOne();
        const logs = await DannFundLog.find().sort({ createdAt: -1 }).limit(100);

        res.json({
            balance: settings?.dannFundBalance || 0,
            logs
        });
    } catch (err) {
        console.error('Dann stats error', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// -------------------- ADMIN: TRANSFER --------------------
router.post('/dann/transfer', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { targetInviteCode, amount, description } = req.body;
        const amt = Number(amount);

        if (!targetInviteCode || !amt || amt <= 0) {
            return res.status(400).json({ message: 'Target user and valid amount are required.' });
        }

        const settings = await SiteSettings.findOne();
        if (!settings || (settings.dannFundBalance || 0) < amt) {
            return res.status(400).json({ message: 'Insufficient balance in Dann Fund.' });
        }

        const targetUser = await User.findOne({ inviteCode: targetInviteCode });
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found.' });
        }

        // Deduct from pool
        settings.dannFundBalance -= amt;
        await settings.save();

        // Add to user balance
        targetUser.balance = (targetUser.balance || 0) + amt;
        targetUser.totalIncome = (targetUser.totalIncome || 0) + amt; // Also counts as income
        await targetUser.save();

        // Log
        await DannFundLog.create({
            userId: targetUser._id.toString(),
            userName: targetUser.name,
            userInviteCode: targetUser.inviteCode,
            type: 'transfer',
            amount: amt,
            description: description || `Transfer from Dann Fund`
        });

        res.json({ message: `Successfully transferred ₹${amt} to ${targetUser.name}.` });
    } catch (err) {
        console.error('Dann transfer error', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
