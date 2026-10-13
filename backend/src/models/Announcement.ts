import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  id: string;
  title: string;
  content: string;
  poster_url?: string | null;
  expiry_date?: Date | string | null;
  image_url?: string | null;
  priority?: string;
  announcement_date?: Date;
  created_at?: Date;
}

const AnnouncementSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    poster_url: { type: String, default: null },
    expiry_date: { type: Schema.Types.Mixed, default: null },
    image_url: { type: String, default: null },
    priority: { type: String, default: 'medium' },
    is_active: { type: Boolean, default: true },
    announcement_date: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.image_url && ret.poster_url) ret.image_url = ret.poster_url;
        if (!ret.poster_url && ret.image_url) ret.poster_url = ret.image_url;
        ret.heading = ret.title;
        ret.description = ret.content;
        ret.date = ret.announcement_date || ret.created_at;
        ret.posterImage = ret.image_url || ret.poster_url;
        ret.imageUrl = ret.image_url || ret.poster_url;
        ret.isActive = ret.is_active !== false;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.image_url && ret.poster_url) ret.image_url = ret.poster_url;
        if (!ret.poster_url && ret.image_url) ret.poster_url = ret.image_url;
        ret.heading = ret.title;
        ret.description = ret.content;
        ret.date = ret.announcement_date || ret.created_at;
        ret.posterImage = ret.image_url || ret.poster_url;
        ret.imageUrl = ret.image_url || ret.poster_url;
        ret.isActive = ret.is_active !== false;
        return ret;
      },
    },
  }
);

export const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
export default Announcement;
