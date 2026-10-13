import { API_BASE_URL } from "../config";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function initializePushNotifications(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    console.log("[NotificationManager] Web Push notifications not supported in this browser environment.");
    return false;
  }

  try {
    // 1. Request user permission for notifications
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.log("[NotificationManager] User notification permission not granted:", permission);
      return false;
    }

    // 2. Register / wait for active service worker
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      console.warn("[NotificationManager] Service Worker registration not ready.");
      return false;
    }

    // 3. Fetch VAPID Public Key from backend API
    const backendUrl = API_BASE_URL || "http://localhost:5000/api";
    const keyRes = await fetch(`${backendUrl}/notifications/vapid-key`);
    if (!keyRes.ok) {
      throw new Error(`Failed to fetch VAPID key: ${keyRes.statusText}`);
    }

    const { publicKey } = await keyRes.json();
    if (!publicKey) {
      throw new Error("No public VAPID key returned from server.");
    }

    // 4. Check existing subscription or create new subscription
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(publicKey) as unknown as BufferSource;
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // 5. Send subscription JSON payload to backend endpoint
    const subPayload = subscription.toJSON();
    const saveRes = await fetch(`${backendUrl}/notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: subPayload.endpoint,
        keys: subPayload.keys,
        deviceType: "web",
      }),
    });

    if (saveRes.ok) {
      console.log("[NotificationManager] Successfully registered for Web Push notifications.");
      return true;
    } else {
      console.error("[NotificationManager] Failed to save push subscription to backend:", await saveRes.text());
      return false;
    }
  } catch (err) {
    console.error("[NotificationManager] Error initializing push notifications:", err);
    return false;
  }
}
