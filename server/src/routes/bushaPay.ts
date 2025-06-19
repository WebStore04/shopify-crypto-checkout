// routes/pay.ts
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { authenticateJWT } from "../middleware/auth";
import Transaction from "../models/Transaction";
dotenv.config();

const router = express.Router();

router.post("/busha/pay", authenticateJWT, async (req, res) => {
  const { email, amount } = req.body;
  if (!email || !amount || isNaN(amount) || amount <= 0) {
    res.status(400).json({ error: "Invalid email or amount" });
    return;
  }

  try {
    // Convert USD to cents
    const cents = Math.round(parseFloat(amount) * 100);

    const resp = await axios.post(
      "https://api.commerce.busha.co/payment_links",
      {
        name: `Order for ${email}`,
        description: `Purchase of $${amount} USDT`,
        payment_link_type: "fixed_price",
        local_amount: cents,
        local_currency: "USD",
        requested_info: ["email"],
        success_url: process.env.REDIRECT_URL,
        cancel_url: process.env.CANCEL_URL,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BUSHA_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { url, id } = resp.data;
    await Transaction.create({
      email,
      amountUSD: parseFloat(amount),
      bushaReference: id,
      status: "pending",
    });

    res.json({ checkout_url: url, reference: id });
  } catch (err: any) {
    console.error(
      "Busha /payment_links error:",
      err.response?.data || err.message
    );
    const msg = err.response?.data?.message || "Busha integration error";
    res.status(err.response?.status || 500).json({ error: msg });
  }
});

export default router;
