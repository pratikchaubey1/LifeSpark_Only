const mongoose = require('mongoose');

const KycDocSchema = new mongoose.Schema({
    fileName: String,
    filePath: String
}, { _id: false });

const KycSchema = new mongoose.Schema({
    id: { type: String }, // Custom ID KYC-...
    userId: { type: String, required: true, unique: true },
    documents: {
        profile: KycDocSchema,
        pan: KycDocSchema,
        aadhaar: KycDocSchema,
        bank: KycDocSchema,
        document: KycDocSchema // legacy
    },
    status: { type: String, default: 'pending' }, // pending, approved, rejected
    uploadedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Kyc', KycSchema);
