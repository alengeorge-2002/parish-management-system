import mongoose, { Schema, Document } from 'mongoose';

export interface IParishioner extends Document {
  id: string;
  first_name: string;
  last_name: string;
  malayalam_name?: string;
  baptism_name?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string;
  dob?: Date | string | null;
  relation_to_head?: string;
  relationship_role?: string;
  blood_group?: string | null;
  occupation?: string | null;
  phone_number?: string | null;
  email?: string | null;
  status?: string;
  is_active?: boolean;
  is_head_of_household?: boolean;
  dom?: Date | string | null;
  baptism_date?: Date | string | null;
  first_communion_date?: Date | string | null;
  confirmation_date?: Date | string | null;
  marriage_date?: Date | string | null;
  ward_id?: mongoose.Types.ObjectId | string | null;
  wardId?: mongoose.Types.ObjectId | string | null;
  ward_number?: number;
  wardNumber?: number;
  unit?: string;
  unit_number?: string;
  sacraments?: string[];
  family: mongoose.Types.ObjectId;
  family_id?: mongoose.Types.ObjectId;
  created_at?: Date;
}

const ParishionerSchema: Schema = new Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, default: '', trim: true },
    malayalam_name: { type: String, default: '' },
    baptism_name: { type: String, default: '' },
    gender: { type: String, default: 'MALE' },
    dob: { type: Schema.Types.Mixed, default: null },
    relation_to_head: { type: String, default: '' },
    relationship_role: { type: String, default: '' },
    blood_group: { type: String, default: null },
    occupation: { type: String, default: null },
    phone_number: { type: String, default: null },
    email: { type: String, default: null },
    status: { type: String, default: 'active' },
    is_active: { type: Boolean, default: true },
    is_head_of_household: { type: Boolean, default: false },
    dom: { type: Schema.Types.Mixed, default: null },
    baptism_date: { type: Schema.Types.Mixed, default: null },
    first_communion_date: { type: Schema.Types.Mixed, default: null },
    confirmation_date: { type: Schema.Types.Mixed, default: null },
    marriage_date: { type: Schema.Types.Mixed, default: null },
    ward_id: { type: Schema.Types.Mixed, default: null },
    wardId: { type: Schema.Types.Mixed, default: null },
    ward_number: { type: Number, default: 1 },
    wardNumber: { type: Number, default: 1 },
    unit: { type: String, default: null },
    unit_number: { type: String, default: null },
    sacraments: { type: [String], default: [] },
    family: { type: Schema.Types.ObjectId, ref: 'Family', required: false, default: null },
    family_id: { type: Schema.Types.ObjectId, ref: 'Family', default: null },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.family_id && ret.family) ret.family_id = ret.family;
        ret.name = `${ret.first_name || ''} ${ret.last_name || ''}`.trim() || 'Parishioner';
        ret.firstName = ret.first_name;
        ret.lastName = ret.last_name;
        ret.fullName = ret.name;
        ret.nameMl = ret.malayalam_name;
        ret.malayalamName = ret.malayalam_name;
        ret.baptismName = ret.baptism_name;
        ret.phone = ret.phone_number;
        ret.bloodGroup = ret.blood_group;
        ret.relationshipToHead = ret.relationship_role || ret.relation_to_head;
        ret.wardId = ret.wardId || ret.ward_id;
        ret.wardNumber = ret.wardNumber || ret.ward_number;
        ret.unit = ret.unit || ret.unit_number;
        ret.unitNumber = ret.unit || ret.unit_number;
        ret.unit_number = ret.unit_number || ret.unit;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.family_id && ret.family) ret.family_id = ret.family;
        ret.name = `${ret.first_name || ''} ${ret.last_name || ''}`.trim() || 'Parishioner';
        ret.firstName = ret.first_name;
        ret.lastName = ret.last_name;
        ret.fullName = ret.name;
        ret.nameMl = ret.malayalam_name;
        ret.malayalamName = ret.malayalam_name;
        ret.baptismName = ret.baptism_name;
        ret.phone = ret.phone_number;
        ret.bloodGroup = ret.blood_group;
        ret.relationshipToHead = ret.relationship_role || ret.relation_to_head;
        ret.wardId = ret.wardId || ret.ward_id;
        ret.wardNumber = ret.wardNumber || ret.ward_number;
        ret.unit = ret.unit || ret.unit_number;
        ret.unitNumber = ret.unit || ret.unit_number;
        ret.unit_number = ret.unit_number || ret.unit;
        return ret;
      },
    },
  }
);

export const Parishioner = mongoose.models.Parishioner || mongoose.model<IParishioner>('Parishioner', ParishionerSchema);
export default Parishioner;
