const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

const KYC_PATH = path.join(__dirname, '..', 'data', 'kyc.json');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function loadKyc() {
  if (!fs.existsSync(KYC_PATH)) return [];
  const raw = fs.readFileSync(KYC_PATH, 'utf-8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function saveKyc(records) {
  fs.writeFileSync(KYC_PATH, JSON.stringify(records, null, 2));
}

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

router.post('/', auth, uploadAny, (req, res) => {
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

    const records = loadKyc();
    const existingIdx = records.findIndex((r) => r.userId === req.user.id);

    const prev = existingIdx === -1 ? null : records[existingIdx];

    const record = {
      id: prev?.id || `KYC-${Date.now()}`,
      userId: req.user.id,
      uploadedAt: prev?.uploadedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: {
        profile: profile
          ? { fileName: profile.filename, filePath: `/uploads/${profile.filename}` }
          : prev?.documents?.profile || null,
        pan: pan
          ? { fileName: pan.filename, filePath: `/uploads/${pan.filename}` }
          : prev?.documents?.pan || null,
        aadhaar: aadhaar
          ? { fileName: aadhaar.filename, filePath: `/uploads/${aadhaar.filename}` }
          : prev?.documents?.aadhaar || null,
        bank: bank
          ? { fileName: bank.filename, filePath: `/uploads/${bank.filename}` }
          : prev?.documents?.bank || null,
        // keep legacy upload if used
        document: legacy
          ? { fileName: legacy.filename, filePath: `/uploads/${legacy.filename}` }
          : prev?.documents?.document || null,
      },
    };

    // If old schema exists (fileName/filePath), keep it too for existing clients
    if (legacy) {
      record.fileName = legacy.filename;
      record.filePath = `/uploads/${legacy.filename}`;
    } else if (prev?.fileName || prev?.filePath) {
      record.fileName = prev.fileName;
      record.filePath = prev.filePath;
    }

    if (existingIdx === -1) {
      records.push(record);
    } else {
      records[existingIdx] = record;
    }

    saveKyc(records);

    res.status(201).json({ kyc: record });
  } catch (err) {
    console.error('KYC upload error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, (req, res) => {
  const records = loadKyc();
  const record = records.find((r) => r.userId === req.user.id);
  if (!record) return res.status(404).json({ message: 'No KYC record found' });
  res.json({ kyc: record });
});

module.exports = router;
