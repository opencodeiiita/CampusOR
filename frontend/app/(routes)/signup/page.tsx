"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

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
        role 
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

      login(loginData.token);
      router.push("/landing");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md border rounded-lg p-6"
      >
        <h1 className="text-2xl font-bold text-center mb-4">
          Sign up for CampusOR
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border px-3 py-2 rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <select
          className="w-full border px-3 py-2 rounded mb-3"
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
            className="w-full border px-3 py-2 rounded mb-3"
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
              className="w-full border px-3 py-2 rounded mb-3"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Position"
              className="w-full border px-3 py-2 rounded mb-3"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </>
        )}

        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded mb-4"
          autoComplete="on"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50 cursor-pointer hover:bg-gray-800 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline cursor-pointer">
            Login
          </a>
        </p>
      </form>
    </main>
  );
}
