import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import Coinpayments from "coinpayments";
import { authenticateJWT } from "../middleware/auth";
import Transaction from "../models/Transaction";

dotenv.config();

const router = Router();
interface PayRequestBody {
  amount: string;
  coin: string;
  email: string;
}

interface PayRequestUser {
  email?: string;
}

const client = new Coinpayments({
  key: process.env.COINPAYMENTS_CLIENT_API_KEY!,
  secret: process.env.COINPAYMENTS_CLIENT_SECRET!,
});

router.post(
  "/coinpayments/pay",
  authenticateJWT,
  async (
    _req: Request<{}, {}, PayRequestBody> & { user?: PayRequestUser },
    res: Response
  ) => {
    const { amount, coin, email } = _req.body;

    const errors: Record<string, string> = {};

    const baseAmount = parseFloat(amount);
    if (!amount || isNaN(baseAmount) || baseAmount <= 0) {
      errors.amount = "Invalid amount";
    }

    const supportedCoins = ["LTCT", "USDT.TRC20"];
    if (!coin || !supportedCoins.includes(coin)) {
      errors.coin = "Unsupported coin";
    }

    if (Object.keys(errors).length !== 0) {
      res.status(400).json(errors);
      return;
    }

    const totalAmount = parseFloat((baseAmount * 1.02).toFixed(8));
    const adminFee = parseFloat((baseAmount * 0.02).toFixed(8));
    const merchantReceives = baseAmount;

    console.log("Creating transaction with:", {
      baseAmount,
      totalAmount,
      adminFee,
      coin,
      email,
    });

    try {
      const transaction = await client.createTransaction({
        amount: merchantReceives,
        currency1: "USD",
        currency2: coin,
        buyer_email: _req.user?.email || email || "",
        ipn_url: `${process.env.BASE_URL}/api/ipn`,
        success_url: `${process.env.BASE_URL}/api/success`,
        cancel_url: `${process.env.BASE_URL}/api/cancel`,
      });

      console.log("CoinPayments transaction:", transaction);

      await Transaction.create({
        txId: transaction.txn_id,
        coin,
        amount: totalAmount, // the 102%
        merchantReceived: parseFloat(amount),
        adminFee,
        address: transaction.address,
        buyerEmail: _req.user?.email || email || "",
        status: "pending",
      });

      res.json({
        address: transaction.address,
        amount: transaction.amount,
        checkout_url: transaction.checkout_url,
        qrcode_url: transaction.qrcode_url,
      });
    } catch (err: any) {
      console.error("[/pay] CoinPayments error:", err);
      res.status(500).json({
        error:
          err?.error?.extra?.data?.error ||
          err?.message ||
          "CoinPayments API call failed",
      });
    }
  }
);

export default router;
