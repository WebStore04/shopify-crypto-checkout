import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import testRoutes from "./routes/test";
import payRoutes from "./routes/pay";
import tokenRoutes from "./routes/token";
import ipnRoutes from "./routes/ipn";

dotenv.config();

const app = express();

app.use(cors());

app.use("/api/ipn", bodyParser.raw({ type: "*/*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", testRoutes);
app.use("/api", payRoutes);
app.use("/api", tokenRoutes);
app.use("/api", ipnRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
