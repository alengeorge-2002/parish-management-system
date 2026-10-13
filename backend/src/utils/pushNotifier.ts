import { webpush } from "../config/vapid";
import { pool } from "../config/db";

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

export async function sendPushToAllParishioners(payload: PushNotificationPayload) {
  try {
    const result = await pool.query('SELECT * FROM push_subscriptions');
    const subscriptions = result.rows;
    if (!subscriptions || subscriptions.length === 0) {
      console.log("[PushNotifier] No active push subscriptions found.");
      return { total: 0, sent: 0, removed: 0 };
    }

    console.log(`[PushNotifier] Sending push to ${subscriptions.length} subscriber(s)...`);

    const notificationData = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/favicon.png",
      url: payload.url || "/",
      tag: payload.tag || "parish-alert",
    });

    let sent = 0;
    let removed = 0;

    await Promise.all(
      subscriptions.map(async (sub) => {
        const keys = typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys;
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, notificationData);
          sent++;
        } catch (err: any) {
          const statusCode = err?.statusCode || err?.status;
          if (statusCode === 410 || statusCode === 404) {
            console.log(`[PushNotifier] Removing expired subscription: ${sub.endpoint}`);
            await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]);
            removed++;
          } else {
            console.error(`[PushNotifier] Error sending push to ${sub.endpoint}:`, err?.message || err);
          }
        }
      })
    );

    console.log(`[PushNotifier] Broadcast complete. Sent: ${sent}, Removed: ${removed}`);
    return { total: subscriptions.length, sent, removed };
  } catch (error) {
    console.error("[PushNotifier] Failed to execute sendPushToAllParishioners:", error);
    throw error;
  }
}
