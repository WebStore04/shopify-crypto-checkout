import { Router, Request, Response } from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import Coinpayments from "coinpayments";
import querystring from "querystring";
import Transaction from "../models/Transaction";
import { sendEmail } from "../utils/sendEmail";

dotenv.config();

const merchantEmail = process.env.MERCHANT_NOTIFICATION_EMAIL!;

const router = Router();

const client = new Coinpayments({
  key: process.env.COINPAYMENTS_CLIENT_API_KEY!,
  secret: process.env.COINPAYMENTS_CLIENT_SECRET!,
});

const COLD_WALLET_ADDRESS = process.env.COLD_WALLET_ADDRESS!;
if (!COLD_WALLET_ADDRESS) {
  throw new Error("Missing COLD_WALLET_ADDRESS in env");
}

router.post("/ipn", async (_req: Request, res: Response) => {
  const ipnSecret = process.env.COINPAYMENTS_IPN_SECRET;
  const hmacHeader = _req.headers["hmac"] as string;

  if (!ipnSecret || !hmacHeader) {
    console.error("[IPN] Missing HMAC or secret");
    res.status(400).send("Missing headers");
    return;
  }

  const rawBody = _req.body as Buffer;

  const calculateHmac = crypto
    .createHmac("sha512", ipnSecret!)
    .update(rawBody)
    .digest("hex");

  if (!hmacHeader || calculateHmac !== hmacHeader) {
    console.error("[IPN] Invalid HMAC signature");
    res.status(403).send("Invalid HMAC signature");
    return;
  }

  const parsed = querystring.parse(rawBody.toString());

  const status = parseInt(parsed.status as string);
  const currency = parsed.currency2 as string;
  const amount = parseFloat(parsed.amount2 as string);
  const txnId = parsed.txn_id as string;

  console.log(
    `[IPN] Received status: ${status} for ${currency}, amount: ${amount}, txn: ${txnId}`
  );

  try {
    const tx = await Transaction.findOne({ txId: txnId });

    if (!tx) {
      console.warn(`[IPN] Transaction not found: ${txnId}`);
    } else {
      tx.rawIPN = parsed;
      tx.updatedAt = new Date();

      if (status === 100) {
        // Perform withdrawal
        const withdrawal = await client.createWithdrawal({
          currency,
          amount,
          address: COLD_WALLET_ADDRESS,
          auto_confirm: 1,
        });

        await sendEmail(
          merchantEmail,
          "New Payment Confirmed",
          `
          <h2>New Payment Received</h2>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Coin:</strong> ${currency}</p>
          <p><strong>Status:</strong> Confirmed</p>
          `
        );

        console.log("[IPN] Withdrawal initiated:", withdrawal);
        tx.status = "withdrawn";
      } else if (status < 0) {
        tx.status = "failed";
      } else {
        tx.status = "confirmed"; // awaiting withdrawal maybe
      }

      await tx.save();
    }
  } catch (err: any) {
    console.error("[IPN] DB or withdrawal error:", err.message || err);
  }

  res.status(200).send("IPN received");
});

export default router;
