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

export default router;
