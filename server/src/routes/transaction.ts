import { Router, Request, Response } from "express";
import Transaction from "../models/Transaction";
import axios from "axios";

const router = Router();

// Route to fetch transaction details by txId
router.get("/tx/:id", async (req: Request, res: Response) => {
  const { id } = req.params; // Get the transaction ID from the URL

  try {
    // Query the database for the transaction with the provided txId
    const transaction = await Transaction.findOne({ txId: id });

    // If no transaction found, return 404
    if (!transaction) {
      res.status(404).json({ error: `Transaction with txId ${id} not found` });
      return;
    }

    // Return the transaction details
    res.status(200).json(transaction);
    return;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});

// POST route to filter/search transactions
router.post("/tx", async (req: Request, res: Response) => {
  const {
    txId,
    status,
    dateRange,
    amountRange,
    page = 1,
    limit = 10,
  } = req.body;
  const filter: any = {};

  if (txId) {
    filter.txId = { $regex: new RegExp(txId, "i") };
  }
  if (status) {
    filter.status = status;
  }
  if (dateRange && dateRange.start && dateRange.end) {
    filter.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end),
    };
  }
  if (amountRange && amountRange.min && amountRange.max) {
    filter.amount = { $gte: amountRange.min, $lte: amountRange.max };
  }

  try {
    // Pagination logic
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter).skip(skip).limit(limit);

    const totalTransactions = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(totalTransactions / limit);

    res.status(200).json({
      transactions,
      pagination: {
        totalTransactions,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
    return;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try again later." });
    return;
  }
});

router.get("/transactions", async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query; // Page and limit from query parameters

  try {
    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await Transaction.find()
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order (optional)

    const totalTransactions = await Transaction.countDocuments();
    const totalPages = Math.ceil(totalTransactions / Number(limit));

    res.status(200).json({
      transactions,
      pagination: {
        totalTransactions,
        totalPages,
        currentPage: Number(page),
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try again later." });
  }
});

// Route to approve a transaction
router.post("/tx/:txnId/approve", async (req: Request, res: Response) => {
  // Approve logic here
  res.json(true);
  return;
});

// Route to freeze a transaction
router.post("/tx/:id/freeze", async (req: Request, res: Response) => {
  const { id } = req.params; // Transaction ID from URL

  try {
    // Find the transaction by ID and update the status to 'frozen'
    const transaction = await Transaction.findOneAndUpdate(
      { txId: id },
      { isFrozen: true },
      { new: true } // Return the updated transaction
    );

    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    res.status(200).json(transaction); // Return updated transaction
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// Route to unfreeze a transaction
router.post("/tx/:id/unfreeze", async (req: Request, res: Response) => {
  const { id } = req.params; // Transaction ID from URL

  try {
    // Find the transaction by ID and update the status to 'confirmed' (or another state)
    const transaction = await Transaction.findOneAndUpdate(
      { txId: id },
      { isFrozen: false }, // or another status like 'released'
      { new: true } // Return the updated transaction
    );

    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    res.status(200).json(transaction); // Return updated transaction
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unfreeze transaction" });
  }
});

// Route to refund a transaction
router.post(
  "/tx/:txnId/refund-original",
  async (req: Request, res: Response) => {
    const { txId } = req.params;
    try {
      // Fetch the transaction from the database
      const transaction = await Transaction.findOne({ txId });
      if (!transaction) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      // Get the original card information from the transaction (e.g., from rawIPN)
      const originalCardInfo = transaction.rawIPN;

      // Trigger the refund through Mercuryo API (using the original card info)
      const response = await axios.post(
        "https://api.mercuryo.io/v1.6/withdraw",
        {
          amount: transaction.amount,
          currency: "USDT",
          wallet: originalCardInfo,
          user_email: transaction.buyerEmail,
          reason: "Refund to original card",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCURYO_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Update the transaction status to "refunded"
        transaction.status = "refunded";
        await transaction.save();

        res.status(200).json({
          success: true,
          message: "Refund to original card successful",
        });
      } else {
        res.status(400).json({ error: "Mercuryo refund failed" });
      }
    } catch (err) {
      console.error("Error processing refund to original card:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
