"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/app/services/api";
import { subscribeToQueue } from "@/lib/websocket";
import {
  Activity,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { CardSkeleton } from "@/components/skeletons/CardSkeleton";
import { Skeleton } from "@/components/skeletons/SkeletonBase";

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

export default function UserDashboardPage() {
  const [currentQueue, setCurrentQueue] = useState<CurrentQueue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentQueue();
  }, []);

  useEffect(() => {
    if (!currentQueue) return;

    // Subscribe to WebSocket for real-time updates
    const unsubscribe = subscribeToQueue(currentQueue.queueId, {
      onUpdate: (payload: unknown) => {
        setCurrentQueue((prev) => {
          if (!prev) return null;

          const data = payload as { tokens: Array<{ status: string; seq: number }> };
          if (!data?.tokens) return prev;

          const myTokenSeq = parseInt(prev.tokenNumber.replace(/\D/g, ""), 10);
          const waitingAhead = data.tokens.filter(
            (t) => t.status === "waiting" && t.seq < myTokenSeq
          ).length;

          return {
            ...prev,
            currentPosition: waitingAhead + 1,
            estimatedWaitTime: (waitingAhead + 1) * 5,
          };
        });
      },
      onError: (err) => console.error("WebSocket error:", err),
    });

    return () => unsubscribe();
  }, [currentQueue?.queueId]);

  const fetchCurrentQueue = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/user-status/current-queue", true);

      if (response.success && response.data) {
        setCurrentQueue(response.data);
      } else {
        setCurrentQueue(null);
      }
    } catch (err) {
      console.error("Error fetching current queue:", err);
      setCurrentQueue(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s your queue status.</p>
        </div>
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s your queue status.</p>
      </div>

      {currentQueue ? (
        /* Active Queue Card */
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Currently In Queue
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentQueue.queueName}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{currentQueue.location}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Your Token</div>
              <div className="text-4xl font-bold text-blue-600 font-mono">
                {currentQueue.tokenNumber}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <Users className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                #{currentQueue.currentPosition}
              </div>
              <div className="text-xs text-gray-600">Position</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <Clock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              {currentQueue.expireAt && currentQueue.status === "served" ? (
                <CountdownTimer targetDate={currentQueue.expireAt} />
              ) : (
                <div className="text-2xl font-bold text-orange-600">
                  {currentQueue.estimatedWaitTime}m
                </div>
              )}
              <div className="text-xs text-gray-600">{currentQueue.status === "served" && currentQueue.expireAt ? "Time to Check In" : "Est. Wait"}</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm col-span-2 md:col-span-1">
              <CheckCircle className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900 capitalize">
                {currentQueue.status}
              </div>
              <div className="text-xs text-gray-600">Status</div>
            </div>
          </div>

          {currentQueue.currentPosition <= 3 &&
            currentQueue.status === "waiting" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    {currentQueue.currentPosition === 1
                      ? "You're next! Please proceed to the service area."
                      : `You're ${currentQueue.currentPosition - 1} ${currentQueue.currentPosition === 2
                        ? "person"
                        : "people"
                      } away!`}
                  </span>
                </div>
              </div>
            )}

          {currentQueue.status === "served" && currentQueue.expireAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-center">
              <p className="text-green-800 font-medium mb-3">It&apos;s your turn! Please check in to confirm your presence.</p>
              <button
                onClick={async () => {
                  try {
                    await apiService.checkIn();
                    // Reload queue to update state (clear expiry)
                    await fetchCurrentQueue();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
              >
                Check In Now
              </button>
            </div>
          )}

          <Link
            href="/dashboard/user/myqueue"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
          >
            View Full Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* No Queue - Browse Queues */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Not in a Queue
          </h2>
          <p className="text-gray-600 mb-6">
            Browse and join available queues to get started.
          </p>
          <Link
            href="/dashboard/user/queues"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Activity className="w-5 h-5" />
            Browse Available Queues
          </Link>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/user/queues"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <Activity className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            Browse Queues
          </h3>
          <p className="text-sm text-gray-600">
            Find and join available queues
          </p>
        </Link>
        <Link
          href="/dashboard/user/history"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <Clock className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
            Queue History
          </h3>
          <p className="text-sm text-gray-600">
            View your past queue activities
          </p>
        </Link>
        <Link
          href="/dashboard/user/notification"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <AlertCircle className="w-8 h-8 text-orange-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
            Notifications
          </h3>
          <p className="text-sm text-gray-600">
            Check your queue notifications
          </p>
        </Link>
      </div>
    </div>
  );
}

// Helper component for countdown
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
    <div className={`text-2xl font-bold ${isExpired ? "text-red-600" : "text-green-600"}`}>
      {timeLeft}
    </div>
  );
}
