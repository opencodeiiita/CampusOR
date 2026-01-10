"use client";

import { useEffect, useState } from "react";
import { kioskQueueMock } from "./MockData";

interface Counter {
  counterId: number;
  status: "busy" | "serving" | "idle";
  currentToken: string | null;
}

interface KioskData {
  queueId: string;
  queueName: string;
  location: string;
  nowServing: {
    tokenNumber: string;
    counter: number;
  };
  nextTokens: string[];
  counters: Counter[];
  lastUpdated: string;
}

function getInitialMockData(): KioskData {
  return {
    ...kioskQueueMock,
    counters: kioskQueueMock.counters.map((c) => ({
      counterId: c.counterId,
      status: c.status as Counter["status"],
      currentToken: c.currentToken,
    })),
  };
}

function getUpdatedMockData(currentData: KioskData): KioskData {
  if (currentData.nextTokens.length === 0) {
    return getInitialMockData();
  }

  const updated: KioskData = {
    ...currentData,
    nextTokens: [...currentData.nextTokens],
    counters: currentData.counters.map((c) => ({ ...c })),
  };

  const nextToken = updated.nextTokens[0];
  updated.nowServing = {
    tokenNumber: nextToken,
    counter: updated.nowServing.counter,
  };

  updated.nextTokens = updated.nextTokens.slice(1);

  updated.counters = updated.counters.map((counter) => {
    if (counter.counterId === updated.nowServing.counter) {
      return {
        ...counter,
        status: "serving",
        currentToken: nextToken,
      };
    }
    if (counter.status === "serving") {
      return {
        ...counter,
        status: "busy",
      };
    }
    return counter;
  });

  updated.lastUpdated = new Date().toISOString();
  return updated;
}

export default function Kiosk() {
  const [data, setData] = useState<KioskData>(getInitialMockData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => getUpdatedMockData(prev));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
              {data.queueName}
            </h1>
            <p className="text-slate-300 mt-2">{data.location}</p>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* NOW SERVING */}
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl text-slate-300 mb-4">NOW SERVING</h2>
            <div className="text-7xl md:text-8xl font-black animate-pulse">
              {data.nowServing.tokenNumber}
            </div>
            <p className="mt-4 text-slate-400">
              Counter {data.nowServing.counter}
            </p>
          </div>

          {/* NEXT TOKENS */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl text-slate-300 mb-4">NEXT TOKENS</h2>
            <div className="grid grid-cols-2 gap-4">
              {data.nextTokens.slice(0, 8).map((token, index) => (
                <div
                  key={token}
                  className={`rounded-xl border-2 p-4 text-slate-800 ${
                    cardColors[index % cardColors.length]
                  }`}
                >
                  <div className="text-2xl font-bold">{token}</div>
                  <div className="text-xs mt-1 text-slate-600">
                    #{index + 1} in queue
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COUNTER STATUS */}
        <div className="p-6 border-t border-slate-700">
          <h2 className="text-xl text-slate-300 mb-6 text-center">
            COUNTER STATUS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.counters.map((counter, index) => (
              <div
                key={counter.counterId}
                className={`rounded-2xl border-2 p-5 text-slate-800 ${
                  cardColors[index % cardColors.length]
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold">
                    Counter {counter.counterId}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(
                      counter.status
                    )}`}
                  >
                    {getStatusText(counter.status)}
                  </span>
                </div>

                {counter.currentToken ? (
                  <div className="text-base font-semibold">
                    Token: {counter.currentToken}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">Available</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
