"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/app/services/api";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Clock,
  Users,
  Activity,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Queue {
  queueId: string;
  queueName: string;
  location: string;
  queueLength: number;
  waitTime: number;
  status: "open" | "paused" | "closed";
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
          q.location.toLowerCase().includes(searchTerm.toLowerCase())
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
    } catch (err: any) {
      console.error("Failed to fetch queues:", err);
      setError(err.message || "Failed to load queues");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async (queueId: string, queueName: string) => {
    const confirmed = window.confirm(
      `Do you want to join "${queueName}"? You will receive a token and be added to the queue.`
    );

    if (!confirmed) return;

    try {
      setJoiningQueue(queueId);
      const response = await apiService.post(
        "/user-status/join-queue",
        { queueId },
        true
      );

      if (response.success) {
        alert(`Successfully joined! Your token: ${response.data.tokenNumber}`);
        router.push("/dashboard/user/myqueue");
      }
    } catch (err: any) {
      console.error("Failed to join queue:", err);
      alert(
        err.message || "Failed to join queue. You may already be in a queue."
      );
    } finally {
      setJoiningQueue(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Open
          </span>
        );
      case "paused":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Paused
          </span>
        );
      case "closed":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
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
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Available Queues</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            <span className="ml-3 text-gray-600">Loading queues...</span>
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
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Available Queues</h1>
        </div>
        <button
          onClick={fetchQueues}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Activity className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search queues by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Error loading queues
            </p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Queue List */}
      {filteredQueues.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm
              ? "No queues match your search"
              : "No queues available right now"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQueues.map((queue) => (
            <div
              key={queue.queueId}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {queue.queueName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{queue.location}</span>
                  </div>
                </div>
                {getStatusBadge(queue.status)}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Queue Length</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {queue.queueLength} people
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Est. Wait</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ~{queue.waitTime} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <button
                onClick={() => handleJoinQueue(queue.queueId, queue.queueName)}
                disabled={
                  queue.status === "closed" ||
                  queue.status === "paused" ||
                  joiningQueue === queue.queueId
                }
                className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  queue.status === "open" && joiningQueue !== queue.queueId
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {joiningQueue === queue.queueId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    {queue.status === "open" ? "Join Queue" : "Not Available"}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
