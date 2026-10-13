export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscription {
  id: number;
  endpoint: string;
  keys: PushSubscriptionKeys;
  device_type?: string;
  created_at?: string | Date;
}
