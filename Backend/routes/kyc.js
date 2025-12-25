const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Kyc = require('../models/Kyc');
const auth = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Ensure unique filenames for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeField = String(file.fieldname || 'document').replace(/[^a-z0-9_-]/gi, '');
    cb(null, `${req.user.id}-${safeField}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

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

    // Find existing or new
    let kyc = await Kyc.findOne({ userId: req.user.id });

    if (!kyc) {
      kyc = new Kyc({
        id: `KYC-${Date.now()}`,
        userId: req.user.id,
        uploadedAt: new Date(),
        documents: {}
      });
    }

    // Update documents if provided
    if (profile) kyc.documents.profile = { fileName: profile.filename, filePath: `/uploads/${profile.filename}` };
    if (pan) kyc.documents.pan = { fileName: pan.filename, filePath: `/uploads/${pan.filename}` };
    if (aadhaar) kyc.documents.aadhaar = { fileName: aadhaar.filename, filePath: `/uploads/${aadhaar.filename}` };
    if (bank) kyc.documents.bank = { fileName: bank.filename, filePath: `/uploads/${bank.filename}` };
    if (legacy) kyc.documents.document = { fileName: legacy.filename, filePath: `/uploads/${legacy.filename}` };

    kyc.updatedAt = new Date();
    await kyc.save();

    res.status(201).json({ kyc });
  } catch (err) {
    console.error('KYC upload error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const kyc = await Kyc.findOne({ userId: req.user.id });
    if (!kyc) return res.status(404).json({ message: 'No KYC record found' });
    res.json({ kyc });
  } catch (err) {
    console.error('KYC fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
