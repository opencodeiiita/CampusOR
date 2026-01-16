"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Footer from "../../../components/footer/Footer";

type UserRole = "user" | "operator";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation for role-specific fields
    if (role === "user" && !collegeEmail) {
      setError("College email is required for user role");
      return;
    }
    if (role === "operator") {
      if (!department) {
        setError("Department is required for operator role");
        return;
      }
      if (!position) {
        setError("Position is required for operator role");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Prepare request body with role-specific fields
      const requestBody: any = {
        name,
        email,
        password,
        role,
      };

      if (role === "user") {
        requestBody.collegeEmail = collegeEmail;
      } else if (role === "operator") {
        requestBody.department = department;
        requestBody.position = position;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Auto-login after successful registration
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || "Login failed");
      }

      login(loginData.token, loginData.user);

      if (loginData.user?.role === "operator") {
        router.push("/dashboard/operator");
      } else {
        router.push("/dashboard/user");
      }
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
                href="/landing#how"
                className="transition-all duration-300 hover:text-slate-900 hover:scale-105"
              >
                How It Works
              </a>
              <a
                href="/landing#features"
                className="transition-all duration-300 hover:text-slate-900 hover:scale-105"
              >
                Features
              </a>
            </div>

            <div className="hidden items-center gap-3 text-sm font-medium md:flex">
              <Link
                href="/login"
                className="text-slate-500 transition-all duration-300 hover:text-slate-900 hover:scale-105"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-slate-900 px-4 py-2 text-white transition-all duration-300 hover:bg-slate-800 hover:scale-105 hover:shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Signup Form */}
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
        <form
          onSubmit={handleSignup}
          className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 transition-all duration-300 hover:shadow-2xl animate-in fade-in zoom-in"
        >
          <h1 className="text-2xl font-semibold text-slate-900 text-center mb-6">
            Sign up for CampusOR
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Full Name"
            className="w-full border border-slate-300 px-4 py-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border border-slate-300 px-4 py-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <select
            className="w-full border border-slate-300 px-4 py-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            required
          >
            <option value="user">User</option>
            <option value="operator">Operator</option>
          </select>

          {role === "user" && (
            <input
              type="email"
              placeholder="College Email"
              className="w-full border border-slate-300 px-4 py-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              value={collegeEmail}
              onChange={(e) => setCollegeEmail(e.target.value)}
              required
            />
          )}

          {role === "operator" && (
            <>
              <input
                type="text"
                placeholder="Department"
                className="w-full border border-slate-300 px-4 py-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Position"
                className="w-full border border-slate-300 px-4 py-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              />
            </>
          )}

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-slate-300 px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            autoComplete="on"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-center mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-sky-600 hover:text-sky-700 font-semibold transition-colors"
            >
              Login
            </Link>
          </p>
        </form>
      </div>

      <Footer />
    </main>
  );
}
