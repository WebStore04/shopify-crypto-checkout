import { Router } from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/pay", async (_req, res) => {
  const { amount, coin } = _req.body;

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
        "Content-TYpe": "application/x-www-form-urlencoded",
        HMAC: signature,
      },
      body: postData,
    });

    const data = await response.json();
    if (data.error === "ok") {
      res.json(data.result);
    } else {
      res.status(400).json({ error: data.error });
    }
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
