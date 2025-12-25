const express = require('express');
const Project = require('../models/Project');

const router = express.Router();

// Public: list projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    console.error('Projects fetch error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
