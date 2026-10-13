const express = require('express');
const router = express.Router();
const ReligiousHouse = require('../models/ReligiousHouse');

// POST /api/religious-houses/:id/residents
router.post('/:id/residents', async (req, res) => {
  const { id } = req.params;
  const { fullName, name, religiousName, designation, phone, email, dob, feastDay, photo, gender } = req.body;

  const residentName = fullName || name || religiousName;
  if (!residentName) {
    return res.status(400).json({ error: 'fullName is required' });
  }

  try {
    const house = await ReligiousHouse.findById(id);
    if (!house) {
      return res.status(404).json({ error: 'Religious house not found' });
    }

    if (!Array.isArray(house.residents)) {
      house.residents = [];
    }

    const newResident = {
      fullName: residentName.trim(),
      religiousName: (religiousName || residentName).trim(),
      designation: (designation || 'Member').trim(),
      phone: (phone || '').trim(),
      email: (email || '').trim(),
      dob: dob ? new Date(dob) : undefined,
      feastDay: (feastDay || '').trim(),
      photo: photo || null,
      gender: gender || 'F',
    };

    house.residents.push(newResident);
    house.resident_count = house.residents.length;
    await house.save();

    res.status(200).json(house);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/religious-houses/:id/residents/:residentId
router.delete('/:id/residents/:residentId', async (req, res) => {
  const { id, residentId } = req.params;

  try {
    const house = await ReligiousHouse.findById(id);
    if (!house) {
      return res.status(404).json({ error: 'Religious house not found' });
    }

    if (Array.isArray(house.residents)) {
      house.residents = house.residents.filter((r) => {
        const rId = String(r._id || r.id || r.fullName || r.name);
        return rId !== String(residentId);
      });
      house.resident_count = house.residents.length;
      await house.save();
    }

    res.status(200).json(house);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
