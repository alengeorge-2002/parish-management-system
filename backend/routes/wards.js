const express = require('express');
const router = express.Router();
const Ward = require('../models/Ward');

router.post('/:id/units', async (req, res) => {
  try {
    const ward = await Ward.findById(req.params.id);
    if (!ward) return res.status(404).json({ message: 'Ward not found' });
    const unitData = {
      unitNumber: req.body.unitNumber || req.body.unit_number,
      unit_number: req.body.unitNumber || req.body.unit_number,
      unitName: req.body.unitName || '',
      representativeName: req.body.representativeName || '',
      representativePhone: req.body.representativePhone || ''
    };
    if (!Array.isArray(ward.units)) {
      ward.units = [];
    }
    ward.units.push(unitData);
    ward.total_units = ward.units.length;
    await ward.save();
    return res.status(201).json(ward);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
