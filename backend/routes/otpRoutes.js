import express from "express";

import {
  sendOTP,
  verifyOTP,
} from "../controllers/otpController.js";

import {
  otpRequestLimiter,
  otpVerifyLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/send", otpRequestLimiter, sendOTP);
router.post("/verify", otpVerifyLimiter, verifyOTP);

export default router;