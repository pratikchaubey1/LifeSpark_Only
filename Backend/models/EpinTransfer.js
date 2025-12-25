const mongoose = require('mongoose');

const EpinTransferSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // Custom ID EPTR-...
    fromUserId: { type: String, default: null },
    toUserId: { type: String, required: true },
    toUserName: { type: String, default: '' },
    codes: [{ type: String }], // Array of Epin codes
    count: { type: Number, default: 0 },
    transferredAt: { type: Date, default: Date.now },
    transferredBy: { type: String, default: 'admin' }
});

module.exports = mongoose.model('EpinTransfer', EpinTransferSchema);
