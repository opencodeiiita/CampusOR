"use client";

import { useAuth } from "../../context/AuthContext";
import Footer from "../../../components/footer/Footer";
import { apiService } from "@/app/services/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await apiService.post("/auth/login", { email, password }, false);

      login(data.token, data.user);

      const next = searchParams.get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;

      const fallbackRoute =
        data.user?.role === "admin"
          ? "/admin"
          : data.user?.role === "operator"
            ? "/dashboard/operator"
            : "/dashboard/user";

      router.replace(safeNext || fallbackRoute);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="brand-shell min-h-screen text-slate-900">
      <nav className="sticky top-0 z-30 border-b border-[var(--color-brand-line)] bg-white/76 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="brand-wordmark">
              <span className="brand-wordmark-mark">u</span>
              <span className="brand-wordmark-name">uniq</span>
            </Link>

            <div className="hidden items-center gap-3 text-sm font-medium md:flex">
              <Link
                href="/signup"
                className="text-slate-500 transition-all duration-300 hover:text-slate-900"
              >
                Sign Up
              </Link>
              <Link href="/login" className="brand-primary-button rounded-full px-4 py-2 text-sm">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
        <form
          onSubmit={handleLogin}
          className="brand-panel w-full max-w-md rounded-[28px] p-8 transition-all duration-300 hover:shadow-2xl"
        >
          <span className="brand-badge mb-5">welcome back</span>
          <h1 className="mb-2 text-center text-3xl font-semibold text-slate-900">
            Login to uniq
          </h1>
          <p className="mb-6 text-center text-sm text-slate-600">
            Continue with your live queue workspace.
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            className="brand-input mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="brand-input mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="brand-primary-button w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--color-brand-deep)]">
              Sign up
            </Link>
          </p>
        </form>
      </div>

      <Footer />
    </main>
  );
}
