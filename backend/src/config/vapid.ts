import webpush from "web-push";

const vapidEmail = process.env.VAPID_EMAIL || "mailto:admin@devagiriparish.com";

let publicKey = process.env.VAPID_PUBLIC_KEY;
let privateKey = process.env.VAPID_PRIVATE_KEY;

if (!publicKey || !privateKey) {
  // Generate default VAPID keys if not present in environment
  const keys = webpush.generateVAPIDKeys();
  publicKey = keys.publicKey;
  privateKey = keys.privateKey;
  console.log("[VAPID] Auto-generated VAPID Keys for Web Push:");
  console.log(`[VAPID] Public Key:  ${publicKey}`);
  console.log(`[VAPID] Private Key: ${privateKey}`);
}

try {
  webpush.setVapidDetails(vapidEmail, publicKey, privateKey);
  console.log(`[VAPID] Web-Push initialized with Subject: ${vapidEmail}`);
} catch (err) {
  console.error("[VAPID] Error setting VAPID details:", err);
}

export const VAPID_PUBLIC_KEY = publicKey;
export const VAPID_PRIVATE_KEY = privateKey;
export const VAPID_EMAIL = vapidEmail;
export { webpush };
