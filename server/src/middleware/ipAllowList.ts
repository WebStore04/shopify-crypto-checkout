import { Request, Response, NextFunction } from "express";
import ipRangeCheck from "ip-range-check";

// List of allowed IPs or IP ranges
const ALLOWED_IPS = ["203.0.113.0/24", "198.51.100.1", "0.0.0.0/0"];

export const ipAllowlist = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (typeof ip === "string" && ipRangeCheck(ip, ALLOWED_IPS)) {
    // IP is allowed, continue processing the request
    next();
  } else {
    // IP is not allowed
    console.log(`Blocked IP: ${ip}`);
    res.status(403).json({ error: "Forbidden: IP not allowed" });
    return;
  }
};
