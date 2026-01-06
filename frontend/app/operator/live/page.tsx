"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // To get queueId from URL
import { apiService } from "@/app/services/api";

// Types matching Backend Response
interface Token { id: string; number: number; status: string; }
interface QueueState {
  queue: { id: string; name: string; isActive: boolean };
  tokens: Token[];
  nowServing: Token | null;
}

export default function OperatorLiveDashboard() {
  const searchParams = useSearchParams();
  const queueId = searchParams.get("queueId"); // URL?queueId=...

  const [data, setData] = useState<QueueState | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch State
  const fetchState = async () => {
    if (!queueId) return;
    try {
      const res = await apiService.get(`/api/queues/${queueId}/operator-view`, true);
      if (res.success) setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    // Poll every 5 seconds for updates (since no WebSocket yet)
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [queueId]);

  // 2. Actions
  const handleAction = async (tokenId: string, status: "served" | "skipped") => {
    try {
      await apiService.patch(`/api/queues/tokens/${tokenId}/status`, { status }, true); // Note route prefix might differ based on your index.ts
      fetchState(); // Refresh UI
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Unknown error occurred";
      alert(`Action failed: ${message}`);
    }
  };

  const toggleQueue = async () => {
    if (!queueId) return;
    await apiService.patch(`/api/queues/${queueId}`, {}, true);
    fetchState();
  };

  if (!queueId) return <div>Please select or create a queue first.</div>;
  if (loading) return <div>Loading Queue State...</div>;
  if (!data) return <div>Error loading data</div>;

  const nextToken = data.tokens[0]; // Top of the list

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{data.queue.name} <span className="text-sm font-normal text-gray-500">({data.queue.isActive ? "Live" : "Paused"})</span></h1>
        <button onClick={toggleQueue} className={`px-4 py-2 rounded ${data.queue.isActive ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
          {data.queue.isActive ? "Pause Queue" : "Resume Queue"}
        </button>
      </header>

      {/* Now Serving Area */}
      <div className="bg-blue-50 p-8 rounded-xl text-center mb-8 border border-blue-100">
        <h2 className="text-gray-500 uppercase tracking-wide text-sm font-semibold">Now Serving</h2>
        <div className="text-6xl font-bold text-blue-700 my-4">
          {data.nowServing ? `#${data.nowServing.number}` : "--"}
        </div>
      </div>

      {/* Controls for Next Token */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h3 className="font-semibold mb-4">Up Next: {nextToken ? `#${nextToken.number}` : "No one waiting"}</h3>
        <div className="flex gap-4">
          <button 
            disabled={!nextToken}
            onClick={() => handleAction(nextToken.id, "served")}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            Call & Serve Next
          </button>
          <button 
            disabled={!nextToken}
            onClick={() => handleAction(nextToken.id, "skipped")}
            className="px-6 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Waiting List */}
      <div>
        <h3 className="font-semibold mb-2">Waiting List ({data.tokens.length})</h3>
        <div className="space-y-2">
          {data.tokens.slice(1).map(token => (
            <div key={token.id} className="p-3 bg-gray-50 rounded flex justify-between">
              <span>Token #{token.number}</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">Waiting</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}