const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  unitNumber: { type: String, required: true }, // e.g., 'Unit I'
  unitName: { type: String },
  unit_number: { type: String },
  representativeName: { type: String },
  representativePhone: { type: String }
});

const WardSchema = new mongoose.Schema({
  wardNumber: { type: Number, required: true },
  ward_number: { type: Number },
  wardName: { type: String, required: true },
  ward_name: { type: String },
  area: { type: String },
  units: [UnitSchema],
  total_units: { type: Number, default: 0 },
  representativeName: { type: String, default: 'Ward Representative' },
  representative_name: { type: String, default: 'Ward Representative' },
  contactPhone: { type: String, default: '+91 98765 43210' },
  contact_phone: { type: String, default: '+91 98765 43210' },
  totalFamilies: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Ward || mongoose.model('Ward', WardSchema);
