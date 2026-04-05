"use client";

import { apiService } from "@/app/services/api";
import {
  Activity,
  AlertCircle,
  Clock,
  Loader2,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Queue {
  queueId: string;
  queueName: string;
  location: string;
  queueLength: number;
  waitTime: number;
  status: "open" | "paused" | "full";
  capacity?: number;
  isFull?: boolean;
  availableSlots?: number;
}

export default function BrowseQueuesPage() {
  const router = useRouter();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [filteredQueues, setFilteredQueues] = useState<Queue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningQueue, setJoiningQueue] = useState<string | null>(null);

  useEffect(() => {
    fetchQueues();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredQueues(queues);
    } else {
      const filtered = queues.filter(
        (q) =>
          q.queueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.location.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredQueues(filtered);
    }
  }, [searchTerm, queues]);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get("/queues", false);
      setQueues(response.queues || []);
      setFilteredQueues(response.queues || []);
    } catch (err: unknown) {
      console.error("Failed to fetch queues:", err);
      setError(err instanceof Error ? err.message : "Failed to load queues");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async (queueId: string, queueName: string) => {
    const confirmed = window.confirm(
      `Do you want to join "${queueName}"? You will receive a token and be added to the queue.`,
    );

    if (!confirmed) return;

    try {
      setJoiningQueue(queueId);
      const response = await apiService.post(
        "/user-status/join-queue",
        { queueId },
        true,
      );

      if (response.success) {
        toast.success(`Successfully joined! Your token: ${response.data.tokenNumber}`);
        router.push("/dashboard/user/myqueue");
      }
    } catch (err: unknown) {
      console.error("Failed to join queue:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to join queue. You may already be in a queue.",
      );
    } finally {
      setJoiningQueue(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
            Open
          </span>
        );
      case "paused":
        return (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
            Paused
          </span>
        );
      case "full":
        return (
          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
            Full
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="brand-page-header">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Browse Queues</h1>
              <p className="text-sm text-white/80">
                Find the right queue and join with live availability.
              </p>
            </div>
          </div>
        </div>
        <div className="brand-section-card p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#085078]" />
            <span className="ml-3 text-gray-600">Loading queues...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="brand-page-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Browse Queues</h1>
            <p className="text-sm text-white/80">
              Find the right queue and join with live availability.
            </p>
          </div>
        </div>
        <button
          onClick={fetchQueues}
          className="brand-secondary-button gap-2 px-4 py-2 text-sm !border-white/20 !bg-white/12 !text-white hover:!bg-white/18"
        >
          <Activity className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="brand-section-card p-5">
        <div className="flex items-center gap-3 rounded-[22px] border border-[rgba(8,80,120,0.12)] bg-white/88 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all focus-within:border-[#157490] focus-within:shadow-[0_0_0_4px_rgba(133,216,206,0.22)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(8,80,120,0.12),rgba(133,216,206,0.28))] text-[#085078]">
            <Search className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6d8792]">
              Search
            </p>
        <input
          type="text"
          placeholder="Search queues by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-0 bg-transparent p-0 text-[17px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">Error loading queues</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {filteredQueues.length === 0 ? (
        <div className="brand-section-card p-12 text-center">
          <Activity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-600">
            {searchTerm ? "No queues match your search" : "No queues available right now"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredQueues.map((queue) => (
            <div key={queue.queueId} className="brand-link-card">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-gray-900">
                    {queue.queueName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{queue.location}</span>
                  </div>
                </div>
                {getStatusBadge(queue.status)}
              </div>

              <div className="brand-subtle-card mb-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#157490]" />
                  <div>
                    <p className="text-xs text-gray-500">Queue Length</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {queue.queueLength} / {queue.capacity ?? "—"} waiting
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#157490]" />
                  <div>
                    <p className="text-xs text-gray-500">Est. Wait</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ~{queue.waitTime} min
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleJoinQueue(queue.queueId, queue.queueName)}
                disabled={
                  queue.status === "full" ||
                  queue.status === "paused" ||
                  queue.isFull ||
                  joiningQueue === queue.queueId
                }
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition-colors ${
                  queue.status === "open" && joiningQueue !== queue.queueId
                    ? "brand-primary-button"
                    : "cursor-not-allowed bg-gray-100 text-gray-400"
                }`}
              >
                {joiningQueue === queue.queueId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>{queue.status === "open" ? "Join Queue" : "Queue Full"}</>
                )}
              </button>

              {(queue.status === "full" || queue.isFull) && (
                <p className="mt-2 text-xs text-red-600">
                  This queue is currently at capacity. Please try again later.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
