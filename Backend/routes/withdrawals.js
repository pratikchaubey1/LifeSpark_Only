const express = require('express');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const auth = require('../middleware/auth');

const router = express.Router();

function normalize(v) {
  if (v == null) return '';
  return String(v).trim();
}

// List withdrawal requests for current user
router.get('/', auth, async (req, res) => {
  try {
    const mine = await Withdrawal.find({ userId: req.user.id }).sort({ requestedAt: -1 });
    return res.json({ withdrawals: mine });
  } catch (err) {
    console.error('Withdrawals fetch error', err);
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

    if (!upiId) {
      return res.status(400).json({ message: 'UPI ID is required.' });
    }

    if (!upiNo) {
      return res.status(400).json({ message: 'UPI Number is required.' });
    }

    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check balance (not just rely on req.user which might be stale)
    const balance = Number(user.balance) || 0;

    if (amount > balance) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    // Create withdrawal record
    const withdrawal = new Withdrawal({
      id: `WD-${Date.now()}`,
      userId: req.user.id,
      amount,
      upiId,
      upiNo,
      status: 'pending',
      requestedAt: new Date()
    });
    await withdrawal.save();

    // Deduct balance?
    // Logic in original file didn't explicitly deduct balance here!
    // Wait, let's checking the original file...
    // "if (amount > balance) return error"
    // But it didn't seem to DEDUCT balance in the POST route provided in the view_file output.
    // It just saved the withdrawal request. 
    // USUALLY withdrawal requests should deduct balance immediately or hold it.
    // However, if the admin approves it later, maybe that's when it deducts?
    // Let's look at admin routes later.
    // BUT, to be safe and logical, pending withdrawal implies "reserved" funds.
    // If the original code didn't deduct, maybe I shouldn't either?
    // "all.unshift(item); saveWithdrawals(all);" -> No user update aside from upi info.
    // "user.upiId = upiId; ... saveUsers(users);" 

    // So I will replicate strict behavior: Update user UPI info, but DO NOT deduct balance yet (presumably Admin does it).

    user.upiId = upiId;
    user.upiNo = upiNo;
    await user.save();

    return res.status(201).json({ withdrawal });

  } catch (err) {
    console.error('Withdrawal create error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
