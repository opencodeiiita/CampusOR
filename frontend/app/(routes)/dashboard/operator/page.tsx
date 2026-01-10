"use client";

import NowServingCard from "@/operator/NowServingCard";
import OperatorControls from "@/operator/OperatorControls";
import OperatorHeader from "@/operator/OperatorHeader";
import TokenList from "@/operator/TokenList";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/app/services/api";

// [FIX] Made location required to match OperatorHeader props
type Token = { id: string; number: number; status: string };
type QueueData = {
  id: string;
  name: string;
  status: string;
  location: string;
};

export default function OperatorDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queueId = searchParams.get("queueId");

  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueData | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [nowServing, setNowServing] = useState<{
    id: string;
    number: number;
  } | null>(null);

  // Fetch Queue Data
  // Wrapped in useCallback to safely include in useEffect dependency array
  const fetchQueueState = useCallback(async () => {
    if (!queueId) return;
    try {
      const data = await apiService.get(
        `/queues/${queueId}/operator-view`,
        true
      );
      setQueue(data.queue);
      setTokens(data.tokens);
      setNowServing(data.nowServing);
    } catch (error) {
      console.error("Failed to fetch queue state:", error);
    } finally {
      setLoading(false);
    }
  }, [queueId]);

  useEffect(() => {
    if (!queueId) {
      // If no queueId, redirect to create page
      router.push("/dashboard/operator/create");
      return;
    }
    fetchQueueState();

    // Optional: Auto-refresh every 10 seconds to keep sync with user actions
    const interval = setInterval(fetchQueueState, 10000);
    return () => clearInterval(interval);
  }, [queueId, router, fetchQueueState]);

  // Actions
  const updateTokenStatus = async (tokenId: string, status: string) => {
    try {
      // [FIX] Now using apiService.patch directly
      await apiService.patch(
        `/queues/tokens/${tokenId}/status`,
        { status },
        true
      );
      fetchQueueState(); // Refresh state immediately after action
    } catch (error) {
      alert("Failed to update token status. Please try again.");
    }
  };

  const serveNext = async () => {
    // If we are already serving someone, we might want to finish them first?
    // Usually "Serve Next" implies finishing the current one (if any) and calling the next.
    // For simplicity, we just pick the first waiting token.
    if (!tokens.length) {
      alert("No tokens in waiting queue.");
      return;
    }
    const nextToken = tokens[0];
    await updateTokenStatus(nextToken.id, "served");
  };

  const skipToken = async () => {
    // Logic: Skip the person currently being served (if they are absent)
    if (nowServing) {
      await updateTokenStatus(nowServing.id, "skipped");
      return;
    }

    // Fallback: If nobody is being served, skip the next person in line
    if (tokens.length > 0) {
      await updateTokenStatus(tokens[0].id, "skipped");
    }
  };

  const recallToken = () => {
    if (nowServing) {
      alert(`Recalling Token ${nowServing.number} (Announcement)`);
      // In a real app, this might trigger a text-to-speech API or websocket event
    }
  };

  const toggleQueueStatus = async () => {
    alert("Feature coming soon: Pause/Resume Queue");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );

  if (!queue)
    return <div className="p-8 text-center text-red-500">Queue not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(15,23,42,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2">
              Operator Dashboard
            </h1>
            <p className="text-slate-600 text-lg">
              Manage your queue efficiently
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Tokens
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {tokens.length + (nowServing ? 1 : 0)}
                  </p>
                </div>
                <div className="bg-sky-100 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-sky-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Queue Status
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1 capitalize">
                    {queue.status.toLowerCase()}
                  </p>
                </div>
                <div
                  className={`rounded-full p-3 ${
                    queue.status === "ACTIVE" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <svg
                    className={`w-6 h-6 ${
                      queue.status === "ACTIVE"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Now Serving
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {nowServing ? nowServing.number : "None"}
                  </p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Queue Info & Now Serving */}
            <div className="lg:col-span-1 space-y-6">
              <OperatorHeader queue={queue} status={queue.status} />
              <NowServingCard token={nowServing} />
            </div>

            {/* Right Column - Tokens & Controls */}
            <div className="lg:col-span-2 space-y-6">
              <TokenList tokens={tokens} />
              <OperatorControls
                onServeNext={serveNext}
                onSkip={skipToken}
                onRecall={recallToken}
                onToggleQueue={toggleQueueStatus}
                queueStatus={queue.status}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
