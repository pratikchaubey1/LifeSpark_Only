const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Epin = require('../models/Epin');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...safeUser } = user.toObject();

    res.json({
      user: safeUser,
      cards: {
        totalIncome: user.totalIncome || 0,
        withdrawal: user.withdrawal || 0,
        balance: user.balance || 0,
        dailyBonusIncome: user.dailyBonusIncome || 0,
        freedomIncome: user.freedomIncome || 0,
        rankRewardIncome: user.rankRewardIncome || 0,
      },
    });
  } catch (err) {
    console.error('Dashboard error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- ACTIVATE ID -------------------- */

router.post('/activate-id', auth, async (req, res) => {
  try {
    const { epin, packageId } = req.body || {};

    if (!epin || !packageId) {
      return res.status(400).json({ message: 'E-Pin and package are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isActivated) {
      return res.status(400).json({ message: 'This ID is already activated.' });
    }

    const epinObj = await Epin.findOne({
      code: String(epin).trim(),
      used: false,
      $or: [
        { ownerUserId: null },
        { ownerUserId: user._id.toString() }
      ]
    });

    if (!epinObj) {
      return res.status(400).json({ message: 'Invalid or already used E-Pin.' });
    }

    // Mark E-Pin as used
    epinObj.used = true;
    epinObj.usedByUserId = user._id.toString();
    epinObj.usedAt = new Date();
    epinObj.packageId = packageId;
    await epinObj.save();

    // Activate user
    user.isActivated = true;
    user.activationPackage = packageId;
    user.activatedAt = new Date();
    user.lastDailyCredit = null;
    await user.save();

    const { password, ...safeUser } = user.toObject();

    res.json({
      message: 'ID activated successfully.',
      user: safeUser,
    });
  } catch (err) {
    console.error('Activate ID error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
