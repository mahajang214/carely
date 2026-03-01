import React, { useRef, useState, useEffect } from "react";
import { Button } from "../ui";
import { useToast } from "../ui/ToastProvider";
import { authAPI } from "../../features/auth/authAPI";

const OTPCard = ({
  length = 6,
  onSubmit,
  id,
  isOTPVerified,
  setIsOTPVerified,
}) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(600); // 10 minutes
  const inputsRef = useRef([]);

  // Toast
  const { showToast } = useToast();

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Format to MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(paste)) return;

    const pasteArray = paste.slice(0, length).split("");
    const newOtp = [...otp];

    pasteArray.forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);
  };

  // verify otp
  const handleSubmit = async () => {
    const otpValue = otp.join("");

    if (!id || !otpValue) return showToast("Invalid");

    if (otpValue.length !== length) {
      showToast("Please enter complete OTP");
      return;
    }

    setLoading(true);

    try {
      await authAPI.verifyOtp({ id, otp: otpValue });
      showToast("OTP verified successfully");
      setIsOTPVerified(true);
    } catch (error) {
      console.log("Error status : ", error.response?.status || "Unknown");
      console.log("Error : ", error.message);
      setError("Invalid OTP. Try again.");
      showToast("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (timer > 0) return;

    setTimer(600); // reset back to 10 minutes
    console.log("Call resend OTP API here");
  };

  return (
    <div className="full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-2">Verify OTP</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter the 6-digit code sent to your email
        </p>

        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              maxLength={1}
              ref={(el) => (inputsRef.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant={"secondary"}
          className="w-full "
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="text-center mt-4">
          {timer > 0 ? (
            <p className="text-sm text-gray-500">
              {" "}
              Resend OTP in {formatTime(timer)}
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPCard;
