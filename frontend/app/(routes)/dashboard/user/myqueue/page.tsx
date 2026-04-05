"use client";

import { apiService } from "@/app/services/api";
import { subscribeToQueue } from "@/lib/websocket";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ListChecks,
  Loader2,
  LogOut,
  MapPin,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CurrentQueue {
  id: string;
  queueId: string;
  queueName: string;
  location: string;
  tokenNumber: string;
  currentPosition: number;
  estimatedWaitTime: number;
  joinedAt: string;
  status: string;
  expireAt?: string;
}

interface QueueSnapshot {
  queue: {
    status: "ACTIVE" | "PAUSED";
    isFull?: boolean;
    capacity?: number;
  };
  tokens: Array<{
    id: string;
    seq: number;
    status: string;
    expireAt?: string;
  }>;
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        setIsExpired(true);
      } else {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={`text-2xl font-bold ${isExpired ? "text-red-600" : "text-emerald-600"}`}>
      {timeLeft}
    </div>
  );
}

export default function MyQueuePage() {
  const [currentQueue, setCurrentQueue] = useState<CurrentQueue | null>(null);
  const [queueSnapshot, setQueueSnapshot] = useState<QueueSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leavingQueue, setLeavingQueue] = useState(false);

  useEffect(() => {
    fetchCurrentQueue();
  }, []);

  useEffect(() => {
    if (currentQueue?.status === "completed" || currentQueue?.status === "expired") {
      const timer = setTimeout(() => {
        window.location.href = "/dashboard/user";
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentQueue?.status]);

  useEffect(() => {
    if (!currentQueue) return;

    const unsubscribe = subscribeToQueue(currentQueue.queueId, {
      onUpdate: (payload) => {
        const snapshot = payload as QueueSnapshot;
        setQueueSnapshot(snapshot);

        const myTokenSeq = parseInt(currentQueue.tokenNumber.replace(/\D/g, ""));
        const myToken = snapshot.tokens.find((t) => t.seq === myTokenSeq);

        if (myToken) {
          const waitingAhead = snapshot.tokens.filter(
            (t) => t.status === "waiting" && t.seq < myTokenSeq,
          ).length;

          setCurrentQueue((prev) =>
            prev
              ? {
                  ...prev,
                  currentPosition: waitingAhead + 1,
                  estimatedWaitTime: (waitingAhead + 1) * 5,
                  status: myToken.status,
                  expireAt: myToken.expireAt,
                }
              : null,
          );
        }
      },
      onError: (err) => {
        console.error("WebSocket error:", err);
      },
    });

    return () => unsubscribe();
  }, [currentQueue?.queueId]);

  const fetchCurrentQueue = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get("/user-status/current-queue", true);

      if (response.success && response.data) {
        setCurrentQueue(response.data);
      } else {
        setCurrentQueue(null);
      }
    } catch (err: unknown) {
      console.error("Error fetching current queue:", err);
      setError(err instanceof Error ? err.message : "Failed to load your queue status");
      setCurrentQueue(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!currentQueue) return;

    const confirmed = window.confirm(
      `Are you sure you want to leave the queue for ${currentQueue.queueName}? Your token ${currentQueue.tokenNumber} will be cancelled.`,
    );

    if (!confirmed) return;

    try {
      setLeavingQueue(true);
      setError(null);

      const response = await apiService.post("/user-status/leave-queue", {}, true);

      if (response.success) {
        setCurrentQueue(null);
        setQueueSnapshot(null);
        await fetchCurrentQueue();
      }
    } catch (err: unknown) {
      console.error("Error leaving queue:", err);
      setError(err instanceof Error ? err.message : "Failed to leave queue. Please try again.");
      await fetchCurrentQueue();
    } finally {
      setLeavingQueue(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-[rgba(133,216,206,0.18)] text-[#085078]";
      case "served":
        return "bg-emerald-100 text-emerald-800";
      case "skipped":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock className="w-5 h-5" />;
      case "served":
        return <CheckCircle className="w-5 h-5" />;
      case "skipped":
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return currentQueue && currentQueue.currentPosition <= 3 ? "Your Turn Soon!" : "Waiting";
      case "served":
        return "Being Served";
      case "skipped":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes <= 5) return "text-emerald-600";
    if (minutes <= 15) return "text-amber-600";
    return "text-red-600";
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isQueuePaused = queueSnapshot?.queue?.status === "PAUSED";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="brand-page-header">
          <div className="flex items-center gap-3">
            <ListChecks className="h-6 w-6 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">My Queue</h1>
              <p className="text-sm text-white/80">
                Track your live token status, wait time, and service progress.
              </p>
            </div>
          </div>
        </div>
        <div className="brand-section-card p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#085078]" />
            <span className="ml-3 text-gray-600">Loading your queue status...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="brand-page-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListChecks className="w-6 h-6 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">My Queue</h1>
            <p className="text-sm text-white/80">
              Track your live token status, wait time, and service progress.
            </p>
          </div>
        </div>
        <button
          onClick={fetchCurrentQueue}
          className="brand-secondary-button gap-2 px-4 py-2 text-sm !border-white/20 !bg-white/12 !text-white hover:!bg-white/18"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {isQueuePaused && currentQueue && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-800">
              This queue is currently paused. Service will resume shortly.
            </span>
          </div>
        </div>
      )}

      <div className="brand-section-card p-0">
        {currentQueue ? (
          <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-xl font-bold text-gray-900">{currentQueue.queueName}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{currentQueue.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Joined at {formatTime(currentQueue.joinedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(currentQueue.status)}
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                    currentQueue.status,
                  )}`}
                >
                  {getStatusText(currentQueue.status)}
                </span>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[rgba(8,80,120,0.12)] bg-[rgba(133,216,206,0.12)] p-4 text-center">
                <div className="mb-1 text-sm font-medium text-[#085078]">Your Token</div>
                <div className="font-mono text-3xl font-bold text-[#085078]">
                  {currentQueue.tokenNumber}
                </div>
              </div>

              <div className="brand-subtle-card text-center">
                <div className="mb-1 text-sm font-medium text-gray-600">Position in Queue</div>
                <div className="text-3xl font-bold text-gray-900">#{currentQueue.currentPosition}</div>
              </div>

              <div className="brand-subtle-card text-center">
                <div className="mb-1 text-sm font-medium text-gray-600">Estimated Wait</div>
                {currentQueue.expireAt && currentQueue.status === "served" ? (
                  <div className="flex flex-col items-center">
                    <CountdownTimer targetDate={currentQueue.expireAt} />
                    <span className="text-xs font-medium text-red-600">Time to confirm</span>
                  </div>
                ) : (
                  <div className={`text-3xl font-bold ${getWaitTimeColor(currentQueue.estimatedWaitTime)}`}>
                    {currentQueue.estimatedWaitTime}m
                  </div>
                )}
              </div>
            </div>

            {currentQueue.status === "waiting" && (
              <div className="mb-6 rounded-2xl border border-[rgba(8,80,120,0.16)] bg-[rgba(133,216,206,0.14)] p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-[#085078]" />
                  <div>
                    <h3 className="mb-1 font-medium text-[#085078]">
                      {currentQueue.currentPosition <= 3 ? "Your Turn is Coming Up!" : "Please Wait"}
                    </h3>
                    <p className="text-sm text-[#0b4f63]">
                      {currentQueue.currentPosition === 1
                        ? "You're next! Please proceed to the service area."
                        : currentQueue.currentPosition <= 3
                          ? `You're ${currentQueue.currentPosition - 1} ${
                              currentQueue.currentPosition === 2 ? "person" : "people"
                            } away from being served.`
                          : `There are ${
                              currentQueue.currentPosition - 1
                            } people ahead of you. We'll notify you when your turn is approaching.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentQueue.status === "served" && (
              <>
                {currentQueue.expireAt ? (
                  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 text-center">
                    <h3 className="mb-2 text-xl font-bold text-emerald-900">It&apos;s Your Turn!</h3>
                    <p className="mb-4 text-emerald-800">
                      Please check in immediately to confirm you are present.
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          await apiService.checkIn();
                          await fetchCurrentQueue();
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="brand-primary-button animate-pulse px-8 py-3"
                    >
                      CHECK IN NOW
                    </button>
                  </div>
                ) : (
                  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                      <h3 className="text-xl font-bold text-emerald-900">You&apos;re Being Served!</h3>
                    </div>
                    <p className="text-emerald-800">
                      Your attendance is confirmed. Please proceed to the counter.
                    </p>
                  </div>
                )}
              </>
            )}

            {currentQueue.status === "completed" && (
              <div className="mb-6 rounded-2xl border border-[rgba(8,80,120,0.14)] bg-[rgba(133,216,206,0.16)] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-[#157490]" />
                  <div>
                    <h3 className="mb-1 font-medium text-[#085078]">Service Completed!</h3>
                    <p className="text-sm text-[#0b4f63]">
                      Your service has been completed. Thank you! You will be redirected shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentQueue.status === "expired" && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="mb-1 font-medium text-red-900">Token Expired</h3>
                    <p className="text-sm text-red-800">
                      You did not check in on time. Your token has expired and you will be removed from the queue.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleLeaveQueue}
                disabled={leavingQueue || currentQueue.status === "served"}
                className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors ${
                  currentQueue.status === "served"
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                {leavingQueue ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5" />
                    Leave Queue
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ListChecks className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Not in a Queue</h3>
            <p className="mb-6 text-gray-600">
              You&apos;re not currently in any queue. Browse available queues to join one.
            </p>
            <a
              href="/dashboard/user/queues"
              className="brand-primary-button inline-flex items-center gap-2 px-6 py-3"
            >
              <Activity className="w-5 h-5" />
              Browse Queues
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
