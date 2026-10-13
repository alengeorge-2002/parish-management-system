import mongoose, { Schema, Document } from 'mongoose';

export interface IReading {
  type?: string;
  referenceEn: string;
  referenceMl?: string;
  descriptionEn?: string;
  descriptionMl?: string;
}

export interface ICalendar extends Document {
  dateString: string;
  season?: string;
  seasonMl?: string;
  title?: string;
  titleMl?: string;
  feastName?: string;
  feastNameMl?: string;
  readings: IReading[];
  isHolyDayOfObligation?: boolean;
  isFastDay?: boolean;
  color?: string;
}

const CalendarSchema: Schema = new Schema(
  {
    dateString: { type: String, required: true, unique: true, index: true },
    season: { type: String, default: '' },
    seasonMl: { type: String, default: '' },
    title: { type: String, default: '' },
    titleMl: { type: String, default: '' },
    feastName: { type: String, default: '' },
    feastNameMl: { type: String, default: '' },
    readings: [
      {
        type: { type: String, default: '' },
        referenceEn: { type: String, required: true },
        referenceMl: { type: String, default: '' },
        descriptionEn: { type: String, default: '' },
        descriptionMl: { type: String, default: '' },
      },
    ],
    isHolyDayOfObligation: { type: Boolean, default: false },
    isFastDay: { type: Boolean, default: false },
    color: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Calendar = mongoose.models.Calendar || mongoose.model<ICalendar>('Calendar', CalendarSchema);
export default Calendar;
