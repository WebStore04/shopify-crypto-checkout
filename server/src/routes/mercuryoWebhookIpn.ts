import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";

import Transaction from "../models/Transaction";
import { sendEmail } from "../utils/sendEmail";
import { ipAllowlist } from "../middleware/ipAllowList";
import { verifyMercuryoWebhook } from "../middleware/verifyMercuryoWebhook";

dotenv.config();

const router = Router();

const merchantEmail = process.env.MERCHANT_NOTIFICATION_EMAIL!;

router.post(
  "/mercuryo/webhook",
  ipAllowlist,
  verifyMercuryoWebhook,
  async (req: Request, res: Response) => {
    const rawBody = req.body as Buffer;
    const event = JSON.parse(rawBody.toString());

    console.log("[Mercuryo] IPN received:", event);

    if (event.status === "completed") {
      const fiatAmount = Number(event.fiat_amount);
      const adminFee = parseFloat((fiatAmount * 0.02).toFixed(2));
      const merchantReceived = parseFloat((fiatAmount - adminFee).toFixed(2));

      // After the transaction is recorded, trigger withdrawal to cold wallet
      const withdrawalResponse = await axios.post(
        "http://localhost:3000/api/withdraw",
        {
          txId: event.id, // Pass the transaction ID from Mercuryo
        }
      );

      console.log("Withdrawal response:", withdrawalResponse.data);

      const tx = await Transaction.create({
        txId: event.id,
        coin: "USDT.TRC20",
        amount: fiatAmount,
        merchantReceived,
        adminFee,
        address: event.wallet_address,
        buyerEmail: event.user_email || "unknown",
        status: "confirmed",
        rawIPN: event,
      });

      // Send merchant notification email
      await sendEmail(
        merchantEmail,
        "Card Payment Completed",
        `
      <h2>Card Payment Received</h2>
      <p><strong>Buyer:</strong> ${event.user_email || "unknown"}</p>
      <p><strong>Total Paid (Fiat):</strong> $${fiatAmount}</p>
      <p><strong>Admin Fee (2%):</strong> $${adminFee}</p>
      <p><strong>You Will Receive (USDT):</strong> ${merchantReceived}</p>
      <p><strong>Wallet:</strong> ${event.wallet_address}</p>
      <p><strong>TX ID:</strong> ${event.id}</p>
      `
      );

      console.log("[Mercuryo] Transaction recorded:", tx.txId);
    }

    res.status(200).json({ success: true });
    return;
  }
);

export default router;
