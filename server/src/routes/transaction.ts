import { Router, Request, Response } from "express";
import Transaction from "../models/Transaction";

const router = Router();

// Route to fetch transaction details by txId
router.get("/tx/:id", async (req: Request, res: Response) => {
  const { id } = req.params; // Get the transaction ID from the URL

  try {
    // Query the database for the transaction with the provided txId
    const transaction = await Transaction.findOne({ txId: id });

    // If no transaction found, return 404
    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
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
  const { txId, status, dateRange, amountRange } = req.body; // Extract filter criteria from the request body

  const filter: any = {}; // Initialize the filter object

  // Add filters dynamically based on the request body
  if (txId) {
    filter.txId = { $regex: new RegExp(txId, "i") }; // Case-insensitive search
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
    // Query the database using the filter object
    const transactions = await Transaction.find(filter);

    // Return the filtered list of transactions
    res.status(200).json(transactions);
    return;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});

export default router;
