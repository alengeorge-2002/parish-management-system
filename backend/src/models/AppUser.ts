import mongoose, { Schema, Document } from 'mongoose';

export interface IAppUser extends Document {
  id: string;
  member_id: mongoose.Types.ObjectId;
  access_key: string;
  role: string;
  created_at?: Date;
}

const AppUserSchema: Schema = new Schema(
  {
    member_id: { type: Schema.Types.ObjectId, ref: 'Parishioner', required: true },
    access_key: { type: String, required: true, unique: true },
    role: { type: String, default: 'parishioner' },
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

export const AppUser = mongoose.models.AppUser || mongoose.model<IAppUser>('AppUser', AppUserSchema);
export default AppUser;
