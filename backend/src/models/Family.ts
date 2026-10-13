import mongoose, { Schema, Document } from 'mongoose';

export interface IFamily extends Document {
  id: string;
  house_name: string;
  family_code?: string;
  ward?: mongoose.Types.ObjectId | any;
  ward_id?: mongoose.Types.ObjectId | any;
  wardId?: mongoose.Types.ObjectId | any;
  wardNumber?: number;
  ward_number?: number;
  wardName?: string;
  ward_name?: string;
  unit?: string;
  unit_number?: string;
  address?: string;
  home_address?: string;
  family_photo_url?: string | null;
  family_name?: string;
  head_of_family?: string;
  contact_number?: string;
  reg_no?: string;
  email?: string;
  unit_id?: mongoose.Types.ObjectId | any;
  created_at?: Date;
}

const FamilySchema: Schema = new Schema(
  {
    house_name: { type: String, required: true, trim: true },
    family_code: { type: String, default: '' },
    ward: { type: Schema.Types.Mixed, ref: 'Ward', default: null },
    ward_id: { type: Schema.Types.Mixed, ref: 'Ward', default: null },
    wardId: { type: Schema.Types.Mixed, ref: 'Ward', default: null },
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
    head_of_family: { type: Schema.Types.Mixed, default: null },
    contact_number: { type: String, default: null },
    reg_no: { type: String, default: null },
    email: { type: String, default: null },
    unit_id: { type: Schema.Types.Mixed, ref: 'Unit', default: null },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.ward_id = ret.ward_id || ret.wardId || ret.ward;
        ret.wardId = ret.wardId || ret.ward_id || ret.ward;
        ret.wardNumber = ret.wardNumber || ret.ward_number;
        ret.ward_number = ret.ward_number || ret.wardNumber;
        ret.wardName = ret.wardName || ret.ward_name;
        ret.ward_name = ret.ward_name || ret.wardName;
        ret.unitNumber = ret.unit || ret.unit_number;
        ret.unit_number = ret.unit_number || ret.unit;
        ret.unit = ret.unit || ret.unit_number;
        ret.familyName = ret.family_name || ret.house_name;
        ret.houseName = ret.house_name;
        ret.headOfFamily = ret.head_of_family;
        ret.contactNumber = ret.contact_number;
        ret.phone = ret.contact_number;
        ret.familyPhotoUrl = ret.family_photo_url;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.ward_id = ret.ward_id || ret.wardId || ret.ward;
        ret.wardId = ret.wardId || ret.ward_id || ret.ward;
        ret.wardNumber = ret.wardNumber || ret.ward_number;
        ret.ward_number = ret.ward_number || ret.wardNumber;
        ret.wardName = ret.wardName || ret.ward_name;
        ret.ward_name = ret.ward_name || ret.wardName;
        ret.unitNumber = ret.unit || ret.unit_number;
        ret.unit_number = ret.unit_number || ret.unit;
        ret.unit = ret.unit || ret.unit_number;
        ret.familyName = ret.family_name || ret.house_name;
        ret.houseName = ret.house_name;
        ret.headOfFamily = ret.head_of_family;
        ret.contactNumber = ret.contact_number;
        ret.phone = ret.contact_number;
        ret.familyPhotoUrl = ret.family_photo_url;
        return ret;
      },
    },
  }
);

export const Family = mongoose.models.Family || mongoose.model<IFamily>('Family', FamilySchema);
export default Family;
