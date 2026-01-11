"use client";

import { QueueSnapshot } from "../../lib/websocket";

interface KioskProps {
  queueData: QueueSnapshot;
}

interface Counter {
  counterId: number;
  status: "busy" | "serving" | "idle";
  currentToken: string | null;
}

export default function Kiosk({ queueData }: KioskProps) {
  // Get the currently serving token (the one with "SERVED" status or the latest active one)
  const servingTokens = queueData.tokens.filter(
    (t) => t.status === "SERVED" || t.status === "ACTIVE"
  );
  const nowServingToken = servingTokens[servingTokens.length - 1];

  // Get the next tokens (waiting tokens)
  const waitingTokens = queueData.tokens.filter((t) => t.status === "WAITING");
  const nextTokens = waitingTokens.slice(0, 8);

  // Mock counter data (since backend doesn't provide counter-specific info yet)
  // In a real implementation, this would come from the backend
  const counters: Counter[] = [
    {
      counterId: 1,
      status: nowServingToken ? "serving" : "idle",
      currentToken: nowServingToken ? `T-${String(nowServingToken.seq).padStart(3, "0")}` : null,
    },
    { counterId: 2, status: "busy", currentToken: null },
    { counterId: 3, status: "idle", currentToken: null },
  ];

  const cardColors = [
    "bg-red-100 border-red-400",
    "bg-green-100 border-green-400",
    "bg-orange-100 border-orange-400",
    "bg-pink-100 border-pink-400",
  ];

  const getStatusBadge = (status: Counter["status"]) => {
    switch (status) {
      case "serving":
        return "bg-green-600 text-white";
      case "busy":
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: Counter["status"]) => {
    switch (status) {
      case "serving":
        return "Serving";
      case "busy":
        return "Busy";
      default:
        return "Available";
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <div className="relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <div className="h-[15vh] flex items-center justify-center border-b border-slate-700">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Queue {queueData.queueId.slice(0, 8)}
            </h1>
            <p className="text-slate-300 mt-2">Live Queue Display</p>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* NOW SERVING */}
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl text-slate-300 mb-4">NOW SERVING</h2>
            {nowServingToken ? (
              <>
                <div className="text-7xl md:text-8xl font-black animate-pulse">
                  T-{String(nowServingToken.seq).padStart(3, "0")}
                </div>
                <p className="mt-4 text-slate-400">Counter 1</p>
              </>
            ) : (
              <div className="text-3xl text-slate-500">
                Waiting for next token...
              </div>
            )}
          </div>

          {/* NEXT TOKENS */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl text-slate-300 mb-4">NEXT TOKENS</h2>
            {nextTokens.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {nextTokens.map((token, index) => (
                  <div
                    key={token.id}
                    className={`rounded-xl border-2 p-4 text-slate-800 ${
                      cardColors[index % cardColors.length]
                    }`}
                  >
                    <div className="text-2xl font-bold">
                      T-{String(token.seq).padStart(3, "0")}
                    </div>
                    <div className="text-xs mt-1 text-slate-600">
                      #{index + 1} in queue
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500">No tokens waiting</div>
            )}
          </div>
        </div>

        {/* QUEUE STATS */}
        <div className="p-6 border-t border-slate-700">
          <h2 className="text-xl text-slate-300 mb-6 text-center">
            QUEUE STATISTICS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border-2 border-blue-400 bg-blue-100 p-5 text-slate-800">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {queueData.stats.totalWaiting}
                </div>
                <div className="text-sm mt-2 text-slate-700">Waiting</div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-green-400 bg-green-100 p-5 text-slate-800">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {queueData.stats.totalActive}
                </div>
                <div className="text-sm mt-2 text-slate-700">Active</div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-purple-400 bg-purple-100 p-5 text-slate-800">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">
                  {queueData.stats.totalCompleted}
                </div>
                <div className="text-sm mt-2 text-slate-700">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
