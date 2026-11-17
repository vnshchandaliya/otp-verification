import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LockKeyhole,
} from "lucide-react";

import OTPInput from "./components/OTPInput";
import { sendOTP, verifyOTP } from "./services/otpService";

export default function App() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [step, setStep] = useState("email");
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setTimeout(() => {
      setSeconds((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleSendOTP = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await sendOTP(email);

      setOtp(["", "", "", "", "", ""]);
      setSeconds(response.resendAfter || 30);
      setStep("otp");
      showMessage(response.message, "success");
    } catch (error) {
      const data = error.response?.data;

      showMessage(data?.message || "Unable to send OTP.");

      if (data?.retryAfter) {
        setSeconds(data.retryAfter);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOTP = otp.join("");

    if (enteredOTP.length !== 6) {
      showMessage("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await verifyOTP(email, enteredOTP);

      setStep("success");
      showMessage(response.message, "success");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (seconds > 0 || loading) return;
    await handleSendOTP();
  };

  const maskedEmail = email
    ? email.replace(/^(.{2}).*(@.*)$/, "$1***$2")
    : "";

  return (
    <main className="phone-stage">
      <motion.div
        className="phone-screen"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="phone-content">
          <div className="brand">
            <div className="brand-icon">
              <ShieldCheck size={25} />
            </div>
            <span>SecureAuth</span>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div
                key="email"
                className="screen-body"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="illustration">
                  <Mail size={38} />
                </div>

                <span className="eyebrow">EMAIL VERIFICATION</span>

                <h1>Verify your<br />email address</h1>

                <p className="description">
                  Enter your email address. We'll send you a secure
                  verification code.
                </p>

                <label htmlFor="email">Email address</label>

                <div className="email-field">
                  <Mail size={19} />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleSendOTP();
                    }}
                  />
                </div>

                <button
                  className="primary-button"
                  onClick={handleSendOTP}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send verification code"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                className="screen-body"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="illustration">
                  <LockKeyhole size={38} />
                </div>

                <span className="eyebrow">ONE-TIME PASSWORD</span>

                <h1>Check your<br />inbox</h1>

                <p className="description">
                  We've sent a 6-digit verification code to
                  <strong> {maskedEmail}</strong>
                </p>

                <label>Enter verification code</label>

                <OTPInput
                  otp={otp}
                  setOtp={setOtp}
                  disabled={loading}
                />

                <div className="timer">
                  {seconds > 0
                    ? `Resend code in 00:${String(seconds).padStart(2, "0")}`
                    : "You can request a new code now"}
                </div>

                <button
                  className="primary-button"
                  onClick={handleVerifyOTP}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify email"}
                  {!loading && <ArrowRight size={18} />}
                </button>

                <button
                  className="text-button"
                  onClick={handleResendOTP}
                  disabled={seconds > 0 || loading}
                >
                  <RefreshCw size={15} />
                  Resend code
                </button>

                <button
                  className="text-button"
                  onClick={() => {
                    setStep("email");
                    setMessage("");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  disabled={loading}
                >
                  Change email address
                </button>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                className="screen-body success-body"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="success-icon">
                  <CheckCircle2 size={55} />
                </div>

                <span className="eyebrow">VERIFICATION COMPLETE</span>

                <h1>You're all<br />verified!</h1>

                <p className="description">
                  Your email address {maskedEmail} has been
                  successfully verified.
                </p>

                <button
                  className="primary-button"
                  onClick={() => {
                    setEmail("");
                    setOtp(["", "", "", "", "", ""]);
                    setSeconds(0);
                    setMessage("");
                    setStep("email");
                  }}
                >
                  Done <ArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {message && (
            <div
              className={`feedback ${
                messageType === "success" ? "feedback-success" : ""
              }`}
              role="status"
            >
              {messageType === "success" ? (
                <CheckCircle2 size={17} />
              ) : (
                <AlertCircle size={17} />
              )}
              <span>{message}</span>
            </div>
          )}

          <div className="security-footer">
            <LockKeyhole size={14} />
            <span>Your information is securely protected</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}