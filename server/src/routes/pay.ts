import { Router, Request, Response } from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import dotenv from "dotenv";

import { authenticateJWT } from "../middleware/auth";

dotenv.config();

const router = Router();

interface PayRequestBody {
  amount: string;
  coin: string;
}

router.post(
  "/pay",
  authenticateJWT,
  async (_req: Request<{}, {}, PayRequestBody>, res: Response) => {
    const { amount, coin } = _req.body;

    let errors = {};

    const parseAmount = parseFloat(amount);
    if (!amount || isNaN(parseAmount) || parseAmount <= 0) {
      Object.assign(errors, { amount: "Invalid ammount" });
    }

    const supportedCoins = ["BTC", "ETH", "LTC"];
    if (!coin || !supportedCoins.includes(coin)) {
      Object.assign(errors, { coin: "Unsupported coin" });
    }

    if (Object.keys(errors).length !== 0) {
      res.status(400).json(errors);
    }

    console.log("Creating transaction with:", { amount, coin });

    const API_KEY = process.env.COINPAYMENTS_CLIENT_API_KEY!;
    const API_SECRET = process.env.COINPAYMENTS_CLIENT_SECRET!;
    const url = process.env.COINPAYMENTS_CLIENT_API_URL!;

    const params = new URLSearchParams();
    params.append("version", "1");
    params.append("cmd", "create_transaction");
    params.append("key", API_KEY);
    params.append("amount", amount);
    params.append("currency1", "USD");
    params.append("currency2", coin);
    params.append("format", "json");

    const postData = params.toString();

    const signature = crypto
      .createHmac("sha512", API_SECRET)
      .update(postData)
      .digest("hex");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          HMAC: signature,
        },
        body: postData,
      });

      const data = await response.json();
      console.log("CoinPayments response:", data);
      if (data.error === "ok") {
        res.json({
          address: data.result.address,
          amount: data.result.amount,
          checkout_url: data.result.checkout_url,
          qrcode_url: data.result.qrcode_url,
        });
      } else {
        res.status(400).json({ error: data.error });
      }
    } catch (err) {
      console.error("[/pay] Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
