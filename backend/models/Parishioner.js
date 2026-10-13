const mongoose = require('mongoose');

const ParishionerSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, default: '', trim: true },
    malayalam_name: { type: String, default: '' },
    baptism_name: { type: String, default: '' },
    gender: { type: String, default: 'MALE' },
    dob: { type: mongoose.Schema.Types.Mixed, default: null },
    relation_to_head: { type: String, default: '' },
    relationship_role: { type: String, default: '' },
    blood_group: { type: String, default: null },
    occupation: { type: String, default: null },
    phone_number: { type: String, default: null },
    email: { type: String, default: null },
    status: { type: String, default: 'active' },
    is_active: { type: Boolean, default: true },
    is_head_of_household: { type: Boolean, default: false },
    dom: { type: mongoose.Schema.Types.Mixed, default: null },
    baptism_date: { type: mongoose.Schema.Types.Mixed, default: null },
    first_communion_date: { type: mongoose.Schema.Types.Mixed, default: null },
    confirmation_date: { type: mongoose.Schema.Types.Mixed, default: null },
    marriage_date: { type: mongoose.Schema.Types.Mixed, default: null },
    ward_id: { type: mongoose.Schema.Types.Mixed, default: null },
    wardId: { type: mongoose.Schema.Types.Mixed, default: null },
    ward_number: { type: Number, default: 1 },
    wardNumber: { type: Number, default: 1 },
    unit: { type: String, default: null },
    unit_number: { type: String, default: null },
    sacraments: { type: [String], default: [] },
    family: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: false, default: null },
    family_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Parishioner || mongoose.model('Parishioner', ParishionerSchema);
