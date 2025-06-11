import mongoose, { Schema, Document } from "mongoose";

// Define the History type
interface History {
  status: "pending" | "confirmed" | "withdrawn" | "failed";
  updatedAt: Date;
  updatedBy?: string;
  reason?: string;
}

// Define the Transaction document interface
interface TransactionDocument extends Document {
  txId: string;
  coin: string;
  amount: number;
  merchantReceived: number;
  adminFee: number;
  address: string;
  buyerEmail: string;
  status: "pending" | "confirmed" | "withdrawn" | "failed";
  fraudFlag: "high risk" | "low risk";
  rawIPN: object;
  history: History[];
  expiresAt?: Date;
  metadata?: Record<string, any>;
  currency: "USD" | "EUR" | "USDT";
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema: Schema<TransactionDocument> = new mongoose.Schema(
  {
    txId: { type: String, required: true, unique: true },
    coin: { type: String, required: true },
    amount: { type: Number, required: true },
    merchantReceived: { type: Number, required: true },
    adminFee: { type: Number, required: true },
    address: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "withdrawn", "failed"],
      default: "pending",
    },
    fraudFlag: {
      type: String,
      enum: ["high risk", "low risk"],
      default: "low risk",
    },
    rawIPN: { type: Object },
    history: [
      {
        status: {
          type: String,
          enum: ["pending", "confirmed", "withdrawn", "failed"],
          required: true,
        },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: String },
        reason: { type: String },
      },
    ],
    expiresAt: { type: Date },
    metadata: { type: Map, of: Schema.Types.Mixed },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "EUR", "USDT"],
    },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexing for better query performance
transactionSchema.index({ txId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Create the model
const Transaction = mongoose.model<TransactionDocument>(
  "Transaction",
  transactionSchema
);

export default Transaction;
