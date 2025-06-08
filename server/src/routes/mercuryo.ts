import { Router, Request, Response } from "express";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/mercuryo", async (_req: Request, res: Response) => {
  const mercuryoSecret = process.env.MERCURYO_WEBHOOK_SECRET;

  const signature = _req.headers["signature"] as string;
  const rawBody = _req.body as Buffer;

  // Validate signature (HMAC-SHA256)
  const expectedSig = crypto
    .createHmac("sha256", mercuryoSecret!)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSig) {
    console.error("[Mercuryo] Invalid webhook signature");
    res.status(403).send("Invalid signature");
    return;
  }

  const event = _req.body;

  console.log("[Mercuryo Webhook] Event received:", event);

  // Handle event type and status
  if (event?.type === "order_status" && event?.data?.status === "successful") {
    const orderId = event.data.external_id;
    const amount = event.data.crypto_amount;
    const currency = event.data.crypto_currency;

    // TODO: log to DB, update order status, trigger withdrawal, etc.
    console.log(
      `Mercuryo order ${orderId} confirmed for ${amount} ${currency}`
    );
  }

  res.status(200).send("OK");
});

export default router;
