import mongoose, { Schema, Document } from "mongoose";

export interface IPushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface IPushSubscription extends Document {
  endpoint: string;
  keys: IPushSubscriptionKeys;
  deviceType: string;
  createdAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  deviceType: { type: String, default: "web" },
  createdAt: { type: Date, default: Date.now },
});

export const PushSubscription = mongoose.model<IPushSubscription>(
  "PushSubscription",
  PushSubscriptionSchema
);

export default PushSubscription;
