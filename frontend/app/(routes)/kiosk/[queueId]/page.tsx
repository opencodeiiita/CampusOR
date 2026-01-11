"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Kiosk from "../../../../components/kiosk/Kiosk";
import { wsClient, QueueSnapshot } from "../../../../lib/websocket";

export default function DynamicKioskPage() {
  const params = useParams();
  const router = useRouter();
  const queueId = params.queueId as string;

  const [queueData, setQueueData] = useState<QueueSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  useEffect(() => {
    if (!queueId) {
      setError("No queue ID provided");
      setLoading(false);
      return;
    }

    // Connect to Socket.IO server
    const socket = wsClient.connect();

    setConnectionStatus("connecting");

    const handleConnect = () => {
      console.log("Connected to Socket.IO");
      setConnectionStatus("connected");
      setError(null);
      
      // Subscribe once connected
      wsClient.subscribeQueue(
        queueId,
        (snapshot: QueueSnapshot) => {
          console.log("Received queue update:", snapshot);
          setQueueData(snapshot);
          setLoading(false);
          setError(null);
        },
        (errorMessage: string) => {
          console.error("Queue error:", errorMessage);
          setError(errorMessage);
          setLoading(false);
        }
      );
    };

    const handleDisconnect = () => {
      console.log("Disconnected from Socket.IO");
      setConnectionStatus("disconnected");
      setError("Connection lost. Attempting to reconnect...");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // If already connected, subscribe immediately
    if (socket.connected) {
      handleConnect();
    }

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up kiosk subscription");
      wsClient.unsubscribeQueue(queueId);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      // Don't disconnect the socket entirely - other components might be using it
    };
  }, [queueId]);

  // Loading state
  if (loading) {
    return (
      <main className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading queue data...</p>
          <p className="text-sm text-slate-400 mt-2">
            {connectionStatus === "connecting" ? "Connecting to server..." : "Fetching queue..."}
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (error && !queueData) {
    return (
      <main className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => router.push("/queue")}
            className="bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition"
          >
            Back to Queue List
          </button>
        </div>
      </main>
    );
  }

  // Render kiosk with real-time data
  return (
    <main className="h-screen w-screen overflow-hidden">
      {queueData && <Kiosk queueData={queueData} />}
      
      {/* Connection status indicator */}
      {connectionStatus !== "connected" && (
        <div className="fixed top-4 right-4 bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="animate-pulse w-2 h-2 bg-slate-900 rounded-full"></div>
            <span className="text-sm font-semibold">
              {connectionStatus === "connecting" ? "Connecting..." : "Reconnecting..."}
            </span>
          </div>
        </div>
      )}

      {/* Error banner (non-fatal) */}
      {error && queueData && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </main>
  );
}
