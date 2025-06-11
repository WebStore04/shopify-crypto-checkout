import { Router, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import Transaction from "../models/Transaction";
import { sendEmail } from "../utils/sendEmail";
import { authenticateJWT } from "../middleware/auth";
import { validateEmail } from "../utils/validateEmail"; // Assuming you add a validation function for email

// Load environment variables
dotenv.config();

// Set up router
const router = Router();

// Mercuryo API credentials
const MERCURYO_API_URL = "https://api.mercuryo.io/v1.6/withdraw";
const MERCURYO_API_KEY = process.env.MERCURYO_API_KEY!;
const MERCURYO_COLD_WALLET_ADDRESS = process.env.COLD_WALLET_ADDRESS!;

// Withdraw route to handle automatic withdrawal to cold wallet
router.post(
  "/mercuryo/withdraw",
  authenticateJWT,
  async (req: Request, res: Response) => {
    const { amount, coin, email } = req.body;

    // Validate request
    if (!amount || !coin || !email) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Check for valid email format
    if (!validateEmail(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    // Check if the coin is valid (e.g., supported by the Mercuryo API)
    const validCoins = ["USDT.TRC20", "BTC", "ETH", "LTC"];
    if (!validCoins.includes(coin)) {
      res.status(400).json({ error: "Invalid or unsupported coin" });
      return;
    }

    try {
      // Check if the amount is valid (greater than 0)
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ error: "Invalid amount" });
        return;
      }

      // Construct withdrawal request payload
      const withdrawalPayload = {
        amount: parsedAmount.toFixed(2),
        currency: coin, // For example, "USDT"
        wallet: MERCURYO_COLD_WALLET_ADDRESS, // Cold wallet address
        user_email: email,
      };

      // Call Mercuryo API to initiate withdrawal
      const response = await axios.post(MERCURYO_API_URL, withdrawalPayload, {
        headers: {
          Authorization: `Bearer ${MERCURYO_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      // Check if the withdrawal was successful
      if (response.data.status === "success") {
        // Log the transaction to the database
        const tx = await Transaction.create({
          txId: response.data.transaction_id,
          coin,
          amount: parsedAmount,
          status: "withdrawn",
          address: MERCURYO_COLD_WALLET_ADDRESS,
          buyerEmail: email,
          rawIPN: response.data,
          history: [
            {
              status: "withdrawn",
              updatedAt: new Date(),
              updatedBy: "system", // Could be "merchant" or "system"
              reason: "Withdrawal initiated via API",
            },
          ],
        });

        // Send email notification to the merchant about the successful withdrawal
        await sendEmail(
          process.env.MERCHANT_NOTIFICATION_EMAIL!,
          "Withdrawal Completed",
          `
          <h2>Withdrawal to Cold Wallet Completed</h2>
          <p><strong>Amount:</strong> ${parsedAmount} ${coin}</p>
          <p><strong>Buyer:</strong> ${email}</p>
          <p><strong>Transaction ID:</strong> ${response.data.transaction_id}</p>
          <p><strong>Status:</strong> ${response.data.status}</p>
          `
        );

        console.log("Withdrawal successful, transaction recorded:", tx.txId);

        res.status(200).json({
          success: true,
          transaction_id: response.data.transaction_id,
        });
        return;
      } else {
        // Handle failure case from Mercuryo API
        console.error("[Mercuryo] Withdrawal failed:", response.data.message);
        res
          .status(500)
          .json({ error: "Withdrawal failed", details: response.data.message });
        return;
      }
    } catch (err) {
      console.error("[Mercuryo] Error during withdrawal:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
);

export default router;
