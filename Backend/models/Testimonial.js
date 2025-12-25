const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    userId: { type: String, default: null },
    userName: { type: String, required: true },
    userRole: { type: String, default: '' },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    imageUrl: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null }
}, {
    timestamps: true,
    collection: 'testimonials'
});

// Indexes for performance
testimonialSchema.index({ isApproved: 1 });
testimonialSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
