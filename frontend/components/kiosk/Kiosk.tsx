"use client";

import { subscribeToQueue } from "@/lib/websocket";
import { useEffect, useMemo, useState } from "react";

type QueueSnapshot = {
  queue: {
    id: string;
    name: string;
    location: string;
    status: "ACTIVE" | "PAUSED";
  };
  queueId: string;
  tokens: Array<{
    id: string;
    seq: number;
    status: string;
  }>;
};

type Props = {
  queueId: string;
};

export default function Kiosk({ queueId }: Props) {
  const [snapshot, setSnapshot] = useState<QueueSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!queueId) return;

    // Subscribe to WebSocket updates - initial snapshot will come from socket
    const unsubscribe = subscribeToQueue(queueId, {
      onUpdate: (payload) => {
        setSnapshot(payload as QueueSnapshot);
        setError(null);
      },
      onError: (err) => {
        setError(err.message || "Socket error");
      },
      onConnect: () => {
        setIsConnected(true);
        setError(null);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    return () => {
      unsubscribe();
      setSnapshot(null);
      setIsConnected(false);
    };
  }, [queueId]);

  const waitingTokens = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.tokens
      .filter((t) => t.status === "waiting")
      .sort((a, b) => a.seq - b.seq);
  }, [snapshot]);

  const nowServing = useMemo(() => {
    if (!snapshot) return null;
    const served = snapshot.tokens
      .filter((t) => t.status === "served")
      .sort((a, b) => b.seq - a.seq);
    return served[0] || null;
  }, [snapshot]);

  // Loading/connecting state
  if (!snapshot) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-4" />
          <p className="text-slate-200">Connecting to queue...</p>
          {error && (
            <p className="text-red-300 mt-2 text-sm">
              {error}
              <br />
              <span className="text-slate-400">Retrying...</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  const nextTokens = waitingTokens.slice(0, 8);
  const formatToken = (seq: number) => `T-${String(seq).padStart(3, "0")}`;

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <div className="relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <div className="h-[15vh] flex items-center justify-between border-b border-slate-700 px-6">
          <div className="flex-1"></div>
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {snapshot.queue.name}
            </h1>
            <p className="text-slate-300 mt-2">{snapshot.queue.location}</p>
          </div>
          <div className="flex-1 flex justify-end">
            {/* Connection status indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`}
              />
              <span className="text-xs text-slate-400">
                {isConnected ? "Live" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* NOW SERVING */}
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl text-slate-300 mb-4">NOW SERVING</h2>
            <div className="text-7xl md:text-8xl font-black animate-pulse">
              {nowServing ? formatToken(nowServing.seq) : "--"}
            </div>
            <p className="mt-4 text-slate-400">
              {nowServing
                ? "Please proceed to the counter"
                : "Awaiting next token"}
            </p>
          </div>

          {/* NEXT TOKENS */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl text-slate-300 mb-4">NEXT TOKENS</h2>
            <div className="grid grid-cols-2 gap-4">
              {nextTokens.length === 0 ? (
                <div className="col-span-2 text-slate-300">No one in line</div>
              ) : (
                nextTokens.map((token, index) => (
                  <div
                    key={token.id}
                      className="rounded-xl border-2 border-slate-600 bg-slate-800 p-4 text-slate-100"
                  >
                    <div className="text-2xl font-bold">
                      {formatToken(token.seq)}
                    </div>
                    <div className="text-xs mt-1 text-slate-400">
                      #{index + 1} in queue
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* STATUS */}
        <div className="p-6 border-t border-slate-700 text-center">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              snapshot.queue.status === "ACTIVE"
                ? "bg-green-200 text-green-900"
                : "bg-amber-200 text-amber-900"
            }`}
          >
            {snapshot.queue.status === "ACTIVE" ? "Open" : "Paused"}
          </span>
        </div>
      </div>
    </div>
  );
}
