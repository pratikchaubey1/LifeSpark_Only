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
    const { epin, packageId, targetUserId } = req.body || {};

    if (!epin || !packageId) {
      return res.status(400).json({ message: 'E-Pin and package are required' });
    }

    const spender = await User.findById(req.user._id);
    if (!spender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine beneficiary (target user or self)
    let beneficiary;
    if (targetUserId) {
      // Try to find by ID or Invite Code
      // Check if valid ObjectId
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(targetUserId)) {
        beneficiary = await User.findById(targetUserId);
      }

      // If not found by ID, try invite code
      if (!beneficiary) {
        beneficiary = await User.findOne({ inviteCode: targetUserId });
      }

      if (!beneficiary) {
        return res.status(404).json({ message: 'Target user not found (invalid ID or Invite Code)' });
      }
    } else {
      beneficiary = spender;
    }

    if (beneficiary.isActivated) {
      return res.status(400).json({ message: `User ${beneficiary.name} (${beneficiary.inviteCode}) is already activated.` });
    }

    // Check E-Pin ownership (must be owned by SPENDER)
    const epinObj = await Epin.findOne({
      code: String(epin).trim(),
      used: false,
      $or: [
        { ownerUserId: null }, // System pool
        { ownerUserId: spender._id.toString() } // Owned by logged-in user
      ]
    });

    if (!epinObj) {
      return res.status(400).json({ message: 'Invalid or E-Pin not found in your wallet.' });
    }

    // Mark E-Pin as used
    epinObj.used = true;
    epinObj.usedByUserId = beneficiary._id.toString(); // Used for beneficiary
    epinObj.usedAt = new Date();
    epinObj.packageId = packageId;
    await epinObj.save();

    // Activate beneficiary
    beneficiary.isActivated = true;
    beneficiary.activationPackage = packageId;
    beneficiary.activatedAt = new Date();
    beneficiary.lastDailyCredit = null;

    // ---------------- INCOME DISTRIBUTION LOGIC ----------------
    // 1. Credit Joining Bonus to Beneficiary (₹50)
    const JOINING_BONUS = 50;
    beneficiary.balance = (Number(beneficiary.balance) || 0) + JOINING_BONUS;
    beneficiary.totalIncome = (Number(beneficiary.totalIncome) || 0) + JOINING_BONUS;

    // 2. Credit Referral Income to Sponsor
    if (beneficiary.sponsorId) {
      const sponsorUser = await User.findOne({ inviteCode: beneficiary.sponsorId });
      if (sponsorUser) {
        // BONUS LOGIC: ₹56 (50+6) if sponsor joined < 30 days ago, else ₹6
        let reward = 6;
        if (sponsorUser.createdAt) {
          const joinDate = new Date(sponsorUser.createdAt);
          const now = new Date();
          const diffTime = Math.abs(now - joinDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 30) {
            reward = 56;
          }
        }

        sponsorUser.balance = (Number(sponsorUser.balance) || 0) + reward;
        sponsorUser.totalIncome = (Number(sponsorUser.totalIncome) || 0) + reward;

        await sponsorUser.save();
      }
    }
    // -----------------------------------------------------------

    await beneficiary.save();

    const { password, ...safeUser } = beneficiary.toObject();

    res.json({
      message: `Successfully activated user: ${beneficiary.name} (${beneficiary.inviteCode})`,
      user: safeUser,
    });
  } catch (err) {
    console.error('Activate ID error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- DIRECT TEAM -------------------- */
router.get('/direct-team', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch details of all users in directInviteIds
    const team = await User.find({
      _id: { $in: user.directInviteIds || [] }
    }).select('name email phone isActivated createdAt role inviteCode');

    const mappedTeam = team.map(u => ({
      userId: u._id,
      name: u.name,
      email: u.email,
      inviteCode: u.inviteCode,
      status: u.isActivated ? 'Active' : 'Inactive',
      joined: u.createdAt ? u.createdAt.toISOString().slice(0, 10) : 'N/A'
    }));

    res.json(mappedTeam);
  } catch (err) {
    console.error('Direct Team Fetch Error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
