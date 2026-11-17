import { useRef } from "react";

export default function OTPInput({ otp, setOtp, disabled }) {
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const updated = Array(6).fill("");

    pasted.split("").forEach((digit, index) => {
      updated[index] = digit;
    });

    setOtp(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(element) => (inputRefs.current[index] = element)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="otp-input"
        />
      ))}
    </div>
  );
}