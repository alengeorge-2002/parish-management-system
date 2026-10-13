import mongoose, { Schema, Document } from 'mongoose';

export interface IMassSchedule extends Document {
  id: string;
  day_type: string;
  time_slot: string;
  description_en?: string;
  description_ml?: string;
  created_at?: Date;
}

const MassScheduleSchema: Schema = new Schema(
  {
    day_type: { type: String, required: true, trim: true },
    time_slot: { type: String, required: true, trim: true },
    description_en: { type: String, default: '' },
    description_ml: { type: String, default: '' },
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

export const MassSchedule = mongoose.models.MassSchedule || mongoose.model<IMassSchedule>('MassSchedule', MassScheduleSchema);
export default MassSchedule;
