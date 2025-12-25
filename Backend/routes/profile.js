const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, (req, res) => {
  // auth middleware already attaches req.user (which is the User doc or object)
  // But if auth middleware fetches user from DB, we can just return it.
  // We'll assume req.user is populated. If not, fetch it.
  // Typically auth middleware attaches the user doc.
  // Check middleware/auth.js later? Assuming it does.
  // Safely handling:
  const user = req.user;
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Strip sensitive
  const userObj = user.toObject ? user.toObject() : user;
  const { password, activationPin, ...userWithoutSensitive } = userObj;

  res.json({ user: userWithoutSensitive });
});

function normalizeIdValue(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

async function checkUnique(field, value, currentUserId) {
  const v = normalizeIdValue(value);
  if (!v) return null;

  // Find any user with this field value, excluding current user
  const clash = await User.findOne({
    [field]: v,
    id: { $ne: currentUserId }
  });

  if (clash) {
    return `${field} already used by another user.`;
  }
  return null;
}

router.put('/', auth, async (req, res) => {
  try {
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

    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Uniqueness checks
    const panErr = await checkUnique('panNo', req.body.panNo, user.id);
    if (panErr) return res.status(409).json({ message: panErr });

    const aadhaarErr = await checkUnique('aadhaarNo', req.body.aadhaarNo, user.id);
    if (aadhaarErr) return res.status(409).json({ message: aadhaarErr });

    const upiErr = await checkUnique('upiId', req.body.upiId, user.id);
    if (upiErr) return res.status(409).json({ message: upiErr });

    // bankDetails.accountNo uniqueness
    const nextBankAccountNo = normalizeIdValue(req.body?.bankDetails?.accountNo);
    if (nextBankAccountNo) {
      const clash = await User.findOne({
        'bankDetails.accountNo': nextBankAccountNo,
        id: { $ne: user.id }
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
    const { password, ...userWithoutPassword } = userObj;
    res.json({ user: userWithoutPassword });

  } catch (err) {
    console.error('Profile update error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
