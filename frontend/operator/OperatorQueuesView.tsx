"use client";

import { apiService } from "@/app/services/api";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type OperatorQueue = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  location: string;
};

const parseQueues = (payload: unknown): OperatorQueue[] => {
  if (Array.isArray(payload)) return payload as OperatorQueue[];
  if (payload && typeof payload === "object") {
    const record = payload as {
      queues?: OperatorQueue[];
      data?: { queues?: OperatorQueue[] };
    };
    if (Array.isArray(record.queues)) return record.queues;
    if (Array.isArray(record.data?.queues)) return record.data.queues;
  }
  return [];
};

export default function OperatorQueuesView() {
  const router = useRouter();
  const [queues, setQueues] = useState<OperatorQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionQueueId, setActionQueueId] = useState<string | null>(null);

  const loadQueues = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.get("/operator/queues", true);
      setQueues(parseQueues(data));
      setError(null);
    } catch (err) {
      console.error("Failed to load queues", err);
      setError("Unable to load your queues right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueues();
  }, [loadQueues]);

  const goToQueue = (id: string) => {
    router.push(`/dashboard/operator/live?queueId=${id}`);
  };

  const toggleQueueStatus = async (queue: OperatorQueue) => {
    try {
      setActionQueueId(queue.id);
      const action = queue.status === "ACTIVE" ? "pause" : "resume";
      await apiService.patch(
        `/operator/queues/${queue.id}/${action}`,
        {},
        true
      );
      toast.success(
        queue.status === "ACTIVE"
          ? "Queue paused successfully."
          : "Queue resumed successfully."
      );
      setQueues((prev) =>
        prev.map((item) =>
          item.id === queue.id
            ? {
                ...item,
                status: queue.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
              }
            : item
        )
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update queue status";
      console.error("Failed to update queue status", err);
      toast.error(message);
    } finally {
      setActionQueueId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Operator Dashboard
            </h1>
            <p className="text-slate-600">
              Manage all queues you own in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/operator/live"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-sky-600 text-sky-700 font-semibold shadow-sm hover:bg-sky-50 transition-colors"
            >
              Live Queues
            </Link>
            <Link
              href="/dashboard/operator/create"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition-colors"
            >
              + Create Queue
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        ) : queues.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              No queues yet
            </h2>
            <p className="text-slate-600 mb-6">
              Create your first queue to start serving users.
            </p>
            <Link
              href="/dashboard/operator/create"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition-colors"
            >
              Create a queue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {queues.map((queue) => (
              <div
                key={queue.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {queue.name}
                    </h3>
                    <p className="text-slate-600 text-sm flex items-center gap-1">
                      <span className="text-slate-400">📍</span>
                      {queue.location}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      queue.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {queue.status === "ACTIVE" ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => goToQueue(queue.id)}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-sky-600 text-sky-700 font-semibold hover:bg-sky-50 transition-colors"
                  >
                    View Live
                  </button>
                  <button
                    onClick={() => toggleQueueStatus(queue)}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                    disabled={actionQueueId === queue.id}
                  >
                    {queue.status === "ACTIVE" ? "Pause" : "Resume"}
                  </button>
                  <Link
                    href={`/kiosk/${queue.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Go to kiosk
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
