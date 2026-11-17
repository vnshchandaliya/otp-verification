import rateLimit from "express-rate-limit";


const otpRequestLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const otpVerifyLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Please try again later.",
  },

})

export { otpRequestLimiter, otpVerifyLimiter };