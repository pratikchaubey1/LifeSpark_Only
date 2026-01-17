const mongoose = require('mongoose');

const autopoolHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    inviteCode: { type: String, required: true },
    action: { type: String, enum: ['approved', 'rejected'], required: true },
    timestamp: { type: Date, default: Date.now }
}, {
    collection: 'autopool_history'
});

module.exports = mongoose.model('AutopoolHistory', autopoolHistorySchema);
