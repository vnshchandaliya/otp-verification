
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    resendCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    windowStartedAt: {
      type: Date,
      default: Date.now,
    },

    lastSentAt: {
      type: Date,
      required: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model("OTP", otpSchema);
