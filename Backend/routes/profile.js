const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

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

router.put('/', auth, async (req, res) => {
  try {
    // Allow updating extended profile fields.
    // NOTE: we intentionally do NOT allow updating email/role via this endpoint.
    const allowedFields = [
      'name',
      'phone',
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

    // Uniqueness checks (\"kyc uploader every thing is unique\")
    const panErr = await assertUnique('panNo', req.body.panNo, req.user._id);
    if (panErr) return res.status(409).json({ message: panErr });

    const aadhaarErr = await assertUnique('aadhaarNo', req.body.aadhaarNo, req.user._id);
    if (aadhaarErr) return res.status(409).json({ message: aadhaarErr });

    const upiErr = await assertUnique('upiId', req.body.upiId, req.user._id);
    if (upiErr) return res.status(409).json({ message: upiErr });

    // bankDetails.accountNo uniqueness
    const nextBankAccountNo = normalizeIdValue(req.body?.bankDetails?.accountNo);
    if (nextBankAccountNo) {
      const clash = await User.findOne({
        _id: { $ne: req.user._id },
        'bankDetails.accountNo': nextBankAccountNo
      });
      if (clash) {
        return res.status(409).json({ message: 'bankDetails.accountNo already used by another user.' });
      }
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // bankDetails is an object
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
    res.json({ user: userObj });
  } catch (err) {
    console.error('Profile update error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
