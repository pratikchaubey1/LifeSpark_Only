const mongoose = require('mongoose');

const epinTransferSchema = new mongoose.Schema({
    transferId: { type: String, required: true, unique: true }, // e.g., 'EPTR-1234567890'
    fromUserId: { type: String, required: true },
    fromUserName: { type: String, required: true },
    toUserId: { type: String, required: true },
    toUserName: { type: String, required: true },
    codes: [{ type: String }], // Array of E-Pin codes transferred
    count: { type: Number, required: true },
    transferredAt: { type: Date, required: true },
    transferredBy: { type: String, required: true }
}, {
    timestamps: true,
    collection: 'epin_transfers'
});

// Indexes for performance
epinTransferSchema.index({ fromUserId: 1 });
epinTransferSchema.index({ toUserId: 1 });
epinTransferSchema.index({ transferredAt: -1 });

module.exports = mongoose.model('EpinTransfer', epinTransferSchema);
