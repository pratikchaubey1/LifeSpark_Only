const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Epin = require('../models/Epin');
const EpinTransfer = require('../models/EpinTransfer');
const Kyc = require('../models/Kyc');
const Withdrawal = require('../models/Withdrawal');
const Project = require('../models/Project');
const Testimonial = require('../models/Testimonial');
const { getUsersAtLevel } = require('../utils/team');
const adminAuth = require('../middleware/adminAuth');
const { sendWelcomeEmail } = require('../utils/email');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_me';

async function generateUniqueInviteCode() {
  let code;
  let exists = true;
  while (exists) {
    code = 'LS' + Math.floor(100000 + Math.random() * 900000);
    exists = await User.findOne({ inviteCode: code });
  }
  return code;
}

// Admin login: supports both hardcoded admin and database users with franchise role
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check hardcoded admin credentials first
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token });
    }

    // Check database for franchise users
    const normalizedIdentifier = String(username).trim().toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier },
        { inviteCode: { $regex: new RegExp('^' + normalizedIdentifier + '$', 'i') } },
        { name: { $regex: new RegExp('^' + normalizedIdentifier + '$', 'i') } }
      ],
      role: 'franchise' // Only franchise users can access admin panel
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    let match = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = (password === user.password);
    }

    if (!match) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ role: 'admin', userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  } catch (err) {
    console.error('Admin login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to protect admin routes removed and moved to middleware/adminAuth.js

function normalizeIdValue(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

async function assertUnique(field, value, currentUserId) {
  const v = normalizeIdValue(value);
  if (!v) return null;

  const clash = await User.findOne({
    _id: { $ne: currentUserId },
    [field]: v
  });

  if (clash) {
    return `${field} already used by another user.`;
  }
  return null;
}

// Create a new member from admin panel
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { name, email, password, phone, address, sponsorId, sponsorName } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const normalizePhone = (v) => {
      const digits = String(v || '').replace(/\D/g, '');
      if (!digits) return '';
      return digits.length > 10 ? digits.slice(-10) : digits;
    };

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      const phoneRegex = new RegExp(normalizedPhone + '$');
      const existingPhone = await User.findOne({ phone: phoneRegex });
      if (existingPhone) {
        return res.status(409).json({ message: 'Phone number already registered' });
      }
    }

    const inviteCode = await generateUniqueInviteCode();

    // Clean sponsorId
    const cleanSponsorId = sponsorId ? String(sponsorId).trim() : 'WSE-COMPANY';

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password, // Plain text for admin-created users
      phone: normalizedPhone || (phone || ''),
      address: address || '',
      sponsorId: cleanSponsorId,
      sponsorName: sponsorName || 'WSE Company',
      inviteCode,
      role: 'member',
      roleAssignedBy: 'admin',
      roleAssignedAt: new Date(),
      roleAssignedAt: new Date(),
      balance: 0, // Initial balance is 0 until activation
      totalIncome: 0,
      directInviteIds: [],
    });

    await newUser.save();

    // Send welcome email with credentials
    try {
      await sendWelcomeEmail(newUser, password);
    } catch (emailError) {
      console.error('Failed to send welcome email to admin-created user:', emailError);
      // Don't block user creation if email fails
    }

    // Update Sponsor if exists
    if (cleanSponsorId && cleanSponsorId !== 'WSE-COMPANY') {
      const sponsorUser = await User.findOne({ inviteCode: cleanSponsorId });
      if (sponsorUser) {
        if (!Array.isArray(sponsorUser.directInviteIds)) {
          sponsorUser.directInviteIds = [];
        }
        sponsorUser.directInviteIds.push(newUser._id.toString());

        // NOTE: Referral income is now credited only when the user ACTIVATES their account

        await sponsorUser.save();
      }
    }

    const userObj = newUser.toObject();
    delete userObj.password;
    return res.status(201).json({ user: userObj });
  } catch (err) {
    console.error('Create user error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with invite stats for admin panel
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');

    const result = await Promise.all(users.map(async (user) => {
      const userInvitees = await User.find({ sponsorId: user.inviteCode }).select('_id name email phone balance inviteCode');

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        sponsorId: user.sponsorId || '',
        sponsorName: user.sponsorName || '',
        inviteCode: user.inviteCode,
        role: user.role || 'member',
        isActivated: !!user.isActivated,
        activationPackage: user.activationPackage || null,
        balance: user.balance || 0,
        totalIncome: user.totalIncome || 0,
        withdrawal: user.withdrawal || 0,
        freedomIncome: user.freedomIncome || 0,
        dailyBonusIncome: user.dailyBonusIncome || 0,
        rankRewardIncome: user.rankRewardIncome || 0,
        createdAt: user.createdAt || null,
        upiId: user.upiId || '',
        upiNo: user.upiNo || '',
        bankDetails: user.bankDetails || null,
        directInviteCount: userInvitees.length,
        invitees: userInvitees.map((inv) => ({
          id: inv._id.toString(),
          name: inv.name,
          email: inv.email,
          phone: inv.phone || '',
          balance: inv.balance || 0,
          inviteCode: inv.inviteCode,
        })),
      };
    }));

    res.json({ users: result });
  } catch (err) {
    console.error('Get users error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a user's payment details (admin-only)
router.put('/users/:id/payment-details', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const upiErr = await assertUnique('upiId', req.body.upiId, req.params.id);
    if (upiErr) return res.status(409).json({ message: upiErr });

    const nextBankAccountNo = normalizeIdValue(req.body?.bankDetails?.accountNo);
    if (nextBankAccountNo) {
      const clash = await User.findOne({
        _id: { $ne: req.params.id },
        'bankDetails.accountNo': nextBankAccountNo
      });
      if (clash) {
        return res.status(409).json({ message: 'bankDetails.accountNo already used by another user.' });
      }
    }

    if (req.body.upiId !== undefined) user.upiId = req.body.upiId;
    if (req.body.upiNo !== undefined) user.upiNo = req.body.upiNo;

    if (req.body.bankDetails && typeof req.body.bankDetails === 'object') {
      user.bankDetails = {
        ...(user.bankDetails || {}),
        accountHolder: req.body.bankDetails.accountHolder ?? user.bankDetails?.accountHolder ?? '',
        bankName: req.body.bankDetails.bankName ?? user.bankDetails?.bankName ?? '',
        accountNo: req.body.bankDetails.accountNo ?? user.bankDetails?.accountNo ?? '',
        ifsc: req.body.bankDetails.ifsc ?? user.bankDetails?.ifsc ?? '',
        branchName: req.body.bankDetails.branchName ?? user.bankDetails?.branchName ?? '',
      };
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    return res.json({ user: userObj });
  } catch (err) {
    console.error('Update payment details error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set role (admin-only)
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body || {};
    const allowed = new Set(['member', 'franchise']);
    if (!role || !allowed.has(String(role))) {
      return res.status(400).json({ message: 'Invalid role. Allowed: member, franchise' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    user.roleAssignedBy = 'admin';
    user.roleAssignedAt = new Date();
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    return res.json({ user: userObj });
  } catch (err) {
    console.error('Set role error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manual user activation (admin-only)
router.put('/users/:id/activate', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActivated = true;
    if (!user.activationPackage) user.activationPackage = 'AdminManual';
    if (!user.activatedAt) user.activatedAt = new Date();

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    return res.json({ user: userObj });
  } catch (err) {
    console.error('Activate user error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get KYC uploads for admin panel
router.get('/kyc', adminAuth, async (req, res) => {
  try {
    const kycs = await Kyc.find();

    const result = await Promise.all(kycs.map(async (k) => {
      const user = await User.findById(k.userId).select('_id name email phone role inviteCode');
      return {
        ...k.toObject(),
        user: user ? {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role || 'member',
          inviteCode: user.inviteCode || '',
        } : null,
      };
    }));

    res.json({ kycs: result });
  } catch (err) {
    console.error('Get KYC error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update KYC details (admin-only)
router.put('/kyc/:id', adminAuth, async (req, res) => {
  try {
    const kyc = await Kyc.findById(req.params.id);
    if (!kyc) {
      // Try finding by userId if not found by _id
      const kycByUser = await Kyc.findOne({ userId: req.params.id });
      if (!kycByUser) return res.status(404).json({ message: 'KYC record not found' });
      return updateKycRecord(kycByUser, req, res);
    }
    return updateKycRecord(kyc, req, res);
  } catch (err) {
    console.error('Update KYC error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

async function updateKycRecord(kyc, req, res) {
  const { panNo, aadhaarNo, aadhaarAddress, issuedState, status, remarks } = req.body || {};

  if (panNo !== undefined) kyc.panNo = panNo;
  if (aadhaarNo !== undefined) kyc.aadhaarNo = aadhaarNo;
  if (aadhaarAddress !== undefined) kyc.aadhaarAddress = aadhaarAddress;
  if (issuedState !== undefined) kyc.issuedState = issuedState;
  if (status !== undefined) kyc.status = status;
  if (remarks !== undefined) kyc.remarks = remarks;

  if (status === 'approved' || status === 'rejected') {
    kyc.reviewedAt = new Date();
    kyc.reviewedBy = 'admin';
  }

  await kyc.save();

  const user = await User.findById(kyc.userId).select('_id name email phone role inviteCode');
  return res.json({
    kyc: {
      ...kyc.toObject(),
      user: user ? {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'member',
        inviteCode: user.inviteCode || '',
      } : null,
    }
  });
}

// Withdrawal requests for admin
router.get('/withdrawals', adminAuth, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ requestedAt: -1 });

    const result = await Promise.all(withdrawals.map(async (w) => {
      const user = await User.findById(w.userId).select('_id name email phone role balance upiId upiNo bankDetails');
      return {
        ...w.toObject(),
        user: user ? {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role || 'member',
          balance: user.balance || 0,
          upiId: user.upiId || '',
          upiNo: user.upiNo || '',
          bankDetails: user.bankDetails || null,
        } : null,
      };
    }));

    return res.json({ withdrawals: result });
  } catch (err) {
    console.error('Get withdrawals error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve withdrawal
router.post('/withdrawals/:id/approve', adminAuth, async (req, res) => {
  try {
    const idParam = req.params.id;
    let withdrawal = await Withdrawal.findOne({ withdrawalId: idParam });

    if (!withdrawal && /^[0-9a-fA-F]{24}$/.test(idParam)) {
      withdrawal = await Withdrawal.findById(idParam);
    }

    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: `Cannot approve withdrawal in status: ${withdrawal.status}` });
    }

    const user = await User.findById(withdrawal.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const balance = Number(user.balance) || 0;
    const amount = Number(withdrawal.amount) || 0;

    if (amount <= 0) return res.status(400).json({ message: 'Invalid withdrawal amount' });
    if (amount > balance) {
      return res.status(400).json({ message: 'User has insufficient balance to approve this withdrawal.' });
    }

    // Deduct balance and track total withdrawal
    user.balance = balance - amount;
    user.withdrawal = (Number(user.withdrawal) || 0) + amount;
    await user.save();

    withdrawal.status = 'approved';
    withdrawal.approvedAt = new Date();
    withdrawal.approvedBy = 'admin';
    await withdrawal.save();

    return res.json({
      withdrawal,
      user: { id: user._id.toString(), balance: user.balance, withdrawal: user.withdrawal }
    });
  } catch (err) {
    console.error('Approve withdrawal error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject withdrawal
router.post('/withdrawals/:id/reject', adminAuth, async (req, res) => {
  try {
    const idParam = req.params.id;
    let withdrawal = await Withdrawal.findOne({ withdrawalId: idParam });

    if (!withdrawal && /^[0-9a-fA-F]{24}$/.test(idParam)) {
      withdrawal = await Withdrawal.findById(idParam);
    }

    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject withdrawal in status: ${withdrawal.status}` });
    }

    withdrawal.status = 'rejected';
    withdrawal.reviewedAt = new Date();
    withdrawal.reviewedBy = 'admin';
    await withdrawal.save();

    return res.json({ withdrawal });
  } catch (err) {
    console.error('Reject withdrawal error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple stats endpoint
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const siteName = process.env.SITE_NAME || 'Life Spark Associates';
    const activeMembers = await User.countDocuments();

    res.json({ siteName, activeMembers });
  } catch (err) {
    console.error('Get stats error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Projects management
router.get('/projects', adminAuth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.json({ projects });
  } catch (err) {
    console.error('Get projects error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/projects', adminAuth, async (req, res) => {
  try {
    const { title, desc, imageUrl, href } = req.body || {};

    if (!title || !desc) {
      return res.status(400).json({ message: 'title and desc are required' });
    }

    const project = new Project({
      title: String(title).trim(),
      description: String(desc).trim(),
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
      metadata: { href: href ? String(href).trim() : '' },
      status: 'active'
    });

    await project.save();

    return res.status(201).json({ project });
  } catch (err) {
    console.error('Create project error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Site content management: Team Members (placeholder)
router.get('/site/team-members', adminAuth, (req, res) => {
  res.json({ teamMembers: [] });
});

router.post('/site/team-members', adminAuth, (req, res) => {
  res.status(201).json({ member: {} });
});

// Site content management: Testimonials
router.get('/site/testimonials', adminAuth, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return res.json({ testimonials });
  } catch (err) {
    console.error('Get testimonials error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/site/testimonials', adminAuth, async (req, res) => {
  try {
    const { text, name, role } = req.body || {};

    if (!text || !name || !role) {
      return res.status(400).json({ message: 'text, name and role are required' });
    }

    const testimonial = new Testimonial({
      userName: String(name).trim(),
      userRole: String(role).trim(),
      content: String(text).trim(),
      isApproved: true,
      approvedBy: 'admin',
      approvedAt: new Date()
    });

    await testimonial.save();

    return res.status(201).json({ testimonial });
  } catch (err) {
    console.error('Create testimonial error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// E-Pin management for admin panel
router.get('/epins', adminAuth, async (req, res) => {
  try {
    const pool = await Epin.find({
      used: false,
      $or: [{ ownerUserId: null }, { ownerUserId: { $exists: false } }]
    });
    const codes = pool.map((e) => e.code);
    res.json({ epins: codes, available: codes.length });
  } catch (err) {
    console.error('Get epins error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transfer pins from admin pool to a member
router.post('/epins/transfer', adminAuth, async (req, res) => {
  try {
    const { toUserId, count } = req.body || {};
    const howMany = Math.min(Math.max(parseInt(count || 1, 10) || 1, 1), 10);

    if (!toUserId) {
      return res.status(400).json({ message: 'toUserId is required' });
    }

    // Try to find user by ID or invite code
    let target;
    const trimmedId = String(toUserId).trim();

    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(trimmedId)) {
      target = await User.findById(trimmedId);
    } else {
      // Otherwise, search by invite code or email
      target = await User.findOne({
        $or: [
          { inviteCode: trimmedId },
          { email: trimmedId.toLowerCase() }
        ]
      });
    }

    if (!target) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    const available = await Epin.find({
      used: false,
      $or: [{ ownerUserId: null }, { ownerUserId: { $exists: false } }]
    }).limit(howMany);

    if (available.length < howMany) {
      return res.status(400).json({ message: `Not enough available pins in pool. Available: ${available.length}` });
    }

    const now = new Date();
    const selectedCodes = [];

    for (const epin of available) {
      epin.ownerUserId = target._id.toString();
      epin.transferredAt = now;
      epin.transferredBy = 'admin';
      await epin.save();
      selectedCodes.push(epin.code);
    }

    const transferRecord = new EpinTransfer({
      transferId: `EPTR-${Date.now()}`,
      fromUserId: 'admin',
      fromUserName: 'Admin',
      toUserId: target._id.toString(),
      toUserName: target.name,
      codes: selectedCodes,
      count: selectedCodes.length,
      transferredAt: now,
      transferredBy: 'admin',
    });

    await transferRecord.save();

    return res.status(201).json({ transfer: transferRecord });
  } catch (err) {
    console.error('Transfer epins error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new E-Pins
router.post('/epins', adminAuth, async (req, res) => {
  try {
    const { count } = req.body || {};
    const howMany = Math.min(Math.max(parseInt(count || 1, 10) || 1, 1), 100);

    const existing = await Epin.find().select('code');
    const codesSet = new Set(existing.map((e) => e.code));
    const newEpins = [];

    function generateCode() {
      const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
      return `${part()}-${part()}-${part()}`;
    }

    while (newEpins.length < howMany) {
      const code = generateCode();
      if (!codesSet.has(code)) {
        codesSet.add(code);
        const epin = new Epin({
          code,
          ownerUserId: null,
          used: false,
        });
        await epin.save();
        newEpins.push(code);
      }
    }

    res.status(201).json({ epins: newEpins });
  } catch (err) {
    console.error('Create epins error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reward completions that need processing
router.get('/rewards/pending', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ 'rewardCompletions.status': 'pending' })
      .select('_id name email inviteCode rewardCompletions');

    const pendingRewards = [];
    users.forEach(u => {
      u.rewardCompletions.forEach(rc => {
        if (rc.status === 'pending') {
          pendingRewards.push({
            userId: u._id,
            name: u.name,
            email: u.email,
            inviteCode: u.inviteCode,
            level: rc.level,
            completedAt: rc.completedAt
          });
        }
      });
    });

    res.json({ pendingRewards });
  } catch (err) {
    console.error('Get pending rewards error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark reward as given
router.post('/rewards/:userId/:level/process', adminAuth, async (req, res) => {
  try {
    const { userId, level } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reward = user.rewardCompletions.find(rc => rc.level === parseInt(level));
    if (!reward) return res.status(404).json({ message: 'Reward completion not found' });

    reward.status = 'given';
    reward.processedAt = new Date();
    reward.processedBy = 'admin';

    await user.save();
    res.json({ message: 'Reward marked as given', user: { id: user._id, rewardCompletions: user.rewardCompletions } });
  } catch (err) {
    console.error('Process reward error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
