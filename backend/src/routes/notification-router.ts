import { Router, Request, Response } from "express";
import { VAPID_PUBLIC_KEY } from "../config/vapid";
import { PushSubscription } from "../models/PushSubscription";
import { sendPushToAllParishioners } from "../utils/pushNotifier";

const router = Router();

// GET /api/notifications/vapid-key -> returns public VAPID key
router.get("/vapid-key", (_req: Request, res: Response) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// POST /api/notifications/subscribe -> saves/upserts endpoint & keys in MongoDB
router.post("/subscribe", async (req: Request, res: Response) => {
  try {
    const { endpoint, keys, deviceType } = req.body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      res.status(400).json({ error: "Missing required subscription endpoint or keys" });
      return;
    }

    const subscription = await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys,
        deviceType: deviceType || "web",
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Subscription saved successfully", subscription });
  } catch (error: any) {
    console.error("[NotificationRouter] Error saving subscription:", error);
    res.status(500).json({ error: error.message || "Failed to save push subscription" });
  }
});

// POST /api/notifications/unsubscribe -> removes device endpoint
router.post("/unsubscribe", async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      res.status(400).json({ error: "Missing endpoint parameter" });
      return;
    }

    await PushSubscription.deleteOne({ endpoint });
    res.json({ message: "Subscription removed successfully" });
  } catch (error: any) {
    console.error("[NotificationRouter] Error removing subscription:", error);
    res.status(500).json({ error: error.message || "Failed to unsubscribe" });
  }
});

// POST /api/notifications/broadcast -> manual broadcast route
router.post("/broadcast", async (req: Request, res: Response) => {
  try {
    const { title, body, icon, url, tag } = req.body;
    if (!title || !body) {
      res.status(400).json({ error: "Title and body are required for push notification" });
      return;
    }

    const result = await sendPushToAllParishioners({ title, body, icon, url, tag });
    res.json({ message: "Push notification broadcast initiated", result });
  } catch (error: any) {
    console.error("[NotificationRouter] Broadcast error:", error);
    res.status(500).json({ error: error.message || "Failed to broadcast notification" });
  }
});

export default router;
