"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/charts/StatCard";
import QueueLoadChart from "@/components/charts/QueueLoadChart";
import WaitTimeChart from "@/components/charts/WaitTimeChart";
import TokensServedChart from "@/components/charts/TokensServedChart";
import ServiceEfficiencyChart from "@/components/charts/ServiceEfficiencyChart";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { fetchDashboardSummary, DashboardSummary } from "@/lib/api/admin";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AdminPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load dashboard summary:", err);
        setError("Failed to load dashboard summary");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="flex min-h-screen">
        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 xl:ml-72">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 sm:mb-10 pt-12 lg:pt-0">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-slate-200">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
                  Admin Analytics Dashboard
                </h1>
                <p className="text-slate-600 text-sm sm:text-base font-medium">
                  Overview of system performance and metrics
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="bg-sky-600 p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-800 rounded-xl border border-slate-200 p-6 shadow-lg relative overflow-hidden"
                  >
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`,
                          backgroundSize: "20px 20px",
                        }}
                      ></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                      <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-8 shadow-lg mb-10 mr-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4v2M7.5 14.5L12 20l4.5-5.5M12 12h.01"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-red-800 font-bold text-lg">
                    Error Loading Data
                  </p>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          ) : summary ? (
            <div className="bg-sky-600 p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                <StatCard
                  title="Active Tokens"
                  value={summary.activeTokens.toString()}
                  color="blue"
                />
                <StatCard
                  title="Served Today"
                  value={summary.servedToday.toString()}
                  color="green"
                />
                <StatCard
                  title="Skipped Tokens"
                  value={summary.skippedTokens.toString()}
                  color="amber"
                />
                <StatCard
                  title="Total Tokens Today"
                  value={summary.totalTokensToday.toString()}
                  color="blue"
                />
                <StatCard
                  title="Peak Hour"
                  value={summary.peakHour}
                  color="purple"
                />
              </div>
            </div>
          ) : null}

          {/* Charts Grid */}
          <div className="bg-sky-600 p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                <QueueLoadChart />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                <WaitTimeChart />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                <TokensServedChart />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                <ServiceEfficiencyChart />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
