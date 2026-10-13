import mongoose, { Schema, Document } from 'mongoose';

export interface IClergy extends Document {
  id: string;
  name: string;
  role?: string;
  role_type?: string;
  category?: string;
  designation?: string | null;
  phone_number?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  display_order?: number;
  is_quick_contact?: boolean;
  address?: string | null;
  blood_group?: string | null;
  house_id?: mongoose.Types.ObjectId | null;
  created_at?: Date;
}

const ClergySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: '' },
    role_type: { type: String, default: '' },
    category: { type: String, default: '' },
    designation: { type: String, default: null },
    phone_number: { type: String, default: null },
    email: { type: String, default: null },
    avatar_url: { type: String, default: null },
    display_order: { type: Number, default: 0 },
    is_quick_contact: { type: Boolean, default: false },
    address: { type: String, default: null },
    blood_group: { type: String, default: null },
    house_id: { type: Schema.Types.ObjectId, ref: 'ReligiousHouse', default: null },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

export const Clergy = mongoose.models.Clergy || mongoose.model<IClergy>('Clergy', ClergySchema);
export default Clergy;
