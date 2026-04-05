"use client";

import Footer from "../../../components/footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const OTP_INPUT_LENGTH = 6;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    initialEmail ? `We sent a 6-digit code to ${initialEmail}.` : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const destinationRoute = useMemo(() => {
    return (role?: string) => {
      if (role === "admin") return "/admin";
      if (role === "operator") return "/dashboard/operator";
      return "/dashboard/user";
    };
  }, []);

  const handleOtpChange = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, OTP_INPUT_LENGTH);
    setOtp(sanitized);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email) {
      setError("Email is required to verify your account.");
      return;
    }

    if (otp.length !== OTP_INPUT_LENGTH) {
      setError(`Enter the ${OTP_INPUT_LENGTH}-digit code from your email.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiService.post("/auth/verify-email", { email, otp }, false);
      login(data.token, data.user);
      router.replace(destinationRoute(data.user?.role));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("Add your email to resend a new code.");
      return;
    }

    setIsResending(true);
    try {
      const data = await apiService.post("/auth/resend-otp", { email }, false);
      setInfo(data.message || "A fresh code is on its way.");
      setCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="brand-shell min-h-screen text-slate-900">
      <nav className="sticky top-0 z-30 border-b border-[var(--color-brand-line)] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="brand-wordmark">
              <span className="brand-wordmark-mark">u</span>
              <span className="brand-wordmark-name">uniq</span>
            </Link>
            <div className="hidden items-center gap-3 text-sm font-medium md:flex">
              <Link href="/login" className="text-slate-500 transition-all duration-300 hover:text-slate-900">
                Back to Login
              </Link>
              <Link href="/signup" className="brand-primary-button rounded-full px-4 py-2 text-sm">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
        <form
          onSubmit={handleVerify}
          className="brand-panel w-full max-w-md rounded-[28px] p-8 transition-all duration-300 hover:shadow-2xl"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-deep)]">
                Step 2 of 2
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">Verify your email</h1>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(133,216,206,0.16)] font-bold text-[var(--color-brand-deep)]">
              OTP
            </div>
          </div>

          <p className="mb-4 text-sm text-slate-600">
            Enter the 6-digit code we emailed you to activate your uniq account.
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {info && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {info}
            </div>
          )}

          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="brand-input mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="mb-2 block text-sm font-medium text-slate-700">6-digit code</label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={OTP_INPUT_LENGTH}
            placeholder="• • • • • •"
            className="brand-input mb-4 text-center text-xl tracking-[0.6em]"
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
          />

          <button
            type="submit"
            className="brand-primary-button w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify and continue"}
          </button>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className="font-semibold text-[var(--color-brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : isResending ? "Sending..." : "Resend code"}
            </button>
            <Link href="/signup" className="text-slate-500 hover:text-slate-800">
              Use a different email
            </Link>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}
