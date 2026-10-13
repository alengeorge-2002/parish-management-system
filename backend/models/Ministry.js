const mongoose = require('mongoose');

const ministrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  name_en: { type: String },
  name_ml: { type: String },
  category: { type: String, default: 'Liturgical' },
  description: { type: String },
  meets: { type: String },
  coordinator: { type: String },
  phone: { type: String },
  members: [
    {
      memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parishioner', required: true },
      fullName: { type: String, required: true },
      role: { type: String, default: 'Member' },
      phone: { type: String },
      wardName: { type: String },
      unit: { type: String },
      joinedDate: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.models.Ministry || mongoose.model('Ministry', ministrySchema);
