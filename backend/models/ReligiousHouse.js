const mongoose = require('mongoose');

const ResidentSchema = new mongoose.Schema({
  fullName: { type: String },
  religiousName: { type: String, default: '' },
  designation: { type: String, default: 'Member' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  dob: { type: Date },
  feastDay: { type: String, default: '' },
  photo: { type: String, default: null },
  name: { type: String },
  gender: { type: String, default: 'F' }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ResidentSchema.pre('validate', function() {
  if (!this.fullName && this.name) {
    this.fullName = this.name;
  }
  if (!this.name && (this.fullName || this.religiousName)) {
    this.name = this.fullName || this.religiousName;
  }
});

const ReligiousHouseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  malayalamName: { type: String, default: '', trim: true },
  houseType: { type: String, enum: ['women', 'men'], default: 'women' },
  house_type: { type: String, enum: ['women', 'men'], default: 'women' },
  category_type: { type: String, default: 'Convent', trim: true },
  category: { type: String, default: 'Convent', trim: true },
  superior_in_charge: { type: String, default: '' },
  resident_count: { type: Number, default: 0 },
  contact_number: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  photo_url: { type: String, default: '' },
  residents: [ResidentSchema]
}, {
  timestamps: true
});

module.exports = mongoose.models.ReligiousHouse || mongoose.model('ReligiousHouse', ReligiousHouseSchema);
