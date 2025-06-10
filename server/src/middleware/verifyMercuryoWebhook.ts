import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Get the Mercuryo Webhook Secret from the environment
const MERCURYO_WEBHOOK_SECRET = process.env.MERCURYO_WEBHOOK_SECRET!;

// This middleware will verify the Mercuryo webhook signature
export const verifyMercuryoWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers["signature"] as string; // Mercuryo sends the HMAC signature in the 'signature' header
  const rawBody = req.body as Buffer; // Raw request body that was sent by Mercuryo

  if (!signature) {
    console.error("No signature found in webhook request");
    res.status(400).json({ error: "No signature found in webhook request" });
    return;
  }

  // Calculate the HMAC hash using the secret and the raw body
  const expectedSignature = crypto
    .createHmac("sha256", MERCURYO_WEBHOOK_SECRET) // SHA256 is used for the HMAC hashing
    .update(rawBody) // Update with the raw body of the request
    .digest("hex"); // Get the hex representation of the hash

  // Compare the computed signature with the one sent by Mercuryo
  if (signature !== expectedSignature) {
    console.error("Invalid webhook signature");
    res.status(403).json({ error: "Invalid signature" });
    return;
  }

  // If the signature is valid, continue to the next middleware/handler
  console.log("Mercuryo webhook verified successfully");
  next();
};
