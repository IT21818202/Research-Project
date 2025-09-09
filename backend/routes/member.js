// routes/member.js
const express = require('express');
const router = express.Router();
const Member = require('../models/member');

// Get all members
router.get('/', async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new member
router.post('/', async (req, res) => {
  try {
    const { name, itno, phone, gender, access } = req.body;
    const validAccess = ['admin', 'manager', 'user'];
    if (!validAccess.includes(access)) {
      return res.status(400).json({ message: 'Invalid access level' });
    }

    const newMember = new Member({ name, itno, phone, gender, access });
    const saved = await newMember.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a member
router.put('/:id', async (req, res) => {
  try {
    const { name, itno, phone, gender, access } = req.body;
    const updated = await Member.findByIdAndUpdate(
      req.params.id,
      { name, itno, phone, gender, access },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a member
router.delete('/:id', async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
