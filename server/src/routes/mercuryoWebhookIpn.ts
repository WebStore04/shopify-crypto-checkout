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

    try {
      // Check if transaction already exists
      const existingTransaction = await Transaction.findOne({
        txId: event.id,
      });

      if (existingTransaction) {
        console.log(
          `[Mercuryo] Transaction with txId ${event.id} already exists.`
        );
        res.status(200).json({ success: true });
        return;
      }

      if (event.status === "completed") {
        const fiatAmount = Number(event.fiat_amount);
        const adminFee = parseFloat((fiatAmount * 0.02).toFixed(2));
        const merchantReceived = parseFloat((fiatAmount - adminFee).toFixed(2));

        const historyEntry = {
          status: "confirmed", // Initial status
          updatedAt: new Date(),
          updatedBy: "system", // Could be "merchant" based on who is updating it
          reason: "Transaction confirmed via Mercuryo webhook",
        };

        // Create the transaction and save the history
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
          history: [historyEntry],
          currency: "USD",
          isFlagged: false,
          createdAt: new Date(),
          updatedAt: new Date(),
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

        // After the transaction is recorded, trigger withdrawal to cold wallet
        const withdrawalResponse = await axios.post(
          "http://localhost:3000/api/withdraw",
          {
            txId: event.id, // Pass the transaction ID from Mercuryo
          }
        );

        console.log("Withdrawal response:", withdrawalResponse.data);
      } else if (event.status === "failed") {
        // Handle failure scenario (can be used to mark transactions as failed)
        const historyEntry = {
          status: "failed",
          updatedAt: new Date(),
          updatedBy: "system",
          reason: "Transaction failed via Mercuryo webhook",
        };

        const tx = await Transaction.create({
          txId: event.id,
          status: "failed",
          history: [historyEntry],
        });

        console.log("[Mercuryo] Transaction failed:", tx.txId);
      } else {
        console.log(
          `[Mercuryo] Transaction status is not 'completed' or 'failed'. Skipping...`
        );
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("[Mercuryo] Error processing webhook:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
