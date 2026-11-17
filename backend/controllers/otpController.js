import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import OTP from "../models/OTP.js";
import sendOTPEmail from "../utils/sendEmail.js";
 

const OTP_EXPIRY = 5 * 60 * 1000;
const RESEND_COOLDOWN = 30 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;
const RESEND_WINDOW = 15 * 60 * 1000;

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Generate and send OTP
export const sendOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    let record = await OTP.findOne({ email });
    const now = Date.now();

    if (record && record.verifiedAt) {
      return res.status(409).json({
        success: false,
        message: "This email has already been verified.",
      });
    }

    if (record && record.expiresAt.getTime() > now) {
      const elapsed = now - record.lastSentAt.getTime();

      if (elapsed < RESEND_COOLDOWN) {
        const retryAfter = Math.ceil(
          (RESEND_COOLDOWN - elapsed) / 1000
        );

        return res.status(429).json({
          success: false,
          message: `Please wait ${retryAfter} seconds before requesting another OTP.`,
          retryAfter,
        });
      }
    }

    if (!record) {
      record = new OTP({
        email,
        otpHash: "pending",
        expiresAt: new Date(0),
        lastSentAt: new Date(0),
      });
    }

    // Reset resend window after 15 minutes.
    if (now - record.windowStartedAt.getTime() > RESEND_WINDOW) {
      record.resendCount = 0;
      record.windowStartedAt = new Date(now);
    }

    if (record.resendCount >= MAX_RESENDS) {
      return res.status(429).json({
        success: false,
        message: "Resend limit reached. Try again after 15 minutes.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Send first. Do not save a new OTP if email delivery fails.
    await sendOTPEmail(email, otp);

    record.otpHash = otpHash;
    record.expiresAt = new Date(now + OTP_EXPIRY);
    record.lastSentAt = new Date(now);
    record.attempts = 0;
    record.resendCount += 1;
    record.verifiedAt = null;

    await record.save();

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email.",
      expiresIn: 300,
      resendAfter: 30,
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP. Please try again.",
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp =
      typeof req.body.otp === "string" ? req.body.otp.trim() : "";

    if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email and 6-digit OTP.",
      });
    }

    const record = await OTP.findOne({ email });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (record.verifiedAt) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified.",
      });
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);

    if (!isMatch) {
      record.attempts += 1;
      await record.save();

      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining.`,
        attemptsRemaining: MAX_ATTEMPTS - record.attempts,
      });
    }

    record.verifiedAt = new Date();
    record.otpHash = "VERIFIED";
    await record.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      verified: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Verification failed. Please try again.",
    });
  }
};

