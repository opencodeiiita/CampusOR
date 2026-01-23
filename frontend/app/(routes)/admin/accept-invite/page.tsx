"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import Footer from "../../../../components/footer/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AcceptInvitePage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid invitation link. Missing token or email.");
    }
  }, [token, email]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token || !email) {
      setError("Missing invitation details");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/admin/accept-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token, name, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept invite");
      }

      // Login the user directly
      login(data.token, data.user);

      // Redirect to admin dashboard
      router.replace("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
       <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
         <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
           <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Invitation</h1>
           <p className="text-slate-600 mb-6">The invitation link is missing required information.</p>
           <Link href="/login" className="text-sky-600 hover:underline">Go to Login</Link>
         </div>
       </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth">
      {/* Landing Page Navbar - simplified */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur relative">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between relative z-30">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo/LOGO.svg"
                alt="CampusOR logo"
                className="h-11 w-auto object-contain md:h-14"
              />
            </Link>
          </div>
        </div>
      </nav>

      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
        <form
          onSubmit={handleAccept}
          className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 transition-all duration-300 hover:shadow-2xl animate-in fade-in zoom-in"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Accept Admin Invitation
            </h1>
            <p className="text-sm text-slate-500">
               Setting up account for <span className="font-medium text-slate-700">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passowrd</label>
                <input
                    type="password"
                    placeholder="Create a strong password"
                    className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Setting up account..." : "Complete Setup"}
          </button>
        </form>
      </div>

      <Footer />
    </main>
  );
}
