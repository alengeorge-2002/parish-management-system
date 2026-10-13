const mongoose = require('mongoose');

const parishCouncilSchema = new mongoose.Schema({
  roleTitle: { type: String, required: true },
  malayalamTitle: { type: String, default: '' },
  category: { type: String, default: 'Ward Councillor' },
  wardNumber: { type: Number, default: null },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parishioner', default: null },
  occupantName: { type: String, default: null },
  phone: { type: String, default: null },
  term: { type: String, default: '2024 – 2026' },
  status: { type: String, default: 'vacant' },
  display_order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.ParishCouncil || mongoose.model('ParishCouncil', parishCouncilSchema);
