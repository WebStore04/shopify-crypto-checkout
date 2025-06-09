import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ["coinpayments", "mercuryo"],
    required: true,
  },
  txId: { type: String, required: true, unique: true }, // CoinPayments
  externalId: { type: String, required: true, unique: true }, // Mercuryo
  coin: { type: String, required: true },
  amount: { type: Number, required: true }, // total charged (102%)
  merchantReceived: { type: Number, required: true }, // 100%
  adminFee: { type: Number, required: true }, // 2%
  address: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "withdrawn", "failed"],
    default: "pending",
  },
  rawIPN: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

export default mongoose.model("Transaction", transactionSchema);
