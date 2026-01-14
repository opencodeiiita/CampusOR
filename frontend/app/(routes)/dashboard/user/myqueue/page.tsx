"use client";

import { useState, useEffect } from "react";
import {
  ListChecks,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  XCircle,
  RefreshCw,
  LogOut,
  CheckCircle,
  Loader2,
  Activity,
} from "lucide-react";
import { apiService } from "@/app/services/api";
import { subscribeToQueue } from "@/lib/websocket";

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
}

interface QueueSnapshot {
  queue: {
    status: "ACTIVE" | "PAUSED";
  };
  tokens: Array<{
    id: string;
    seq: number;
    status: string;
  }>;
}

export default function MyQueuePage() {
  const [currentQueue, setCurrentQueue] = useState<CurrentQueue | null>(null);
  const [queueSnapshot, setQueueSnapshot] = useState<QueueSnapshot | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leavingQueue, setLeavingQueue] = useState(false);

  useEffect(() => {
    fetchCurrentQueue();
  }, []);

  // Auto-redirect when service is completed
  useEffect(() => {
    if (currentQueue?.status === "completed") {
      const timer = setTimeout(() => {
        window.location.href = "/dashboard/user";
      }, 3000); // 3 second delay to show completion message

      return () => clearTimeout(timer);
    }
  }, [currentQueue?.status]);

  useEffect(() => {
    if (!currentQueue) return;

    // Subscribe to WebSocket for real-time updates
    const unsubscribe = subscribeToQueue(currentQueue.queueId, {
      onUpdate: (payload) => {
        const snapshot = payload as QueueSnapshot;
        setQueueSnapshot(snapshot);

        // Update position and status based on real-time data
        if (currentQueue) {
          const myTokenSeq = parseInt(
            currentQueue.tokenNumber.replace(/\D/g, "")
          );

          // Find my token in the snapshot to get current status
          const myToken = snapshot.tokens.find((t) => t.seq === myTokenSeq);

          if (myToken) {
            const waitingAhead = snapshot.tokens.filter(
              (t) => t.status === "waiting" && t.seq < myTokenSeq
            ).length;

            setCurrentQueue({
              ...currentQueue,
              currentPosition: waitingAhead + 1,
              estimatedWaitTime: (waitingAhead + 1) * 5,
              status: myToken.status, // Update status from WebSocket
            });
          }
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
    } catch (err: any) {
      console.error("Error fetching current queue:", err);
      setError(err.message || "Failed to load your queue status");
      setCurrentQueue(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!currentQueue) return;

    const confirmed = window.confirm(
      `Are you sure you want to leave the queue for ${currentQueue.queueName}? Your token ${currentQueue.tokenNumber} will be cancelled.`
    );

    if (!confirmed) return;

    try {
      setLeavingQueue(true);
      setError(null);

      const response = await apiService.post(
        "/user-status/leave-queue",
        {},
        true
      );

      if (response.success) {
        // Clear local state
        setCurrentQueue(null);
        setQueueSnapshot(null);

        // Refresh to ensure backend state is synced
        await fetchCurrentQueue();
      }
    } catch (err: any) {
      console.error("Error leaving queue:", err);
      setError(err.message || "Failed to leave queue. Please try again.");

      // Refresh current state even on error to sync with backend
      await fetchCurrentQueue();
    } finally {
      setLeavingQueue(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-blue-100 text-blue-800";
      case "served":
        return "bg-green-100 text-green-800";
      case "skipped":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        return currentQueue && currentQueue.currentPosition <= 3
          ? "Your Turn Soon!"
          : "Waiting";
      case "served":
        return "Being Served";
      case "skipped":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes <= 5) return "text-green-600";
    if (minutes <= 15) return "text-yellow-600";
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
        <div className="flex items-center gap-3">
          <ListChecks className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Queue</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            <span className="ml-3 text-gray-600">
              Loading your queue status...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListChecks className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Queue</h1>
        </div>
        <button
          onClick={fetchCurrentQueue}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Paused Queue Warning */}
      {isQueuePaused && currentQueue && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              This queue is currently paused. Service will resume shortly.
            </span>
          </div>
        </div>
      )}

      {/* Queue Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {currentQueue ? (
          <div className="p-6">
            {/* Queue Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {currentQueue.queueName}
                </h2>
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
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    currentQueue.status
                  )}`}
                >
                  {getStatusText(currentQueue.status)}
                </span>
              </div>
            </div>

            {/* Token and Position */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
                <div className="text-sm text-blue-700 mb-1 font-medium">
                  Your Token
                </div>
                <div className="text-3xl font-bold text-blue-600 font-mono">
                  {currentQueue.tokenNumber}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="text-sm text-gray-600 mb-1 font-medium">
                  Position in Queue
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  #{currentQueue.currentPosition}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="text-sm text-gray-600 mb-1 font-medium">
                  Estimated Wait
                </div>
                <div
                  className={`text-3xl font-bold ${getWaitTimeColor(
                    currentQueue.estimatedWaitTime
                  )}`}
                >
                  {currentQueue.estimatedWaitTime}m
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {currentQueue.status === "waiting" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">
                      {currentQueue.currentPosition <= 3
                        ? "Your Turn is Coming Up!"
                        : "Please Wait"}
                    </h3>
                    <p className="text-sm text-blue-800">
                      {currentQueue.currentPosition === 1
                        ? "You're next! Please proceed to the service area."
                        : currentQueue.currentPosition <= 3
                        ? `You're ${currentQueue.currentPosition - 1} ${
                            currentQueue.currentPosition === 2
                              ? "person"
                              : "people"
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900 mb-1">
                      You're Being Served!
                    </h3>
                    <p className="text-sm text-green-800">
                      Your token is now being processed. Please remain at the
                      counter.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentQueue.status === "completed" && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-purple-900 mb-1">
                      Service Completed!
                    </h3>
                    <p className="text-sm text-purple-800">
                      Your service has been completed. Thank you! You'll be
                      automatically removed from the queue shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleLeaveQueue}
                disabled={leavingQueue || currentQueue.status === "served"}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentQueue.status === "served"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                }`}
              >
                {leavingQueue ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5" />
                    Leave Queue
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // No active queue
          <div className="p-12 text-center">
            <ListChecks className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Not in a Queue
            </h3>
            <p className="text-gray-600 mb-6">
              You're not currently in any queue. Browse available queues to join
              one.
            </p>
            <a
              href="/dashboard/user/queues"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
