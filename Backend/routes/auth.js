const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/email');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_me';

function generateInviteCode() {
  return 'LS' + Math.floor(100000 + Math.random() * 900000); // e.g. LS123456
}

async function generateUniqueInviteCode() {
  let code;
  let exists = true;
  while (exists) {
    code = generateInviteCode();
    exists = await User.findOne({ inviteCode: code });
  }
  return code;
}

// Public helper: lookup sponsor by invite code (for auto-fill sponsor name on register page)
router.get('/sponsor/:code', async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase(); // Normalize to uppercase
    console.log('🔍 Sponsor lookup request for code:', code);

    if (!code) {
      console.log('❌ Sponsor lookup failed: No code provided');
      return res.status(400).json({ message: 'Invite code is required' });
    }

    const sponsorUser = await User.findOne({
      inviteCode: { $regex: new RegExp(`^${code}$`, 'i') } // Case-insensitive search
    });

    if (!sponsorUser) {
      console.log('❌ Sponsor not found for code:', code);
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    console.log('✅ Sponsor found:', sponsorUser.name, '(', sponsorUser.inviteCode, ')');
    return res.json({
      sponsor: {
        id: sponsorUser._id,
        name: sponsorUser.name,
        inviteCode: sponsorUser.inviteCode
      }
    });
  } catch (err) {
    console.error('❌ Sponsor lookup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
      name,
      email,
      password,
      sponsorId, // invite code of the sponsor / upline
      sponsorName, // ignored if sponsorId matches an existing user (we set sponsor name automatically)
      phone,
      address,
    } = req.body;

    if (!name || !email || !password) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // For the first-ever user allow signup without sponsor.
    // For all others sponsorId must be a valid invite code.
    console.log('Checking user count...');
    const userCount = await User.countDocuments();
    const hasExistingUsers = userCount > 0;
    console.log(`User count: ${userCount}, hasExistingUsers: ${hasExistingUsers}`);

    if (hasExistingUsers && !sponsorId) {
      console.log('Validation failed: Sponsor ID required for non-first user');
      return res.status(400).json({ message: 'Invite code (Sponsor ID) is required' });
    }

    // Find sponsor
    let sponsorUser = null;
    if (hasExistingUsers) {
      console.log('Looking up sponsor with code:', sponsorId);
      const code = String(sponsorId || '').trim();
      // Only search by inviteCode (not _id, as that would cause CastError)
      sponsorUser = await User.findOne({ inviteCode: code });
      console.log('Sponsor found:', sponsorUser ? `Yes (${sponsorUser.name})` : 'No');
      if (!sponsorUser) {
        console.log('Validation failed: Invalid invite code');
        return res.status(400).json({ message: 'Invalid invite code' });
      }
    }

    // Uniqueness: email (case-insensitive)
    console.log('Checking email uniqueness...');
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      console.log('Validation failed: Email already exists');
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Uniqueness: phone (digits-only, last 10 digits) if provided
    const normalizePhone = (v) => {
      const digits = String(v || '').replace(/\D/g, '');
      if (!digits) return '';
      return digits.length > 10 ? digits.slice(-10) : digits;
    };

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      console.log('Checking phone uniqueness...');
      const phoneRegex = new RegExp(normalizedPhone + '$');
      const existingPhone = await User.findOne({ phone: phoneRegex });
      if (existingPhone) {
        console.log('Validation failed: Phone already exists');
        return res.status(409).json({ message: 'Phone number already registered' });
      }
    }

    console.log('Hashing password...');
    const hashed = await bcrypt.hash(password, 10);

    console.log('Generating unique invite code...');
    const inviteCode = await generateUniqueInviteCode();
    console.log('Generated invite code:', inviteCode);

    console.log('Creating new user object...');
    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashed,
      phone: normalizedPhone || (phone || ''),
      address: address || '',
      // Always store sponsorId as the sponsor's inviteCode for consistency
      sponsorId: sponsorUser ? sponsorUser.inviteCode : (sponsorId || ''),
      // Sponsor name is always derived from sponsorUser (if any)
      sponsorName: sponsorUser ? sponsorUser.name : (sponsorName || ''),
      inviteCode,
      // Roles: member (default), franchise
      role: 'member',
      roleAssignedBy: null,
      roleAssignedAt: null,
      // Activation status is controlled by separate E-Pin store (not per-member pin)
      isActivated: false,
      activationPackage: null,
      activatedAt: null,
      activatedAt: null,
      balance: 0, // Initial balance is 0 until activation
      totalIncome: 0,
      withdrawal: 0,
      freedomIncome: 0,
      dailyBonusIncome: 0,
      rankRewardIncome: 0,
      lastDailyCredit: new Date().toISOString().slice(0, 10),
      // Optional extended profile fields
      gender: '',
      city: '',
      state: '',
      pinCode: '',
      age: '',
      panNo: '',
      aadhaarNo: '',
      nomineeName: '',
      nomineeRelation: '',
      upiNo: '',
      upiId: '',
      bankDetails: {
        accountHolder: '',
        bankName: '',
        accountNo: '',
        ifsc: '',
        branchName: '',
      },
      directInviteIds: [], // Initialize empty array
    });

    console.log('Saving new user to database...');
    await newUser.save();
    console.log('User saved successfully with ID:', newUser._id);

    // Send Welcome Email (Non-blocking or catch error to not fail registration)
    try {
      await sendWelcomeEmail(newUser, password);
    } catch (mailErr) {
      console.error('Failed to send welcome email:', mailErr);
    }

    // Track who invited this user (direct downline) on sponsor record
    if (sponsorUser) {
      console.log('Updating sponsor record...');
      if (!Array.isArray(sponsorUser.directInviteIds)) {
        sponsorUser.directInviteIds = [];
      }
      sponsorUser.directInviteIds.push(newUser._id.toString());

      // NOTE: Referral income is now credited only when the user ACTIVATES their account (in dashboard.js)

      await sponsorUser.save();
      console.log('Sponsor record updated successfully');
    }

    console.log('Generating JWT token...');
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = newUser.toObject();
    delete userObj.password;

    console.log('Registration successful!');
    console.log('=== END REGISTRATION ===');
    res.status(201).json({ user: userObj, token });
  } catch (err) {
    console.error('❌ REGISTRATION ERROR:', err);
    console.error('Error stack:', err.stack);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth routes are working' });
});

router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, username, inviteCode, password } = req.body;
    const loginIdentifier = inviteCode || username || email;

    if (!loginIdentifier || !password) {
      console.log('Login failed: Missing credentials');
      return res.status(400).json({ message: 'Invite Code / Email and password are required' });
    }

    const normalizedIdentifier = String(loginIdentifier).trim();
    console.log('Login identifier:', normalizedIdentifier);

    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier.toLowerCase() },
        { inviteCode: { $regex: new RegExp('^' + normalizedIdentifier + '$', 'i') } },
        { name: { $regex: new RegExp('^' + normalizedIdentifier + '$', 'i') } }
      ]
    });

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Handle plain text passwords for legacy users
    let match = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      match = await bcrypt.compare(password, user.password);
    } else {
      // Fallback for plain text passwords (if any exist)
      match = (password === user.password);
    }

    if (!match) {
      console.log('Login failed: Password mismatch for user', user._id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login success for user:', user._id);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ user: userObj, token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
