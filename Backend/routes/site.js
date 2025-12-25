const express = require('express');
const Testimonial = require('../models/Testimonial');

const router = express.Router();

// Public: team members shown on landing page
// Note: teamMembers.json doesn't have a model yet, keeping as placeholder
router.get('/team-members', (req, res) => {
  // This can be implemented later if needed
  res.json({ teamMembers: [] });
});

// Public: testimonials shown on landing page
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json({ testimonials });
  } catch (err) {
    console.error('Get testimonials error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
