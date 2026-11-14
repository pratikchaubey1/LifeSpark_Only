const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Epin = require('../models/Epin');
const EpinTransfer = require('../models/EpinTransfer');
const IncomeLog = require('../models/IncomeLog');
const { distributeIncome } = require('../utils/income');

const router = express.Router();

async function generateUniquePinCode(isSelf = false) {
  const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const prefix = isSelf ? 'SELF' : 'EP';
  let code = `${prefix}-${part()}-${part()}-${part()}`;
  let exists = await Epin.findOne({ code });
  while (exists) {
    code = `${prefix}-${part()}-${part()}-${part()}`;
    exists = await Epin.findOne({ code });
  }
  return code;
}

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

// Member's own list of self-generated E-Pins
router.get('/my-generated', auth, async (req, res) => {
  try {
    const epins = await Epin.find({
      $or: [
        { generatedByUserId: req.user._id.toString() },
        { ownerUserId: req.user._id.toString(), isSelfGenerated: true },
        { ownerUserId: req.user._id.toString(), pinTag: 'SELF-GENERATED' },
        { ownerUserId: req.user._id.toString(), code: { $regex: /^SELF-/i } }
      ]
    }).sort({ createdAt: -1 });

    const populated = await Promise.all(
      epins.map(async (p) => {
        const item = p.toObject();
        const activatedId = item.activatedUserId || item.usedByUserId;
        if (activatedId) {
          const actUser = await User.findById(activatedId).select('name inviteCode isActivated email phone');
          item.activatedUser = actUser || null;
        } else {
          item.activatedUser = null;
        }
        return item;
      })
    );

    return res.json({ epins: populated });
  } catch (err) {
    console.error('Get my-generated epins error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate E-Pin from wallet balance (₹1,500 per pin)
router.post('/generate-from-balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActivated) {
      return res.status(403).json({
        message: 'Your account must be activated to generate E-Pins from balance.'
      });
    }

    const { count } = req.body || {};
    const howMany = Math.min(Math.max(parseInt(count || 1, 10) || 1, 1), 10);
    const costPerPin = 1500;
    const totalCost = howMany * costPerPin;

    if ((user.balance || 0) < totalCost) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Required: ₹${totalCost.toLocaleString('en-IN')}, Available: ₹${(user.balance || 0).toLocaleString('en-IN')}`
      });
    }

    // Deduct balance
    user.balance = (user.balance || 0) - totalCost;

    const generatedEpins = [];
    const generatedCodes = [];

    for (let i = 0; i < howMany; i++) {
      const code = await generateUniquePinCode(true);
      const epin = new Epin({
        code,
        ownerUserId: user._id.toString(),
        isSelfGenerated: true,
        pinTag: 'SELF-GENERATED',
        generatedByUserId: user._id.toString(),
        cost: costPerPin,
        packageId: 'Basic',
        used: false
      });
      await epin.save();
      generatedEpins.push(epin);
      generatedCodes.push(code);
    }

    // Log transaction
    try {
      await IncomeLog.create({
        userId: user._id.toString(),
        userName: user.name,
        userInviteCode: user.inviteCode,
        type: 'epin_generation',
        amount: -totalCost,
        description: `Generated ${howMany} E-Pin(s) (${generatedCodes.join(', ')}) from wallet balance`,
        createdAt: new Date()
      });
    } catch (logErr) {
      console.warn('Failed to log epin_generation in IncomeLog:', logErr.message);
    }

    await user.save();

    return res.status(201).json({
      message: `Successfully generated ${howMany} E-Pin(s)!`,
      epins: generatedEpins,
      codes: generatedCodes,
      balance: user.balance
    });
  } catch (err) {
    console.error('Generate epin from balance error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate E-Pin from balance and immediately activate beneficiary
router.post('/generate-and-activate', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActivated) {
      return res.status(403).json({
        message: 'Your account must be activated to generate E-Pins from balance.'
      });
    }

    const { targetUserId, packageId = 'Basic' } = req.body || {};
    const cost = 1500;

    if ((user.balance || 0) < cost) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Required: ₹${cost.toLocaleString('en-IN')}, Available: ₹${(user.balance || 0).toLocaleString('en-IN')}`
      });
    }

    // Resolve beneficiary (targetUserId or self)
    let beneficiary;
    if (targetUserId) {
      const trimmedTarget = String(targetUserId).trim();
      if (mongoose.Types.ObjectId.isValid(trimmedTarget)) {
        beneficiary = await User.findById(trimmedTarget);
      }
      if (!beneficiary) {
        beneficiary = await User.findOne({ inviteCode: trimmedTarget });
      }
      if (!beneficiary) {
        return res.status(404).json({ message: 'Target member not found (invalid ID or Invite Code)' });
      }
    } else {
      beneficiary = user;
    }

    if (beneficiary.isActivated) {
      return res.status(400).json({
        message: `Member ${beneficiary.name} (${beneficiary.inviteCode}) is already activated.`
      });
    }

    // Deduct balance from generating user
    user.balance = (user.balance || 0) - cost;

    // Generate unique pin
    const code = await generateUniquePinCode(true);
    const now = new Date();

    const epin = new Epin({
      code,
      ownerUserId: user._id.toString(),
      isSelfGenerated: true,
      pinTag: 'SELF-GENERATED',
      generatedByUserId: user._id.toString(),
      cost: cost,
      packageId: packageId,
      used: true,
      usedByUserId: beneficiary._id.toString(),
      activatedUserId: beneficiary._id.toString(),
      usedAt: now
    });
    await epin.save();

    // Log transaction
    try {
      await IncomeLog.create({
        userId: user._id.toString(),
        userName: user.name,
        userInviteCode: user.inviteCode,
        type: 'epin_generation',
        amount: -cost,
        description: `Generated E-Pin ${code} from balance and activated ${beneficiary.name} (${beneficiary.inviteCode})`,
        createdAt: now
      });
    } catch (logErr) {
      console.warn('Failed to log epin_generation in IncomeLog:', logErr.message);
    }

    await user.save();

    // Activate beneficiary
    // If beneficiary is self, reuse the updated user instance
    if (beneficiary._id.toString() === user._id.toString()) {
      beneficiary = user;
    }

    beneficiary.isActivated = true;
    beneficiary.activationPackage = packageId;
    beneficiary.activatedAt = now;
    beneficiary.incomeExpiryDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    beneficiary.lastDailyCredit = null;

    // Distribute multi-level referral income
    await distributeIncome(beneficiary);
    await beneficiary.save();

    return res.status(200).json({
      message: `Successfully activated ${beneficiary.name} (${beneficiary.inviteCode})!`,
      epin: epin.code,
      beneficiary: {
        id: beneficiary._id,
        name: beneficiary.name,
        inviteCode: beneficiary.inviteCode,
        isActivated: beneficiary.isActivated
      },
      balance: user.balance
    });
  } catch (err) {
    console.error('Generate and activate error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
