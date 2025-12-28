const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    documents: {
        aadhaarFront: { type: String, default: '' },
        aadhaarBack: { type: String, default: '' },
        panCard: { type: String, default: '' },
        photo: { type: String, default: '' }
    },
    panNo: { type: String, default: '' },
    aadhaarNo: { type: String, default: '' },
    aadhaarAddress: { type: String, default: '' },
    issuedState: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: null },
    remarks: { type: String, default: '' }
}, {
    timestamps: true,
    collection: 'kyc'
});

// Indexes for performance
kycSchema.index({ userId: 1 });
kycSchema.index({ status: 1 });

module.exports = mongoose.model('Kyc', kycSchema);
