const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },

    // Text fields
    panNo: { type: String, default: '' },
    aadhaarNo: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    state: { type: String, default: '' },
    nominee: { type: String, default: '' },

    // Document images
    documents: {
        aadhaar: { type: String, default: '' },
        pan: { type: String, default: '' },
        selfie: { type: String, default: '' }
    },

    // Status
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: null },
    remarks: { type: String, default: '' }
}, {
    timestamps: true,
    collection: 'kyc'
});

// Indexes
kycSchema.index({ status: 1 });
kycSchema.index({ panNo: 1 });
kycSchema.index({ aadhaarNo: 1 });
kycSchema.index({ email: 1 });
kycSchema.index({ phone: 1 });

module.exports = mongoose.model('Kyc', kycSchema);
