import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth, type AuthUser } from "@/lib/auth";
import { CITIES } from "@shared/schema";
import { useLocation } from "wouter";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return phone;
  const last4 = digits.slice(-4);
  const first2 = digits.slice(0, 2);
  return `+91 ${first2}XXX XX${last4}`;
}

export function SignInModal({ open, onClose }: SignInModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Tirupati");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await apiRequest("POST", "/api/auth/send-otp", { phone });
      return res.json();
    },
    onSuccess: () => {
      setStep("otp");
      setError("");
      startCountdown();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    },
    onError: () => {
      setError("Failed to send OTP. Check your phone number.");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { phone: string; otp: string; name: string; city: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", data);
      return res.json();
    },
    onSuccess: (data: { success: boolean; user: AuthUser }) => {
      login(data.user);
      const isNewUser = !data.user.quizCompleted;
      resetAndClose();
      if (isNewUser) {
        navigate("/onboarding");
      }
    },
    onError: () => {
      setError("Invalid OTP. Please try again.");
    },
  });

  const resetAndClose = () => {
    setStep("phone");
    setPhone("");
    setName("");
    setCity("Tirupati");
    setOtpDigits(["", "", "", "", "", ""]);
    setError("");
    setCountdown(0);
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  const handleSendOtp = () => {
    setError("");
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    if (!name || name.length < 2) {
      setError("Enter your name (minimum 2 characters)");
      return;
    }
    sendOtpMutation.mutate(phone);
  };

  const handleResendOtp = () => {
    setOtpDigits(["", "", "", "", "", ""]);
    setError("");
    sendOtpMutation.mutate(phone);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullOtp = newDigits.join("");
    if (fullOtp.length === 6) {
      verifyOtpMutation.mutate({ phone, otp: fullOtp, name, city });
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    if (pasted.length === 6) {
      verifyOtpMutation.mutate({ phone, otp: pasted, name, city });
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />
        <motion.div
          className="relative w-full max-w-sm mx-4 bg-background rounded-2xl shadow-2xl p-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          data-testid="modal-sign-in"
        >
          <button
            onClick={resetAndClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            data-testid="button-close-sign-in"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center mb-5">
            <div className="text-3xl mb-2">📱</div>
            <h2 className="font-serif text-xl font-bold text-primary">Sign In</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {step === "phone" ? "Enter your details to get started" : (
                <>Enter the 6-digit OTP sent to<br /><span className="font-mono font-semibold text-foreground">{maskPhone(phone)}</span></>
              )}
            </p>
          </div>

          {step === "phone" ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-signin-name"
              />
              <input
                type="tel"
                placeholder="Phone Number (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-signin-phone"
              />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="select-signin-city"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {error && <p className="text-xs text-red-500 font-medium" data-testid="text-signin-error">{error}</p>}
              <button
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
                data-testid="button-send-otp"
              >
                {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-13 text-center text-xl font-mono font-bold rounded-xl border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    data-testid={`input-otp-${i}`}
                  />
                ))}
              </div>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-muted-foreground" data-testid="text-otp-timer">
                    Resend OTP in 0:{countdown.toString().padStart(2, "0")}
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={sendOtpMutation.isPending}
                    className="text-xs text-primary font-semibold hover:underline disabled:opacity-50"
                    data-testid="button-resend-otp"
                  >
                    {sendOtpMutation.isPending ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>

              {error && <p className="text-xs text-red-500 font-medium text-center" data-testid="text-otp-error">{error}</p>}

              {verifyOtpMutation.isPending && (
                <p className="text-xs text-muted-foreground text-center">Verifying...</p>
              )}

              <button
                onClick={() => { setStep("phone"); setOtpDigits(["", "", "", "", "", ""]); setError(""); setCountdown(0); if (timerRef.current) clearInterval(timerRef.current); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                data-testid="button-back-to-phone"
              >
                Change phone number
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
