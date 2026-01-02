const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');

const router = express.Router();

function normalize(v) {
  if (v == null) return '';
  return String(v).trim();
}

// List withdrawal requests for current user
router.get('/', auth, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({
      userId: req.user._id.toString()
    }).sort({ requestedAt: -1 });

    return res.json({ withdrawals });
  } catch (err) {
    console.error('Get withdrawals error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create withdrawal request
router.post('/', auth, async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    const upiId = normalize(req.body?.upiId);
    const upiNo = normalize(req.body?.upiNo);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid withdrawal amount is required.' });
    }

    // "ask for upi" (required)
    if (!upiId) {
      return res.status(400).json({ message: 'UPI ID is required.' });
    }

    // optional, but requested
    if (!upiNo) {
      return res.status(400).json({ message: 'UPI Number is required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check minimum direct referrals requirement
    const directCount = Array.isArray(user.directInviteIds) ? user.directInviteIds.length : 0;
    if (directCount < 2) {
      return res.status(403).json({
        message: `You need at least 2 direct referrals to request a withdrawal. Current: ${directCount}`
      });
    }

    const balance = Number(user.balance) || 0;

    if (amount > balance) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    const withdrawal = new Withdrawal({
      withdrawalId: `WD-${Date.now()}`,
      userId: req.user._id.toString(),
      amount,
      upiId,
      upiNo,
      status: 'pending',
      requestedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
    });

    await withdrawal.save();

    // Also store latest UPI info on the user profile for convenience
    user.upiId = upiId;
    user.upiNo = upiNo;
    await user.save();

    return res.status(201).json({ withdrawal });
  } catch (err) {
    console.error('Create withdrawal error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
