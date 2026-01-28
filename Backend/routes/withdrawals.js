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
 * Upgrade Income Chart:
 * Level 1: Total Withdrawal >= 10,000 → Upgrade Income 1,000
 * Level 2: Total Withdrawal >= 20,000 → Upgrade Income 2,000
 * Level 3: Total Withdrawal >= 30,000 → Upgrade Income 3,000
 * Level 4: Total Withdrawal >= 40,000 → Upgrade Income 4,000
 * Level 5: Total Withdrawal >= 50,000 → Upgrade Income 5,000
 * Level 6: Total Withdrawal >= 60,000 → Upgrade Income 6,000
 * Level 7: Total Withdrawal >= 70,000 → Upgrade Income 7,000
 * Level 8: Total Withdrawal >= 80,000 → Upgrade Income 8,000
 * Level 9: Total Withdrawal >= 90,000 → Upgrade Income 9,000
 * Level 10: Total Withdrawal >= 100,000 → Upgrade Income 10,000
 */
const UPGRADE_LEVELS = [
  { level: 1, threshold: 10000, upgradeAmount: 1000 },
  { level: 2, threshold: 30000, upgradeAmount: 2000 },
  { level: 3, threshold: 40000, upgradeAmount: 3000 },
  { level: 4, threshold: 50000, upgradeAmount: 4000 },
  { level: 5, threshold: 60000, upgradeAmount: 5000 },
  { level: 6, threshold: 70000, upgradeAmount: 6000 },
  { level: 7, threshold: 80000, upgradeAmount: 7000 },
  { level: 8, threshold: 90000, upgradeAmount: 8000 },
  { level: 9, threshold: 100000, upgradeAmount: 9000 },
  { level: 10, threshold: 110000, upgradeAmount: 10000 },
];

/**
 * Calculate upgrade income when total withdrawal crosses thresholds
 * This now correctly finds the NEXT unclaimed level, not just the first threshold crossed.
 * 
 * @param {number} newTotalWithdrawn - User's total withdrawn amount INCLUDING the new withdrawal
 * @param {Set<number>} claimedLevels - Set of level numbers already awarded
 * @returns {Object|null} - { level, upgradeAmount, threshold } or null if no threshold crossed
 */
function calculateUpgradeIncome(newTotalWithdrawn, claimedLevels) {
  // Find the first level where:
  // 1. The new total crosses or exceeds the threshold
  // 2. The level hasn't been claimed yet
  for (const levelInfo of UPGRADE_LEVELS) {
    if (newTotalWithdrawn >= levelInfo.threshold && !claimedLevels.has(levelInfo.level)) {
      return levelInfo;
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

    // Get ALL withdrawals (pending + approved) to calculate true cumulative total
    // and to see which upgrade levels have been claimed
    const allWithdrawals = await Withdrawal.find({
      userId: req.user._id.toString()
    });

    // Calculate the TRUE cumulative total of all withdrawals (pending + approved)
    const cumulativeTotal = allWithdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
    const newTotalWithdrawn = cumulativeTotal + amount;

    // Build a set of already-claimed upgrade levels (from both pending and approved)
    const claimedLevels = new Set(
      allWithdrawals
        .filter(w => w.upgradeLevel > 0)
        .map(w => w.upgradeLevel)
    );

    // Calculate upgrade income - find the next unclaimed level that is crossed
    const upgradeInfo = calculateUpgradeIncome(newTotalWithdrawn, claimedLevels);

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

    // CRITICAL: Deduct balance immediately
    user.balance = balance - amount;

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

    // CRITICAL: Deduct marriage fund immediately
    user.marriageFund = marriageFund - amount;

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

    // CRITICAL: Deduct accident fund immediately
    user.accidentFund = accidentFund - amount;

    await user.save();

    return res.status(201).json({ withdrawal, message: 'Accident fund withdrawal request submitted for admin approval.' });
  } catch (err) {
    console.error('Accident fund withdrawal error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
