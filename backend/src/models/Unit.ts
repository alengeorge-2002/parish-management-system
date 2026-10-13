import mongoose, { Schema, Document } from 'mongoose';

export interface IUnit extends Document {
  id: string;
  unit_number: number | string;
  ward_id?: mongoose.Types.ObjectId;
  created_at?: Date;
}

const UnitSchema: Schema = new Schema(
  {
    unit_number: { type: Schema.Types.Mixed, required: true },
    ward_id: { type: Schema.Types.ObjectId, ref: 'Ward', default: null },
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

export const Unit = mongoose.models.Unit || mongoose.model<IUnit>('Unit', UnitSchema);
export default Unit;
