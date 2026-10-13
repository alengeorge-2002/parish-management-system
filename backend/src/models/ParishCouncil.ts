import mongoose, { Schema, Document } from 'mongoose';

export interface IParishCouncil extends Document {
  id: string;
  member_id?: mongoose.Types.ObjectId | null;
  role_title?: string;
  roleTitle?: string;
  malayalamTitle?: string;
  category?: string;
  committee_type?: string;
  ward_id?: mongoose.Types.ObjectId | null;
  wardNumber?: number;
  occupantName?: string | null;
  phone?: string | null;
  term?: string;
  status?: string;
  display_order?: number;
  created_at?: Date;
}

const ParishCouncilSchema: Schema = new Schema(
  {
    member_id: { type: Schema.Types.ObjectId, ref: 'Parishioner', default: null },
    role_title: { type: String, default: '' },
    roleTitle: { type: String, default: '' },
    malayalamTitle: { type: String, default: '' },
    category: { type: String, default: 'Ward Councillor' },
    committee_type: { type: String, default: 'Ward Councillor' },
    ward_id: { type: Schema.Types.ObjectId, ref: 'Ward', default: null },
    wardNumber: { type: Number, default: null },
    occupantName: { type: String, default: null },
    phone: { type: String, default: null },
    term: { type: String, default: '2024 – 2026' },
    status: { type: String, default: 'vacant' },
    display_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.roleTitle && ret.role_title) ret.roleTitle = ret.role_title;
        if (!ret.category && ret.committee_type) ret.category = ret.committee_type;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.roleTitle && ret.role_title) ret.roleTitle = ret.role_title;
        if (!ret.category && ret.committee_type) ret.category = ret.committee_type;
        return ret;
      },
    },
  }
);

export const ParishCouncil = mongoose.models.ParishCouncil || mongoose.model<IParishCouncil>('ParishCouncil', ParishCouncilSchema);
export default ParishCouncil;

