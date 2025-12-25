const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Epin = require('../models/Epin');
const EpinTransfer = require('../models/EpinTransfer');

const router = express.Router();

// List member-owned unused pins
router.get('/', auth, async (req, res) => {
  try {
    const epins = await Epin.find({
      used: false,
      ownerUserId: req.user._id.toString()
    });
    return res.json({ epins });
  } catch (err) {
    console.error('Get epins error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Used pins report (pins used by current user)
router.get('/used', auth, async (req, res) => {
  try {
    const epins = await Epin.find({
      used: true,
      usedByUserId: req.user._id.toString()
    });
    return res.json({ epins });
  } catch (err) {
    console.error('Get used epins error', err);
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

    const mongoose = require('mongoose');
    let target;

    // Check if 'to' is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(to)) {
      target = await User.findById(to);
    }

    // If not found by ID, try invite code
    if (!target) {
      target = await User.findOne({ inviteCode: to });
    }

    if (!target) {
      return res.status(404).json({ message: 'Target user not found' });
    }
    if (target._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot transfer pins to yourself' });
    }

    const availableMine = await Epin.find({
      used: false,
      ownerUserId: req.user._id.toString()
    }).limit(howMany);

    if (availableMine.length < howMany) {
      return res.status(400).json({ message: `Not enough available pins. Available: ${availableMine.length}` });
    }

    const now = new Date();
    const selectedCodes = [];

    // Update the pins
    for (const epin of availableMine) {
      epin.ownerUserId = target._id.toString();
      epin.transferredAt = now;
      epin.transferredBy = req.user._id.toString();
      await epin.save();
      selectedCodes.push(epin.code);
    }

    // Create transfer record
    const transferRecord = new EpinTransfer({
      transferId: `EPTR-${Date.now()}`,
      fromUserId: req.user._id.toString(),
      fromUserName: req.user.name,
      toUserId: target._id.toString(),
      toUserName: target.name,
      codes: selectedCodes,
      count: selectedCodes.length,
      transferredAt: now,
      transferredBy: req.user._id.toString(),
    });

    await transferRecord.save();

    return res.status(201).json({ transfer: transferRecord });
  } catch (err) {
    console.error('Transfer epins error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transfer history relevant to current user
router.get('/transfers', auth, async (req, res) => {
  try {
    const transfers = await EpinTransfer.find({
      $or: [
        { fromUserId: req.user._id.toString() },
        { toUserId: req.user._id.toString() }
      ]
    }).sort({ transferredAt: -1 });

    return res.json({ transfers });
  } catch (err) {
    console.error('Get transfers error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
