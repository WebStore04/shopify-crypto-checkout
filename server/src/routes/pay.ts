import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import Coinpayments from "coinpayments";
import { authenticateJWT } from "../middleware/auth";

dotenv.config();

const router = Router();
interface PayRequestBody {
  amount: string;
  coin: string;
}

interface PayRequestUser {
  email?: string;
}

const client = new Coinpayments({
  key: process.env.COINPAYMENTS_CLIENT_API_KEY!,
  secret: process.env.COINPAYMENTS_CLIENT_SECRET!,
});

router.post(
  "/pay",
  authenticateJWT,
  async (
    _req: Request<{}, {}, PayRequestBody> & { user?: PayRequestUser },
    res: Response
  ) => {
    const { amount, coin } = _req.body;

    const errors: Record<string, string> = {};

    const parseAmount = parseFloat(amount);
    if (!amount || isNaN(parseAmount) || parseAmount <= 0) {
      errors.amount = "Invalid amount";
    }

    const supportedCoins = ["BTC", "ETH", "LTC", "USDT.TRC20"];
    if (!coin || !supportedCoins.includes(coin)) {
      errors.coin = "Unsupported coin";
    }

    if (Object.keys(errors).length !== 0) {
      res.status(400).json(errors);
      return;
    }

    console.log("Creating transaction with:", { amount, coin });

    try {
      const transaction = await client.createTransaction({
        amount: parseAmount,
        currency1: "USD",
        currency2: coin,
        buyer_email: _req.user?.email || "",
      });

      console.log("CoinPayments transaction:", transaction);

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
