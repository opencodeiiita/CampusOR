"use client";

import { useState, useEffect } from "react";
import {
  History,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { userQueueService } from "../../../../../lib/services/userQueueService";
import { apiService } from "@/app/services/api";

// Types matching backend schema
interface QueueHistoryItem {
  queueId: string;
  queueName: string;
  location: string;
  token: string;
  joinedAt: string;
  servedAt: string | null;
  cancelledAt: string | null;
  status: "completed" | "cancelled";
  waitTimeMinutes: number;
}


export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<QueueHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueueHistory();
  }, []);

  const fetchQueueHistory = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await apiService.get("/user-status/history", true);
  
      setHistoryData(response.data);
    } catch (err) {
      console.error("Error fetching queue history:", err);
      setError("Failed to load queue history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "served":
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "served":
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Queue History</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading queue history...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <History className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Queue History</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">{error}</span>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {historyData.length === 0 ? (
          <div className="p-8 text-center">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Queue History
            </h3>
            <p className="text-gray-600">
              You haven't joined any queues yet. Your queue history will appear
              here once you start using the system.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {historyData.map((item) => (
              <div
                key={`${item.queueId}-${item.token}-${item.joinedAt}`}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.queueName}
                      </h3>
                      {getStatusIcon(item.status)}
                      <span className={getStatusBadge(item.status)}>
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          Token:
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono">
                          {item.token}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Joined: {formatDate(item.joinedAt)}</span>
                      </div>
                      {item.servedAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Served: {formatDate(item.servedAt)}</span>
                        </div>
                      )}
                      {item.cancelledAt && (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Cancelled: {formatDate(item.cancelledAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className="text-sm text-gray-600 mb-1">Wait Time</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {item.waitTimeMinutes}m
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
