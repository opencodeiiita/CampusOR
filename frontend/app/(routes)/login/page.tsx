"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Footer from "../../../components/footer/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      login(data.token, data.user);

      const next = searchParams.get("next");
      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//") ? next : null;

      const fallbackRoute =
        data.user?.role === "admin"
          ? "/admin"
          : data.user?.role === "operator"
            ? "/dashboard/operator"
            : "/dashboard/user";

      router.replace(safeNext || fallbackRoute);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth">
      {/* Landing Page Navbar */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur animate-in fade-in slide-in-from-top duration-700 relative">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between relative z-30">
            <Link href="/landing" className="flex items-center gap-3 group">
              <img
                src="/logo/LOGO.svg"
                alt="CampusOR logo"
                className="h-11 w-auto object-contain drop-shadow-[0_4px_12px_rgba(15,23,42,0.18)] transition-transform duration-300 group-hover:scale-[1.03] md:h-14"
              />
            </Link>

            <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
              <a
                href="/landing#solution"
                className="transition-all duration-300 hover:text-slate-900 hover:scale-105"
              >
                Solution
              </a>
              <a
                href="#how"
                className="transition-all duration-300 hover:text-slate-900 hover:scale-105"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="transition-all duration-300 hover:text-slate-900 hover:scale-105"
              >
                Features
              </a>
            </div>

            <div className="hidden items-center gap-3 text-sm font-medium md:flex">
              <Link
                href="/signup"
                className="text-slate-500 transition-all duration-300 hover:text-slate-900 hover:scale-105"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-slate-900 px-4 py-2 text-white transition-all duration-300 hover:bg-slate-800 hover:scale-105 hover:shadow-lg"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 transition-all duration-300 hover:shadow-2xl animate-in fade-in zoom-in"
        >
          <h1 className="text-2xl font-semibold text-slate-900 text-center mb-6">
            Login to CampusOR
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full border border-slate-300 px-4 py-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-slate-300 px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center mt-6 text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-sky-600 hover:text-sky-700 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>

      <Footer />
    </main>
  );
}
