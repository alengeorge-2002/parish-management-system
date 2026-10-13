import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizationMember {
  parishioner?: mongoose.Types.ObjectId;
  member_id?: mongoose.Types.ObjectId;
  role?: string;
  role_title?: string;
  display_order?: number;
}

export interface IOrganization extends Document {
  id: string;
  name_en: string;
  name_ml?: string;
  title?: string;
  category?: string;
  description?: string;
  icon_symbol?: string;
  members: IOrganizationMember[];
  created_at?: Date;
}

const OrganizationSchema: Schema = new Schema(
  {
    name_en: { type: String, required: true, trim: true },
    name_ml: { type: String, default: '' },
    title: { type: String, default: '' },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    icon_symbol: { type: String, default: '' },
    members: [
      {
        parishioner: { type: Schema.Types.ObjectId, ref: 'Parishioner', default: null },
        member_id: { type: Schema.Types.ObjectId, ref: 'Parishioner', default: null },
        role: { type: String, default: '' },
        role_title: { type: String, default: '' },
        display_order: { type: Number, default: 0 },
      },
    ],
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.title && ret.name_en) ret.title = ret.name_en;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.title && ret.name_en) ret.title = ret.name_en;
        return ret;
      },
    },
  }
);

export const Organization = mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);
export default Organization;
