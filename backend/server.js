
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import otpRoutes from "./routes/otpRoutes.js";

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

// Parse incoming JSON requests
app.use(express.json({ limit: "10kb" }));

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OTP Verification API is running.",
  });
});

// OTP routes
app.use("/api/otp", otpRoutes);

// Server port
const PORT = process.env.PORT || 5007;

// Start server
const startServer = async () => {
  try {
    // Connect MongoDB first
    await connectDB();

    // Start Express server after DB connection
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
