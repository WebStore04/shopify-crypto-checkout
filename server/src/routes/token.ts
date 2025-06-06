import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.get("/token", (_req, res) => {
  const token = jwt.sign({ role: "user" }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  res.json("Bearer " + token);
});

export default router;
