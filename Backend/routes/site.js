const express = require('express');
const TeamMember = require('../models/TeamMember');
const Testimonial = require('../models/Testimonial');

const router = express.Router();

// Public: team members shown on landing page
router.get('/team-members', async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().sort({ createdAt: -1 });
    res.json({ teamMembers });
  } catch (err) {
    console.error('Team members fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: testimonials shown on landing page
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ testimonials });
  } catch (err) {
    console.error('Testimonials fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
