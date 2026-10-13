import mongoose, { Schema, Document } from 'mongoose';

export interface IResident {
  id?: string;
  _id?: string;
  fullName?: string;
  religiousName?: string;
  name?: string;
  designation?: string;
  phone?: string;
  email?: string;
  dob?: Date | string;
  feastDay?: string;
  photo?: string | null;
  gender?: string;
}

export interface IReligiousHouse extends Document {
  id: string;
  name: string;
  malayalamName?: string;
  houseType?: 'women' | 'men' | string;
  house_type?: 'women' | 'men' | string;
  category_type: string;
  category?: string;
  superior_in_charge?: string;
  resident_count?: number;
  contact_number?: string;
  email?: string;
  address?: string;
  photo_url?: string;
  residents?: IResident[];
  created_at?: Date;
}

const ResidentSchema = new Schema({
  fullName: { type: String },
  religiousName: { type: String, default: '' },
  designation: { type: String, default: 'Member' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  dob: { type: Date },
  feastDay: { type: String, default: '' },
  photo: { type: String, default: null },
  name: { type: String },
  gender: { type: String, default: 'F' },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ResidentSchema.pre('validate', function(this: any) {
  if (!this.fullName && this.name) {
    this.fullName = this.name;
  }
  if (!this.name && (this.fullName || this.religiousName)) {
    this.name = this.fullName || this.religiousName;
  }
});

const ReligiousHouseSchema: Schema = new Schema(
  {
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
    residents: [ResidentSchema],
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.houseType = ret.houseType || ret.house_type || (
          (ret.name && (ret.name.includes('Convent') || ret.name.includes('സന്യാസിനി'))) || ret.category === 'Convent' ? 'women' : 'men'
        );
        ret.house_type = ret.houseType;
        ret.category = ret.category || ret.category_type || 'Convent';
        ret.superiorInCharge = ret.superior_in_charge;
        ret.residentCount = ret.resident_count;
        ret.contactNumber = ret.contact_number;
        ret.photoUrl = ret.photo_url;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.houseType = ret.houseType || ret.house_type || (
          (ret.name && (ret.name.includes('Convent') || ret.name.includes('സന്യാസിനി'))) || ret.category === 'Convent' ? 'women' : 'men'
        );
        ret.house_type = ret.houseType;
        ret.category = ret.category || ret.category_type || 'Convent';
        ret.superiorInCharge = ret.superior_in_charge;
        ret.residentCount = ret.resident_count;
        ret.contactNumber = ret.contact_number;
        ret.photoUrl = ret.photo_url;
        return ret;
      },
    },
  }
);

export const ReligiousHouse = mongoose.models.ReligiousHouse || mongoose.model<IReligiousHouse>('ReligiousHouse', ReligiousHouseSchema);
export default ReligiousHouse;
