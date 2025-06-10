import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import { connectDB } from "./db";

import testRoutes from "./routes/test";
import coinpayRoutes from "./routes/coinPaymentsPay";
import tokenRoutes from "./routes/token";
import coinipnRoutes from "./routes/coinPaymentsIpn";
import mercuryoWebhookIpnRoutes from "./routes/mercuryoWebhookIpn";
import transactionsRoutes from "./routes/transaction";

dotenv.config();

const app = express();

connectDB();

app.use(cors());

app.use("/api/ipn", bodyParser.raw({ type: "*/*" }));
app.use("/api/mercuryo/webhook", bodyParser.raw({ type: "*/*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", testRoutes);
app.use("/api", coinipnRoutes);
app.use("/api", tokenRoutes);
app.use("/api", coinipnRoutes);

app.use("/api", mercuryoWebhookIpnRoutes);
app.use("/api", transactionsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
