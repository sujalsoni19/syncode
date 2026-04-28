import rateLimit from "express-rate-limit";

export const runCodeLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  message: "Too many executions. Try again later.",
});