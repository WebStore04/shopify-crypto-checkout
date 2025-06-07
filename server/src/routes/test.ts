import { Router } from "express";
import Coinpayments from "coinpayments";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const client = new Coinpayments({
  key: process.env.COINPAYMENTS_CLIENT_API_KEY!,
  secret: process.env.COINPAYMENTS_CLIENT_SECRET!,
});

router.get("/test", async (_req, res) => {
  try {
    const info = await client.getBasicInfo();
    res.json(info);
  } catch (err: any) {
    console.error("CoinPayments API call failed:", err);
    res.status(500).json({ error: err.extra.data.error });
  }
});

export default router;
