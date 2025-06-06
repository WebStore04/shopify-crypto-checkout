import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import testRoutes from "./routes/test";
import payRoutes from "./routes/pay";
import tokenRoutes from "./routes/token";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", testRoutes);
app.use("/api", payRoutes);
app.use("/api", tokenRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
