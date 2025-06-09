import { Router, Request, Response } from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import Transaction from "../models/Transaction";
import { sendEmail } from "../utils/sendEmail";

dotenv.config();

const merchantEmail = process.env.MERCHANT_NOTIFICATION_EMAIL!;

const router = Router();

const MERCURYO_WEBHOOK_SECRET = process.env.MERCURYO_WEBHOOK_SECRET!;

router.post("/mercuryo/ipn", async (_req: Request, res: Response) => {
  const signature = _req.headers["signature"] as string;
  const rawBody = _req.body as Buffer;

  const expectedSig = crypto
    .createHmac("sha256", MERCURYO_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSig) {
    console.error("[Mercuryo] Invalid webhook signature");
    res.status(403).send("Invalid signature");
    return;
  }

  const event = JSON.parse(rawBody.toString());

  console.log("Mercuryo IPN received:", event);

  if (event.status === "completed") {
    const tx = await Transaction.create({
      txId: event.id,
      coin: "USDT.TRC20",
      amount: Number(event.fiat_amount) * 1.02,
      merchantReceived: Number(event.fiat_amount),
      adminFee: Number(event.fiat_amount) * 0.02,
      address: event.wallet_address,
      buyerEmail: event.user_email || "unknown",
      status: "confirmed",
      rawIPN: event,
    });

    await sendEmail(
      merchantEmail,
      "Card Payment Completed",
      `
      <h2>Card Payment Received</h2>
      <p><strong>Buyer:</strong> ${event.user_email}</p>
      <p><strong>Total Paid:</strong> $${event.fiat_amount}</p>
      <p><strong>Fee (2%):</strong>USDT.TRC20</p>
      <p><strong>You Will Receive:</strong>Number(event.fiat_amount)</p>
      `
    );

    console.log("Mercuryo transaction recorded:", tx.txId);
  }

  res.status(200).json({ success: true });
});

export default router;
