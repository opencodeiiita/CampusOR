"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Footer from "../../../components/footer/Footer";
import { apiService } from "../../services/api";

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
    initialEmail ? `We sent a 6-digit code to ${initialEmail}.` : ""
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
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 scroll-smooth">
      <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/landing" className="flex items-center gap-3 group">
              <img
                src="/logo/LOGO.svg"
                alt="CampusOR logo"
                className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] md:h-14"
              />
            </Link>
            <div className="hidden items-center gap-3 text-sm font-medium md:flex">
              <Link
                href="/login"
                className="text-slate-500 transition-all duration-300 hover:text-slate-900 hover:scale-105"
              >
                Back to Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-slate-900 px-4 py-2 text-white transition-all duration-300 hover:bg-slate-800 hover:scale-105 hover:shadow-lg"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
        <form
          onSubmit={handleVerify}
          className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 transition-all duration-300 hover:shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-sky-600 font-semibold">
                Step 2 of 2
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Verify your email
              </h1>
            </div>
            <div className="h-12 w-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              OTP
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            Enter the 6-digit code we emailed you to activate your account.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {info && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
              {info}
            </div>
          )}

          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border border-slate-300 px-4 py-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="text-sm font-medium text-slate-700 mb-2 block">
            6-digit code
          </label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={OTP_INPUT_LENGTH}
            placeholder="• • • • • •"
            className="tracking-[0.6em] text-center text-xl w-full border border-slate-300 px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify and continue"}
          </button>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className="text-sky-600 hover:text-sky-700 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : isResending
                  ? "Sending..."
                  : "Resend code"}
            </button>
            <Link
              href="/signup"
              className="text-slate-500 hover:text-slate-800"
            >
              Use a different email
            </Link>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}
