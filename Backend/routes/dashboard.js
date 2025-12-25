const express = require('express');
const User = require('../models/User');
const Epin = require('../models/Epin');
const auth = require('../middleware/auth');

const router = express.Router();

/* -------------------- ROUTES -------------------- */

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure consistent boolean
    if (typeof user.isActivated !== 'boolean') {
      user.isActivated = false;
      // user.save() ? Not strictly needed unless we want to persist specific cleanups
    }

    const userObj = user.toObject();
    const { password, ...safeUser } = userObj;

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
    console.error('Dashboard fetch error', err);
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

    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isActivated) {
      return res.status(400).json({ message: 'This ID is already activated.' });
    }

    // Find E-Pin
    // Logic: match code (case insensitive trim perhaps?), not used, owner is null OR owner is user
    // Assuming input epin is string
    const codeInput = String(epin).trim();

    const epinDoc = await Epin.findOne({
      code: codeInput,
      used: false
    });

    if (!epinDoc) {
      return res.status(400).json({ message: 'Invalid or already used E-Pin.' });
    }

    // Check ownership
    if (epinDoc.ownerUserId !== null && epinDoc.ownerUserId !== user.id) {
      return res.status(400).json({ message: 'This E-Pin belongs to another user.' });
    }

    // Update E-Pin
    epinDoc.used = true;
    epinDoc.usedByUserId = user.id;
    epinDoc.usedAt = new Date();
    epinDoc.packageId = packageId;
    await epinDoc.save();

    // Update User
    user.isActivated = true;
    user.activationPackage = packageId;
    user.activatedAt = new Date();
    user.lastDailyCredit = null;
    await user.save();

    const userObj = user.toObject();
    const { password, ...safeUser } = userObj;

    res.json({
      message: 'ID activated successfully.',
      user: safeUser,
    });

  } catch (err) {
    console.error('Activation error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
