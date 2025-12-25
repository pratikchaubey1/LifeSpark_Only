const mongoose = require('mongoose');

const EpinSchema = new mongoose.Schema({
    // Keeping ownerUserId mainly, references User.id
    ownerUserId: { type: String, default: null },
    code: { type: String, required: true, unique: true },
    used: { type: Boolean, default: false },
    usedByUserId: { type: String, default: null },
    usedAt: { type: Date, default: null },
    packageId: { type: String, default: null },

    createdAt: { type: Date, default: Date.now },
    transferredAt: { type: Date, default: null },
    transferredBy: { type: String, default: null } // 'admin' or user id
});

module.exports = mongoose.model('Epin', EpinSchema);
