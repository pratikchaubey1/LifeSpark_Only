const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');

const router = express.Router();

function normalize(v) {
  if (v == null) return '';
  return String(v).trim();
}

/**
 * Calculate upgrade income when total withdrawal crosses thresholds
 * Thresholds: 10000, 20000, 30000, ... 100000
 * Each threshold has upgradeIncome = threshold / 10
 * E.g., 10000 → 1000, 20000 → 2000
 * 
 * @param {number} currentTotalWithdrawn - User's total withdrawn amount so far (approved)
 * @param {number} newWithdrawalAmount - The new withdrawal amount being requested
 * @returns {Object|null} - { level, upgradeAmount, threshold } or null if no threshold crossed
 */
function calculateUpgradeIncome(currentTotalWithdrawn, newWithdrawalAmount) {
  const newTotal = currentTotalWithdrawn + newWithdrawalAmount;

  // Check each threshold from 10000 to 100000 in increments of 10000
  for (let threshold = 10000; threshold <= 100000; threshold += 10000) {
    // If current total is below threshold but new total crosses or reaches it
    if (currentTotalWithdrawn < threshold && newTotal >= threshold) {
      const level = threshold / 10000;
      const upgradeAmount = threshold / 10; // 1000, 2000, 3000, etc.
      return { level, upgradeAmount, threshold };
    }
  }
  return null;
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

    // Calculate upgrade income if this withdrawal crosses a threshold
    const currentTotalWithdrawn = Number(user.withdrawal) || 0;
    const upgradeInfo = calculateUpgradeIncome(currentTotalWithdrawn, amount);

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
      // Upgrade income fields
      upgradeIncome: upgradeInfo ? upgradeInfo.upgradeAmount : 0,
      upgradeLevel: upgradeInfo ? upgradeInfo.level : 0,
      isFirstAfterThreshold: upgradeInfo ? true : false,
    });

    await withdrawal.save();

    // Also store latest UPI info on the user profile for convenience
    user.upiId = upiId;
    user.upiNo = upiNo;
    await user.save();

    // Build response with upgrade income message if applicable
    const response = { withdrawal };
    if (upgradeInfo) {
      response.upgradeIncomeMessage = `₹${upgradeInfo.upgradeAmount.toLocaleString()} is for Upgrade Income (Level ${upgradeInfo.level} - after crossing ₹${upgradeInfo.threshold.toLocaleString()} threshold)`;
    }

    return res.status(201).json(response);
  } catch (err) {
    console.error('Create withdrawal error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================== MARRIAGE FUND WITHDRAWAL ==================
// Create withdrawal request from marriage fund (funds move only on admin approval)
router.post('/marriage-fund', auth, async (req, res) => {
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

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const marriageFund = Number(user.marriageFund) || 0;

    if (amount > marriageFund) {
      return res.status(400).json({ message: 'Insufficient marriage fund balance.' });
    }

    // Check for existing pending withdrawal from marriage fund
    const existingPending = await Withdrawal.findOne({
      userId: req.user._id.toString(),
      source: 'marriageFund',
      status: 'pending'
    });
    if (existingPending) {
      return res.status(400).json({
        message: 'You already have a pending marriage fund withdrawal request. Please wait for it to be processed.'
      });
    }

    // Create withdrawal request from marriage fund
    const withdrawal = new Withdrawal({
      withdrawalId: `WD-MF-${Date.now()}`,
      userId: req.user._id.toString(),
      amount,
      upiId,
      upiNo,
      source: 'marriageFund',
      status: 'pending',
      requestedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
    });

    await withdrawal.save();

    // DO NOT deduct from marriage fund yet - funds move only when admin approves
    // Only update UPI details
    user.upiId = upiId;
    user.upiNo = upiNo;
    await user.save();

    return res.status(201).json({ withdrawal, message: 'Marriage fund withdrawal request submitted for admin approval.' });
  } catch (err) {
    console.error('Marriage fund withdrawal error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================== ACCIDENT FUND WITHDRAWAL ==================
// Create withdrawal request from accident fund (funds move only on admin approval)
router.post('/accident-fund', auth, async (req, res) => {
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

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const accidentFund = Number(user.accidentFund) || 0;

    if (amount > accidentFund) {
      return res.status(400).json({ message: 'Insufficient accident fund balance.' });
    }

    // Check for existing pending withdrawal from accident fund
    const existingPending = await Withdrawal.findOne({
      userId: req.user._id.toString(),
      source: 'accidentFund',
      status: 'pending'
    });
    if (existingPending) {
      return res.status(400).json({
        message: 'You already have a pending accident fund withdrawal request. Please wait for it to be processed.'
      });
    }

    // Create withdrawal request from accident fund
    const withdrawal = new Withdrawal({
      withdrawalId: `WD-AF-${Date.now()}`,
      userId: req.user._id.toString(),
      amount,
      upiId,
      upiNo,
      source: 'accidentFund',
      status: 'pending',
      requestedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
    });

    await withdrawal.save();

    // DO NOT deduct from accident fund yet - funds move only when admin approves
    // Only update UPI details
    user.upiId = upiId;
    user.upiNo = upiNo;
    await user.save();

    return res.status(201).json({ withdrawal, message: 'Accident fund withdrawal request submitted for admin approval.' });
  } catch (err) {
    console.error('Accident fund withdrawal error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
