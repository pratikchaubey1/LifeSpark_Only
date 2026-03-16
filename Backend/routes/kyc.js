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

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kyc_documents',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    public_id: (req, file) => {
      const safeField = String(file.fieldname || 'document').replace(/[^a-z0-9_-]/gi, '');
      return `${req.user._id}-${safeField}-${Date.now()}`;
    },
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB
});

const uploadFields = upload.fields([
  { name: 'aadhaar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);

// ============ CHECK DUPLICATE (real-time validation) ============
router.post('/check-duplicate', auth, async (req, res) => {
  try {
    const { field, value } = req.body;
    if (!field || !value) {
      return res.status(400).json({ message: 'Field and value are required' });
    }

    const allowed = ['panNo', 'aadhaarNo', 'email', 'phone'];
    if (!allowed.includes(field)) {
      return res.status(400).json({ message: 'Invalid field' });
    }

    const trimmed = value.trim();
    if (!trimmed) return res.json({ duplicate: false });

    // Check if another user's KYC already has this value
    const existing = await Kyc.findOne({
      [field]: trimmed,
      userId: { $ne: req.user._id.toString() }
    });

    return res.json({ duplicate: !!existing });
  } catch (err) {
    console.error('KYC duplicate check error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ SUBMIT KYC (text + images in one request) ============
router.post('/', auth, (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Max limit is 1MB per image.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Cloudinary/Multer Error:', err);
      return res.status(500).json({ message: 'Cloudinary upload failed. Check your credentials.' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const files = req.files || {};
    const getFile = (field) => {
      const arr = files[field];
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    };

    const { panNo, aadhaarNo, email, phone, address, state, nominee } = req.body;

    // Validate required text fields
    if (!panNo || !aadhaarNo || !email || !phone || !address || !state || !nominee) {
      return res.status(400).json({ message: 'All text fields are required (PAN, Aadhaar, Email, Phone, Address, State, Nominee)' });
    }

    const userId = req.user._id.toString();

    // Duplicate checks
    const dupChecks = [
      { field: 'panNo', value: panNo.trim(), label: 'PAN Number' },
      { field: 'aadhaarNo', value: aadhaarNo.trim(), label: 'Aadhaar Number' },
      { field: 'email', value: email.trim(), label: 'Email' },
      { field: 'phone', value: phone.trim(), label: 'Phone Number' },
    ];

    for (const check of dupChecks) {
      if (check.value) {
        const dup = await Kyc.findOne({
          [check.field]: check.value,
          userId: { $ne: userId }
        });
        if (dup) {
          return res.status(409).json({
            message: `${check.label} "${check.value}" is already used by another user. Please provide a different one.`,
            duplicateField: check.field
          });
        }
      }
    }

    // Find existing or create new
    let record = await Kyc.findOne({ userId });

    if (!record) {
      record = new Kyc({ userId, documents: {} });
    }

    // Update text fields
    record.panNo = panNo.trim();
    record.aadhaarNo = aadhaarNo.trim();
    record.email = email.trim();
    record.phone = phone.trim();
    record.address = address.trim();
    record.state = state.trim();
    record.nominee = nominee.trim();
    record.status = 'pending';
    record.submittedAt = Date.now();
    record.remarks = '';

    // Update image files (only if new ones uploaded)
    const aadhaarFile = getFile('aadhaar');
    const panFile = getFile('pan');
    const selfieFile = getFile('selfie');

    if (aadhaarFile) record.documents.aadhaar = aadhaarFile.path;
    if (panFile) record.documents.pan = panFile.path;
    if (selfieFile) record.documents.selfie = selfieFile.path;

    // For new submissions, require all 3 images
    if (!record.documents.aadhaar || !record.documents.pan || !record.documents.selfie) {
      return res.status(400).json({ message: 'All 3 images are required: Aadhaar, PAN, and Selfie' });
    }

    await record.save();

    res.status(201).json({ kyc: record });
  } catch (err) {
    console.error('KYC submit error details:', err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// ============ GET OWN KYC ============
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
