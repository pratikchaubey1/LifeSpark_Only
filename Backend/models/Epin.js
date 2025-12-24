const mongoose = require('mongoose');

const epinSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    ownerUserId: { type: String, default: null }, // User ID who owns this pin
    used: { type: Boolean, default: false },
    usedByUserId: { type: String, default: null }, // User ID who used this pin
    usedAt: { type: Date, default: null },
    packageId: { type: String, default: null }, // e.g., 'Basic', 'Standard'
    transferredAt: { type: Date, default: null },
    transferredBy: { type: String, default: null } // User ID who transferred
}, {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'epins'
});

// Indexes for performance
epinSchema.index({ code: 1 });
epinSchema.index({ ownerUserId: 1 });
epinSchema.index({ used: 1 });

module.exports = mongoose.model('Epin', epinSchema);
