const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // TST-...
    text: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
