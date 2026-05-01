const mongoose = require('mongoose');

const upgradeHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, default: '' },
    userInviteCode: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['approved', 'rejected'], required: true },
    adminActionAt: { type: Date, default: Date.now },
    description: { type: String, default: '' }
}, { timestamps: true });

upgradeHistorySchema.index({ userInviteCode: 1 });
upgradeHistorySchema.index({ adminActionAt: -1 });

module.exports = mongoose.model('UpgradeHistory', upgradeHistorySchema);
