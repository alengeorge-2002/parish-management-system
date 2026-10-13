import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  id: string;
  target_date: Date | string;
  title_en: string;
  title_ml?: string;
  description_en?: string;
  description_ml?: string;
  title?: string;
  event_date?: Date | string;
  mass_time?: string;
  type_badge?: string;
  location?: string;
  description?: string;
  created_at?: Date;
}

const EventSchema: Schema = new Schema(
  {
    target_date: { type: Schema.Types.Mixed, required: true },
    title_en: { type: String, required: true, trim: true },
    title_ml: { type: String, default: '' },
    description_en: { type: String, default: '' },
    description_ml: { type: String, default: '' },
    title: { type: String, default: '' },
    event_date: { type: Schema.Types.Mixed, default: null },
    mass_time: { type: String, default: '' },
    type_badge: { type: String, default: '' },
    location: { type: String, default: 'Main Sanctuary' },
    description: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.title && ret.title_en) ret.title = ret.title_en;
        if (!ret.event_date && ret.target_date) ret.event_date = ret.target_date;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.title && ret.title_en) ret.title = ret.title_en;
        if (!ret.event_date && ret.target_date) ret.event_date = ret.target_date;
        return ret;
      },
    },
  }
);

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export default Event;
