import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignInModal({ open, onClose }: SignInModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await apiRequest("POST", "/api/auth/send-otp", { phone });
      return res.json();
    },
    onSuccess: () => {
      setStep("otp");
      setError("");
    },
    onError: () => {
      setError("Failed to send OTP. Check your phone number.");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { phone: string; otp: string; name: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", data);
      return res.json();
    },
    onSuccess: (data: { success: boolean; user: { id: string; name: string; phone: string } }) => {
      login(data.user);
      resetAndClose();
    },
    onError: () => {
      setError("Invalid OTP. Please try again.");
    },
  });

  const resetAndClose = () => {
    setStep("phone");
    setPhone("");
    setName("");
    setOtp("");
    setError("");
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

  const handleVerifyOtp = () => {
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    verifyOtpMutation.mutate({ phone, otp, name });
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
              {step === "phone" ? "Enter your phone number to get started" : "Enter the 6-digit OTP sent to your phone"}
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
            <div className="space-y-3">
              <input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-otp"
              />
              {error && <p className="text-xs text-red-500 font-medium" data-testid="text-otp-error">{error}</p>}
              <button
                onClick={handleVerifyOtp}
                disabled={verifyOtpMutation.isPending}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
                data-testid="button-verify-otp"
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Sign In"}
              </button>
              <button
                onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
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
