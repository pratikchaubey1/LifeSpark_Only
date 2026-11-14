const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const BankUpdateRequest = require('../models/BankUpdateRequest');

const router = express.Router();

router.get('/', auth, (req, res) => {
  const { password, activationPin, ...userWithoutSensitive } = req.user;
  res.json({ user: userWithoutSensitive });
});

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

// First-time login bank details submission
router.post('/initial-bank-details', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If user already has bank details saved, block direct overwrite
    if (user.bankDetails && user.bankDetails.accountNo && user.bankDetails.accountNo.trim()) {
      return res.status(400).json({
        message: 'Bank details already submitted. Please request an update through Admin.'
      });
    }

    const { accountHolder, bankName, accountNo, ifsc, branchName } = req.body || {};

    if (!accountHolder || !accountHolder.trim()) {
      return res.status(400).json({ message: 'Account Holder name is required.' });
    }
    if (!bankName || !bankName.trim()) {
      return res.status(400).json({ message: 'Bank Name is required.' });
    }
    if (!accountNo || !/^\d{8,18}$/.test(String(accountNo).trim())) {
      return res.status(400).json({ message: 'Enter a valid Account Number (8-18 digits).' });
    }
    if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(ifsc).trim().toUpperCase())) {
      return res.status(400).json({ message: 'Enter a valid IFSC code (e.g. SBIN0123456).' });
    }
    if (!branchName || !branchName.trim()) {
      return res.status(400).json({ message: 'Branch Name is required.' });
    }

    const normAccountNo = normalizeIdValue(accountNo);
    const clash = await User.findOne({
      _id: { $ne: req.user._id },
      'bankDetails.accountNo': normAccountNo
    });
    if (clash) {
      return res.status(409).json({ message: 'This account number is already registered by another user.' });
    }

    user.bankDetails = {
      accountHolder: accountHolder.trim(),
      bankName: bankName.trim(),
      accountNo: normAccountNo,
      ifsc: ifsc.trim().toUpperCase(),
      branchName: branchName.trim()
    };
    user.bankDetailsSubmitted = true;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: 'Bank details saved successfully.',
      user: userObj
    });
  } catch (err) {
    console.error('Initial bank details error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Member submits a request to update bank details to Admin
router.post('/bank-update-request', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if there is already a pending request
    const existingPending = await BankUpdateRequest.findOne({
      userId: req.user._id.toString(),
      status: 'pending'
    });
    if (existingPending) {
      return res.status(400).json({
        message: 'You already have a bank details update request pending admin approval.'
      });
    }

    const { requestedBankDetails, reason } = req.body || {};
    if (!requestedBankDetails) {
      return res.status(400).json({ message: 'Requested bank details are required.' });
    }

    const { accountHolder, bankName, accountNo, ifsc, branchName } = requestedBankDetails;

    if (!accountHolder || !accountHolder.trim()) {
      return res.status(400).json({ message: 'Account Holder name is required.' });
    }
    if (!bankName || !bankName.trim()) {
      return res.status(400).json({ message: 'Bank Name is required.' });
    }
    if (!accountNo || !/^\d{8,18}$/.test(String(accountNo).trim())) {
      return res.status(400).json({ message: 'Enter a valid Account Number (8-18 digits).' });
    }
    if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(ifsc).trim().toUpperCase())) {
      return res.status(400).json({ message: 'Enter a valid IFSC code (e.g. SBIN0123456).' });
    }
    if (!branchName || !branchName.trim()) {
      return res.status(400).json({ message: 'Branch Name is required.' });
    }

    // Check uniqueness of requested account number
    const normAccountNo = normalizeIdValue(accountNo);
    const clash = await User.findOne({
      _id: { $ne: req.user._id },
      'bankDetails.accountNo': normAccountNo
    });
    if (clash) {
      return res.status(409).json({ message: 'This account number is already registered by another user.' });
    }

    const updateRequest = new BankUpdateRequest({
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      userInviteCode: user.inviteCode,
      userPhone: user.phone,
      currentBankDetails: {
        accountHolder: user.bankDetails?.accountHolder || '',
        bankName: user.bankDetails?.bankName || '',
        accountNo: user.bankDetails?.accountNo || '',
        ifsc: user.bankDetails?.ifsc || '',
        branchName: user.bankDetails?.branchName || ''
      },
      requestedBankDetails: {
        accountHolder: accountHolder.trim(),
        bankName: bankName.trim(),
        accountNo: normAccountNo,
        ifsc: ifsc.trim().toUpperCase(),
        branchName: branchName.trim()
      },
      reason: reason ? String(reason).trim() : 'Requested update of bank details',
      status: 'pending'
    });

    await updateRequest.save();

    return res.status(201).json({
      message: 'Bank update request submitted to admin for approval.',
      request: updateRequest
    });
  } catch (err) {
    console.error('Submit bank update request error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Member checks their latest bank update request
router.get('/bank-update-request', auth, async (req, res) => {
  try {
    const request = await BankUpdateRequest.findOne({
      userId: req.user._id.toString()
    }).sort({ createdAt: -1 });

    return res.json({ request });
  } catch (err) {
    console.error('Get bank update request error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    // Note: name and phone are locked from user editing as per policy.
    const allowedFields = [
      'address',
      'gender',
      'city',
      'state',
      'pinCode',
      'age',
      'panNo',
      'aadhaarNo',
      'nomineeName',
      'nomineeRelation',
      'upiNo',
      'upiId',
    ];

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Uniqueness checks
    const panErr = await assertUnique('panNo', req.body.panNo, req.user._id);
    if (panErr) return res.status(409).json({ message: panErr });

    const aadhaarErr = await assertUnique('aadhaarNo', req.body.aadhaarNo, req.user._id);
    if (aadhaarErr) return res.status(409).json({ message: aadhaarErr });

    const upiErr = await assertUnique('upiId', req.body.upiId, req.user._id);
    if (upiErr) return res.status(409).json({ message: upiErr });

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // If bankDetails is passed, only allow if not previously submitted
    if (req.body.bankDetails && typeof req.body.bankDetails === 'object') {
      const existingAccountNo = user.bankDetails?.accountNo?.trim();
      if (!existingAccountNo) {
        const nextBankAccountNo = normalizeIdValue(req.body.bankDetails.accountNo);
        if (nextBankAccountNo) {
          const clash = await User.findOne({
            _id: { $ne: req.user._id },
            'bankDetails.accountNo': nextBankAccountNo
          });
          if (clash) {
            return res.status(409).json({ message: 'bankDetails.accountNo already used by another user.' });
          }
        }
        user.bankDetails = {
          accountHolder: req.body.bankDetails.accountHolder ?? user.bankDetails?.accountHolder ?? '',
          bankName: req.body.bankDetails.bankName ?? user.bankDetails?.bankName ?? '',
          accountNo: nextBankAccountNo || (user.bankDetails?.accountNo ?? ''),
          ifsc: req.body.bankDetails.ifsc ?? user.bankDetails?.ifsc ?? '',
          branchName: req.body.bankDetails.branchName ?? user.bankDetails?.branchName ?? '',
        };
        if (user.bankDetails.accountNo) {
          user.bankDetailsSubmitted = true;
        }
      }
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ user: userObj });
  } catch (err) {
    console.error('Profile update error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
