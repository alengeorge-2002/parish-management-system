import mongoose, { Schema, Document } from 'mongoose';

export interface IWardUnit {
  unitNumber: string;
  unitName?: string;
  unit_number?: string;
  representativeName?: string;
  representativePhone?: string;
}

export interface IWard extends Document {
  id: string;
  wardNumber: number;
  ward_number: number;
  wardName: string;
  ward_name: string;
  ward_prefix?: string;
  area?: string;
  units: IWardUnit[];
  total_units: number;
  representativeName: string;
  representative_name: string;
  contactPhone: string;
  contact_phone: string;
  totalFamilies: number;
  created_at?: Date;
}

const UnitSchema = new Schema({
  unitNumber: { type: String, required: true },
  unitName: { type: String, default: '' },
  unit_number: { type: String, default: '' },
  representativeName: { type: String, default: '' },
  representativePhone: { type: String, default: '' },
});

const WardSchema = new Schema(
  {
    wardNumber: { type: Number, required: true },
    ward_number: { type: Number },
    wardName: { type: String, required: true },
    ward_name: { type: String },
    area: { type: String, default: '' },
    units: [UnitSchema],
    total_units: { type: Number, default: 0 },
    representativeName: { type: String, default: 'Ward Representative' },
    representative_name: { type: String, default: 'Ward Representative' },
    contactPhone: { type: String, default: '+91 98765 43210' },
    contact_phone: { type: String, default: '+91 98765 43210' },
    totalFamilies: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.wardNumber = ret.wardNumber || ret.ward_number;
        ret.ward_number = ret.ward_number || ret.wardNumber;
        ret.wardName = ret.wardName || ret.ward_name;
        ret.ward_name = ret.ward_name || ret.wardName;
        ret.patron = ret.wardName || ret.ward_name;
        ret.representativeName = ret.representativeName || ret.representative_name;
        ret.representative_name = ret.representative_name || ret.representativeName;
        ret.president = ret.representativeName || ret.representative_name;
        ret.contactPhone = ret.contactPhone || ret.contact_phone;
        ret.contact_phone = ret.contact_phone || ret.contactPhone;
        ret.phone = ret.contactPhone || ret.contact_phone;
        ret.total_units = Array.isArray(ret.units) ? ret.units.length : (ret.total_units || 0);
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.wardNumber = ret.wardNumber || ret.ward_number;
        ret.ward_number = ret.ward_number || ret.wardNumber;
        ret.wardName = ret.wardName || ret.ward_name;
        ret.ward_name = ret.ward_name || ret.wardName;
        ret.patron = ret.wardName || ret.ward_name;
        ret.representativeName = ret.representativeName || ret.representative_name;
        ret.representative_name = ret.representative_name || ret.representativeName;
        ret.president = ret.representativeName || ret.representative_name;
        ret.contactPhone = ret.contactPhone || ret.contact_phone;
        ret.contact_phone = ret.contact_phone || ret.contactPhone;
        ret.phone = ret.contactPhone || ret.contact_phone;
        ret.total_units = Array.isArray(ret.units) ? ret.units.length : (ret.total_units || 0);
        return ret;
      },
    },
  }
);

// Pre-validate hook to keep dual properties in sync before Mongoose validation
WardSchema.pre('validate', function (this: any) {
  if (!this.ward_number && this.wardNumber) this.ward_number = this.wardNumber;
  if (!this.wardNumber && this.ward_number) this.wardNumber = this.ward_number;
  if (!this.ward_name && this.wardName) this.ward_name = this.wardName;
  if (!this.wardName && this.ward_name) this.wardName = this.ward_name;
  if (!this.representative_name && this.representativeName) this.representative_name = this.representativeName;
  if (!this.representativeName && this.representative_name) this.representativeName = this.representative_name;
  if (!this.contact_phone && this.contactPhone) this.contact_phone = this.contactPhone;
  if (!this.contactPhone && this.contact_phone) this.contactPhone = this.contact_phone;
  if (Array.isArray(this.units)) this.total_units = this.units.length;
});

export const Ward = mongoose.models.Ward || mongoose.model<IWard>('Ward', WardSchema);
export default Ward;
