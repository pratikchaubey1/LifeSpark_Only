const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  const raw = fs.readFileSync(USERS_PATH, 'utf-8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

router.get('/', auth, (req, res) => {
  const { password, activationPin, ...userWithoutSensitive } = req.user;
  res.json({ user: userWithoutSensitive });
});

function normalizeIdValue(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

function assertUnique(users, field, value, currentUserId) {
  const v = normalizeIdValue(value);
  if (!v) return null;

  const clash = users.find((u) => u.id !== currentUserId && normalizeIdValue(u[field]) === v);
  if (clash) {
    return `${field} already used by another user.`;
  }
  return null;
}

router.put('/', auth, (req, res) => {
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

  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });

  // Uniqueness checks ("kyc uploader every thing is unique")
  const panErr = assertUnique(users, 'panNo', req.body.panNo, req.user.id);
  if (panErr) return res.status(409).json({ message: panErr });

  const aadhaarErr = assertUnique(users, 'aadhaarNo', req.body.aadhaarNo, req.user.id);
  if (aadhaarErr) return res.status(409).json({ message: aadhaarErr });

  const upiErr = assertUnique(users, 'upiId', req.body.upiId, req.user.id);
  if (upiErr) return res.status(409).json({ message: upiErr });

  // bankDetails.accountNo uniqueness
  const nextBankAccountNo = normalizeIdValue(req.body?.bankDetails?.accountNo);
  if (nextBankAccountNo) {
    const clash = users.find(
      (u) =>
        u.id !== req.user.id &&
        normalizeIdValue(u?.bankDetails?.accountNo) === nextBankAccountNo
    );
    if (clash) {
      return res.status(409).json({ message: 'bankDetails.accountNo already used by another user.' });
    }
  }

  const updated = { ...users[idx] };

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updated[field] = req.body[field];
    }
  });

  // bankDetails is an object
  if (req.body.bankDetails && typeof req.body.bankDetails === 'object') {
    updated.bankDetails = {
      ...(updated.bankDetails || {}),
      accountHolder: req.body.bankDetails.accountHolder ?? updated.bankDetails?.accountHolder ?? '',
      bankName: req.body.bankDetails.bankName ?? updated.bankDetails?.bankName ?? '',
      accountNo: req.body.bankDetails.accountNo ?? updated.bankDetails?.accountNo ?? '',
      ifsc: req.body.bankDetails.ifsc ?? updated.bankDetails?.ifsc ?? '',
      branchName: req.body.bankDetails.branchName ?? updated.bankDetails?.branchName ?? '',
    };
  }

  users[idx] = updated;
  saveUsers(users);

  const { password, ...userWithoutPassword } = updated;
  res.json({ user: userWithoutPassword });
});

module.exports = router;
