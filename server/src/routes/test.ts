import { Router } from "express";
import fetch from "node-fetch";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const router = Router();

router.get("/test", async (_req, res) => {
  const apiKey = process.env.COINPAYMENTS_CLIENT_API_KEY!;
  const apiSecret = process.env.COINPAYMENTS_CLIENT_SECRET!;

  const body = new URLSearchParams();
  body.append("version", "1");
  body.append("key", apiKey ?? "");
  body.append("cmd", "get_basic_info");
  body.append("format", "json");

  const hmac = crypto
    .createHmac("sha256", apiSecret)
    .update(body.toString())
    .digest("hex");

  try {
    const response = await fetch("https://www.coinpayments.net/api.php", {
      method: "POST",
      body,
      headers: {
        HMAC: hmac,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data: unknown = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "CoinPayments API call failed" });
  }
});

router.get("/test/generate-token", (_req, res) => {
  const token = jwt.sign({ role: "user" }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
  res.json("Bearer " + token);
});

export default router;
