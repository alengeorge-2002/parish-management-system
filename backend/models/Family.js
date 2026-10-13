const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema(
  {
    house_name: { type: String, required: true, trim: true },
    family_code: { type: String, default: '' },
    ward: { type: mongoose.Schema.Types.Mixed, ref: 'Ward', default: null },
    ward_id: { type: mongoose.Schema.Types.Mixed, ref: 'Ward', default: null },
    wardId: { type: mongoose.Schema.Types.Mixed, ref: 'Ward', default: null },
    wardNumber: { type: Number, default: 1 },
    ward_number: { type: Number, default: 1 },
    wardName: { type: String, default: '' },
    ward_name: { type: String, default: '' },
    unit: { type: String, default: 'Unit I' },
    unit_number: { type: String, default: 'Unit I', trim: true },
    address: { type: String, default: '' },
    home_address: { type: String, default: '' },
    family_photo_url: { type: String, default: null },
    family_name: { type: String, default: '' },
    head_of_family: { type: mongoose.Schema.Types.Mixed, default: null },
    contact_number: { type: String, default: null },
    reg_no: { type: String, default: null },
    email: { type: String, default: null },
    unit_id: { type: mongoose.Schema.Types.Mixed, ref: 'Unit', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Family || mongoose.model('Family', FamilySchema);
