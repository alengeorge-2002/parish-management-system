const express = require('express');
const router = express.Router();
const ParishCouncil = require('../models/ParishCouncil');

// POST /api/parish-council/seats
router.post('/parish-council/seats', async (req, res) => {
  try {
    const { roleTitle, englishTitle, malayalamTitle, category, wardNumber, term } = req.body;
    const finalRoleTitle = roleTitle || englishTitle;
    if (!finalRoleTitle) {
      return res.status(400).json({ error: 'roleTitle is required' });
    }

    const count = await ParishCouncil.countDocuments();
    const newSeat = await ParishCouncil.create({
      roleTitle: finalRoleTitle,
      malayalamTitle: malayalamTitle || '',
      category: category || 'Ward Councillor',
      wardNumber: wardNumber ? parseInt(wardNumber, 10) : null,
      term: term || '2024 – 2026',
      status: 'vacant',
      memberId: null,
      occupantName: null,
      phone: null,
      display_order: count + 1
    });

    const seats = await ParishCouncil.find().sort({ display_order: 1 });
    res.status(201).json(seats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/parish-council/seats/:id/assign
router.put('/parish-council/seats/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId, term, occupantName, phone } = req.body;
    const seat = await ParishCouncil.findById(id);
    if (!seat) return res.status(404).json({ error: 'Seat not found' });

    seat.memberId = memberId || seat.memberId;
    if (occupantName) seat.occupantName = occupantName;
    if (phone) seat.phone = phone;
    if (term) seat.term = term;
    seat.status = 'filled';

    await seat.save();
    res.json(seat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/parish-council/seats/:id/vacate
router.put('/parish-council/seats/:id/vacate', async (req, res) => {
  try {
    const { id } = req.params;
    const seat = await ParishCouncil.findById(id);
    if (!seat) return res.status(404).json({ error: 'Seat not found' });

    seat.memberId = null;
    seat.occupantName = null;
    seat.phone = null;
    seat.status = 'vacant';

    await seat.save();
    res.json(seat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

