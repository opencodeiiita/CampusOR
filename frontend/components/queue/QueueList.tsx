"use client";

import { useState, useMemo, useEffect } from "react";
import QueueCard from "./QueueCard";
import { Queue } from "./queue.types";
import { queueService } from "../../lib/api/queue";

type SortOption = "waitTime" | "queueLength" | "alphabetical";
type LocationFilter =
  | "all"
  | "Admin Block"
  | "Cafeteria"
  | "Clinic"
  | "Hostel"
  | "Sports Complex";
type StatusFilter = "all" | "open" | "paused" | "closed";

export default function QueueList() {
  const [sortBy, setSortBy] = useState<SortOption>("waitTime");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        setLoading(true);
        const data = await queueService.getQueues();
        setQueues(data);
        setError(null);
      } catch (err) {
        setError("Failed to load queues");
        console.error("Error fetching queues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQueues();
  }, []);

  const filteredAndSortedQueues = useMemo(() => {
    let filtered = [...queues];

    // Apply location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((queue) => queue.location === locationFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((queue) => queue.status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "waitTime":
          return a.waitTime - b.waitTime;
        case "queueLength":
          return a.queueLength - b.queueLength;
        case "alphabetical":
          return a.queueName.localeCompare(b.queueName);
        default:
          return 0;
      }
    });

    return sorted;
  }, [queues, sortBy, locationFilter, statusFilter]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(queues.map((q) => q.location));
    return Array.from(locations).sort();
  }, [queues]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-sky-50">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
                CampusOR
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 font-medium">
                Available Queues
              </p>
            </div>

            {/* Controls Section */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {/* Sort */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
                  Sort
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full border border border-black rounded-lg px-4 py-2.5 text-sm sm:text-base font-semibold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 hover:border-gray-400"
                >
                  <option value="waitTime">Wait Time</option>
                  <option value="queueLength">Queue Length</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
                  Location
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) =>
                    setLocationFilter(e.target.value as LocationFilter)
                  }
                  className="w-full border border border-black rounded-lg px-4 py-2.5 text-sm sm:text-base font-semibold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 hover:border-gray-400"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  className="w-full border border border-black rounded-lg px-4 py-2.5 text-sm sm:text-base font-semibold text-black bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 hover:border-gray-400"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Full</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-600">
            <p>Loading queues...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p>{error}</p>
          </div>
        ) : filteredAndSortedQueues.length > 0 ? (
          <div className="space-y-8">
            {Array.from({
              length: Math.ceil(filteredAndSortedQueues.length / 3),
            }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              >
                {filteredAndSortedQueues
                  .slice(rowIndex * 3, rowIndex * 3 + 3)
                  .map((queue) => (
                    <QueueCard key={queue.queueId} queue={queue} />
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-600">
            <p>No queues found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
