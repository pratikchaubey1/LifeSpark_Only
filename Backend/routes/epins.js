const express = require('express');
const User = require('../models/User');
const Epin = require('../models/Epin');
const EpinTransfer = require('../models/EpinTransfer');
const auth = require('../middleware/auth');

const router = express.Router();

// List member-owned unused pins
router.get('/', auth, async (req, res) => {
  try {
    const mine = await Epin.find({
      ownerUserId: req.user.id,
      used: false
    });
    return res.json({ epins: mine });
  } catch (err) {
    console.error('Epins fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Used pins report (pins used by current user)
router.get('/used', auth, async (req, res) => {
  try {
    const mine = await Epin.find({
      used: true,
      usedByUserId: req.user.id
    });
    return res.json({ epins: mine });
  } catch (err) {
    console.error('Used epins fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transfer up to 10 pins from current user to another user
router.post('/transfer', auth, async (req, res) => {
  try {
    const { to, count } = req.body || {};
    const howMany = Math.min(Math.max(parseInt(count || 1, 10) || 1, 1), 10);

    if (!to) {
      return res.status(400).json({ message: 'to is required (user id or invite code)' });
    }

    // Find target user
    const target = await User.findOne({
      $or: [
        { id: String(to) },
        { inviteCode: String(to) }
      ]
    });

    if (!target) {
      return res.status(404).json({ message: 'Target user not found' });
    }
    if (target.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot transfer pins to yourself' });
    }

    // Find available pins for current user
    const availableMine = await Epin.find({
      ownerUserId: req.user.id,
      used: false
    }).limit(howMany);

    if (availableMine.length < howMany) {
      // Count total available to give precise error
      const total = await Epin.countDocuments({ ownerUserId: req.user.id, used: false });
      return res.status(400).json({ message: `Not enough available pins. Available: ${total}` });
    }

    const now = new Date();
    const selectedCodes = [];

    // Perform transfer
    // Ideally use a transaction, but sequential updates are fine for now
    for (const epin of availableMine) {
      epin.ownerUserId = target.id;
      epin.transferredAt = now;
      epin.transferredBy = req.user.id;
      await epin.save();
      selectedCodes.push(epin.code);
    }

    // Record transfer history
    const transferRecord = new EpinTransfer({
      id: `EPTR-${Date.now()}`,
      fromUserId: req.user.id,
      toUserId: target.id,
      toUserName: target.name,
      codes: selectedCodes,
      count: selectedCodes.length,
      transferredAt: now,
      transferredBy: req.user.id
    });
    await transferRecord.save();

    return res.status(201).json({ transfer: transferRecord });

  } catch (err) {
    console.error('Epin transfer error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transfer history relevant to current user
router.get('/transfers', auth, async (req, res) => {
  try {
    const mine = await EpinTransfer.find({
      $or: [
        { fromUserId: req.user.id },
        { toUserId: req.user.id }
      ]
    }).sort({ transferredAt: -1 });

    return res.json({ transfers: mine });
  } catch (err) {
    console.error('Transfers fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
