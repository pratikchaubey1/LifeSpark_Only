const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Kyc = require('../models/Kyc');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeField = String(file.fieldname || 'document').replace(/[^a-z0-9_-]/gi, '');
    cb(null, `${req.user._id}-${safeField}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Supports multiple docs:
// - profile (image)
// - pan (image)
// - aadhaar (image)
// - bank (image)
// Backwards-compatible: also supports "document" single upload.
const uploadAny = upload.fields([
  { name: 'profile', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'aadhaar', maxCount: 1 },
  { name: 'bank', maxCount: 1 },
  { name: 'document', maxCount: 1 },
]);

router.post('/', auth, uploadAny, async (req, res) => {
  try {
    const files = req.files || {};

    const getFile = (field) => {
      const arr = files[field];
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    };

    const profile = getFile('profile');
    const pan = getFile('pan');
    const aadhaar = getFile('aadhaar');
    const bank = getFile('bank');
    const legacy = getFile('document');

    if (!profile && !pan && !aadhaar && !bank && !legacy) {
      return res.status(400).json({
        message:
          'At least one file is required: profile, pan, aadhaar, bank (or legacy field: document)',
      });
    }

    let record = await Kyc.findOne({ userId: req.user._id.toString() });

    if (!record) {
      record = new Kyc({
        userId: req.user._id.toString(),
        documents: {},
        status: 'pending'
      });
    }

    // Update documents
    if (profile) {
      record.documents.profile = `/uploads/${profile.filename}`;
    }
    if (pan) {
      record.documents.pan = `/uploads/${pan.filename}`;
    }
    if (aadhaar) {
      record.documents.aadhaar = `/uploads/${aadhaar.filename}`;
    }
    if (bank) {
      record.documents.bank = `/uploads/${bank.filename}`;
    }
    if (legacy) {
      record.documents.document = `/uploads/${legacy.filename}`;
    }

    await record.save();

    res.status(201).json({ kyc: record });
  } catch (err) {
    console.error('KYC upload error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const record = await Kyc.findOne({ userId: req.user._id.toString() });
    if (!record) return res.status(404).json({ message: 'No KYC record found' });
    res.json({ kyc: record });
  } catch (err) {
    console.error('Get KYC error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
