"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { error } from "console";
import { useAuth } from "@/app/context/AuthContext";

type AdminUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  createdBy: string | null;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchAdmins = async () => {
    const response = await fetch(`${API_URL}/api/admin/admins`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    console.log("admin data:", data);

    if (!response.ok) {
      throw new Error(data.message || "fetching admin failed");
    }

    const normalizedAdmins: AdminUser[] = data.map((admin: any) => ({
      id: admin._id,
      email: admin.email,
      emailVerified: admin.emailVerified,
      createdBy: admin.createdByAdmin ?? null,
      createdAt: admin.createdAt.split("T")[0],
    }));
  
    setAdmins(normalizedAdmins);  
  }

  useEffect(() => {
    try {
      console.log("Sucessfully fetched admins");
    }
    catch (err) {
      console.error("Error fetching admins:", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAdmins();
    }
  }, [token]);

  const handleCreateAdmin = async () => {
    if (!email) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send invite");
      }

      alert("Admin invitation sent successfully!");
      setEmail("");
    } catch (err: any) {
      console.error("Invite error:", err);
      alert(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main */}
        <main className="flex-1 lg:ml-64 xl:ml-72">
          <div className="p-4 sm:p-6 lg:p-8 pt-12 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Manage Admins
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">
                Create and manage administrator access. Public admin signup is
                disabled.
              </p>
            </div>

            {/* Create Admin */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Invite New Admin
              </h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="newadmin@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />

                <button
                  onClick={handleCreateAdmin}
                  disabled={loading}
                  className="rounded-xl bg-sky-600 text-white px-6 py-3 font-semibold hover:bg-sky-700 transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Invite"}
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Admins receive an email invite to verify their account.
              </p>
            </div>

            {/* Admin List */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Existing Admins
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                        Created By
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                        Created At
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {admin.email}
                        </td>

                        <td className="px-4 py-3">
                          {admin.emailVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-slate-600 text-sm">
                          {admin.createdBy ?? "Bootstrap Admin"}
                        </td>

                        <td className="px-4 py-3 text-slate-600 text-sm">
                          {admin.createdAt}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            disabled
                            className="text-slate-400 cursor-not-allowed text-sm"
                            title="Self-role edits disabled"
                          >
                            —
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-500 mt-4">
                • Admin role changes and self-edits are intentionally disabled.
                <br />
                • Bootstrap admin cannot be removed.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
