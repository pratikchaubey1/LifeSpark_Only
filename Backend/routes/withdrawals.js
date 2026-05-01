const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const IncomeLog = require('../models/IncomeLog');
const Kyc = require('../models/Kyc');

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
    const method = req.body?.method === 'cash' ? 'cash' : 'upi';

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid withdrawal amount is required.' });
    }

    // Minimum withdrawal amount is ₹300
    if (amount < 300) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹300.' });
    }

    // If method is upi, upiId and upiNo are required
    if (method === 'upi') {
      if (!upiId) {
        return res.status(400).json({ message: 'UPI ID is required for UPI withdrawal.' });
      }
      if (!upiNo) {
        return res.status(400).json({ message: 'UPI Number is required for UPI withdrawal.' });
      }
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ message: 'Your account has been blocked. Please contact admin.' });

    // Check minimum ACTIVE direct referrals requirement
    const activeDirectCount = await User.countDocuments({
      sponsorId: user.inviteCode,
      isActivated: true
    });
    if (activeDirectCount < 2) {
      return res.status(403).json({
        message: `You need at least 2 active direct referrals to request a withdrawal. Currently active: ${activeDirectCount}`
      });
    }

    // Check KYC status
    const kyc = await Kyc.findOne({ userId: user._id.toString() });
    if (!kyc || kyc.status !== 'approved') {
      return res.status(403).json({
        message: 'Your KYC must be approved before you can request a withdrawal.'
      });
    }

    const balance = Number(user.balance) || 0;

    if (amount > balance) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    // CAP CHECK: (upgradeLevel + 1) * 10000
    const currentLimit = ((user.upgradeLevel || 0) + 1) * 10000;

    // Compute totalWithdrawn from actual withdrawal records (approved + pending)
    // Use $ne: 'upgrade' to exclude upgrades, and also exclude by withdrawalId prefix 'UP-'
    // (old upgrade records may lack the type field but always start with 'UP-')
    const withdrawnAgg = await Withdrawal.aggregate([
      {
        $match: {
          userId: req.user._id.toString(),
          type: { $ne: 'upgrade' },
          withdrawalId: { $not: /^UP-/ },
          status: { $in: ['approved', 'pending'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawn = withdrawnAgg.length > 0 ? withdrawnAgg[0].total : 0;

    console.log(`[CAP CHECK] userId=${req.user._id}, totalWithdrawn=${totalWithdrawn}, amount=${amount}, currentLimit=${currentLimit}, willExceed=${totalWithdrawn + amount > currentLimit}`);

    if (totalWithdrawn + amount > currentLimit) {
      return res.status(403).json({
        message: `Withdrawal limit reached for your current level (₹${currentLimit.toLocaleString()}). Please request an upgrade of ₹1,176 to continue.`
      });
    }

    // Split amount: 25% withdrawal charge, 75% actual payout
    const chargeAmount = Number((amount * 0.25).toFixed(2));
    const withdrawalAmount = Number((amount - chargeAmount).toFixed(2));

    const withdrawal = new Withdrawal({
      withdrawalId: `WD-${Date.now()}`,
      userId: req.user._id.toString(),
      amount: withdrawalAmount,
      chargeAmount: chargeAmount,
      repurchaseAmount: 0,
      originalAmount: amount,
      upiId: method === 'upi' ? upiId : '',
      upiNo: method === 'upi' ? upiNo : 'CASH',
      status: 'pending',
      requestedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
      type: 'withdrawal',
      method
    });

    await withdrawal.save();

    // Only update user UPI info if method is upi
    if (method === 'upi') {
      user.upiId = upiId;
      user.upiNo = upiNo;
    }

    // CRITICAL: Deduct FULL amount immediately
    user.balance = balance - amount;

    await user.save();

    return res.status(201).json({
      withdrawal,
      chargeAmount,
      withdrawalAmount,
      message: `Withdrawal request for ₹${withdrawalAmount} created. ₹${chargeAmount} (25%) deducted as withdrawal charge.`
    });
  } catch (err) {
    console.error('Create withdrawal error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create upgrade request
router.post('/upgrade', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ message: 'Your account has been blocked. Please contact admin.' });

    const method = req.body?.method === 'cash' ? 'cash' : 'upi';

    // Deduct fixed ₹1,176 for upgrade if method is upi
    const upgradeAmount = 1176;
    const balance = Number(user.balance) || 0;

    if (method === 'upi' && balance < upgradeAmount) {
      return res.status(400).json({ message: 'Insufficient balance for ₹1,176 upgrade.' });
    }

    // Check for existing pending upgrade request
    const existingUpgrade = await Withdrawal.findOne({
      userId: req.user._id.toString(),
      type: 'upgrade',
      status: 'pending'
    });

    if (existingUpgrade) {
      return res.status(400).json({ message: 'You already have a pending upgrade request.' });
    }

    const upgradeRequest = new Withdrawal({
      withdrawalId: `UP-${Date.now()}`,
      userId: req.user._id.toString(),
      amount: upgradeAmount,
      upiId: method === 'upi' ? (user.upiId || 'N/A') : '',
      upiNo: method === 'upi' ? (user.upiNo || 'N/A') : 'CASH',
      status: 'pending',
      requestedAt: new Date(),
      type: 'upgrade',
      method
    });

    await upgradeRequest.save();

    // Deduct balance ONLY if method is upi
    if (method === 'upi') {
      user.balance = balance - upgradeAmount;
      await user.save();
    }

    return res.status(201).json({
      message: method === 'cash'
        ? 'Upgrade request submitted successfully. Please pay ₹1,176 manually to admin.'
        : 'Upgrade request submitted successfully. Admin will approve it shortly.',
      withdrawal: upgradeRequest
    });
  } catch (err) {
    console.error('Upgrade request error', err);
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

    if (amount < 300) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹300.' });
    }

    if (!upiId) {
      return res.status(400).json({ message: 'UPI ID is required.' });
    }

    if (!upiNo) {
      return res.status(400).json({ message: 'UPI Number is required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ message: 'Your account has been blocked. Please contact admin.' });

    const marriageFund = Number(user.marriageFund) || 0;

    if (amount > marriageFund) {
      return res.status(400).json({ message: 'Insufficient marriage fund balance.' });
    }

    // Check KYC status
    const kyc = await Kyc.findOne({ userId: user._id.toString() });
    if (!kyc || kyc.status !== 'approved') {
      return res.status(403).json({
        message: 'Your KYC must be approved before you can request a withdrawal.'
      });
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

    if (amount < 300) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹300.' });
    }

    if (!upiId) {
      return res.status(400).json({ message: 'UPI ID is required.' });
    }

    if (!upiNo) {
      return res.status(400).json({ message: 'UPI Number is required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ message: 'Your account has been blocked. Please contact admin.' });

    const accidentFund = Number(user.accidentFund) || 0;

    if (amount > accidentFund) {
      return res.status(400).json({ message: 'Insufficient accident fund balance.' });
    }

    // Check KYC status
    const kyc = await Kyc.findOne({ userId: user._id.toString() });
    if (!kyc || kyc.status !== 'approved') {
      return res.status(403).json({
        message: 'Your KYC must be approved before you can request a withdrawal.'
      });
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
