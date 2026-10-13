const express = require('express');
const router = express.Router();
const Ministry = require('../models/Ministry');
const Parishioner = require('../models/Parishioner');

// POST /api/ministries/:id/members
router.post('/ministries/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId, role } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: 'memberId is required' });
    }

    const ministry = await Ministry.findById(id);
    if (!ministry) {
      return res.status(404).json({ error: 'Ministry not found' });
    }

    const member = await Parishioner.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Parishioner member not found' });
    }

    const fullName = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.name;
    const phone = member.phone || member.phoneNumber;

    ministry.members.push({
      memberId: member._id,
      fullName,
      phone,
      role: role || 'Member',
      wardName: member.wardName || member.ward,
      unit: member.unit,
      joinedDate: new Date()
    });

    await ministry.save();
    res.status(201).json(ministry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/ministries/:id/members/:memberId
router.delete('/ministries/:id/members/:memberId', async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const ministry = await Ministry.findById(id);
    if (!ministry) {
      return res.status(404).json({ error: 'Ministry not found' });
    }

    ministry.members = ministry.members.filter(m => m.memberId.toString() !== memberId && m._id.toString() !== memberId);
    await ministry.save();
    res.json(ministry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
