"use client";

import { apiService } from "@/app/services/api";
import NowServingCard from "@/operator/NowServingCard";
import OperatorControls from "@/operator/OperatorControls";
import OperatorHeader from "@/operator/OperatorHeader";
import TokenList from "@/operator/TokenList";
import { subscribeToQueue } from "@/lib/websocket";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Token = { id: string; number: number; status: string };

type QueueData = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  location: string;
};

type OperatorQueue = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  location: string;
};

type OperatorViewToken = {
  id: string;
  number?: number;
  seq?: number;
  status: string;
};

type OperatorViewResponse = {
  queue: QueueData;
  tokens: OperatorViewToken[];
  nowServing?: { id: string; number: number } | null;
};

type QueueUpdatePayload = {
  queue: QueueData;
  queueId: string;
  tokens: Array<{ id: string; seq: number; status: string }>;
};

type QueueMetrics = {
  waitingCount: number;
  nowServing: number | null;
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

const normalizeTokens = (tokens: OperatorViewToken[]): Token[] => {
  const mapped = tokens
    .map((t) => {
      const number = t.number ?? t.seq;
      if (typeof number !== "number") return null;
      return { id: t.id, number, status: t.status };
    })
    .filter((t): t is Token => t !== null);

  return mapped.sort((a, b) => a.number - b.number);
};

export default function OperatorLiveQueuesPage() {
  const searchParams = useSearchParams();
  const queueIdParam = searchParams.get("queueId");

  const [queues, setQueues] = useState<OperatorQueue[]>([]);
  const [queueMetrics, setQueueMetrics] = useState<
    Record<string, QueueMetrics>
  >({});
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [loadingQueues, setLoadingQueues] = useState(true);
  const [queueListError, setQueueListError] = useState<string | null>(null);

  const [loadingQueue, setLoadingQueue] = useState(true);
  const [queue, setQueue] = useState<QueueData | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [nowServing, setNowServing] = useState<{
    id: string;
    number: number;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeQueues = useMemo(
    () => queues.filter((queue) => queue.status === "ACTIVE"),
    [queues]
  );

  const waitingTokens = useMemo(
    () => tokens.filter((t) => t.status === "waiting"),
    [tokens]
  );

  const loadQueues = useCallback(async () => {
    try {
      setLoadingQueues(true);
      const data = await apiService.get("/operator/queues", true);
      setQueues(parseQueues(data));
      setQueueListError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to load queues";
      console.error("Failed to load queues", err);
      setQueueListError(message);
    } finally {
      setLoadingQueues(false);
    }
  }, []);

  useEffect(() => {
    loadQueues();
  }, [loadQueues]);

  useEffect(() => {
    if (queueIdParam && queues.some((q) => q.id === queueIdParam)) {
      setSelectedQueueId(queueIdParam);
      return;
    }

    if (!selectedQueueId && queues.length > 0) {
      const preferred = activeQueues[0]?.id || queues[0]?.id || null;
      setSelectedQueueId(preferred);
    }

    if (selectedQueueId && queues.length > 0) {
      const exists = queues.some((q) => q.id === selectedQueueId);
      if (!exists) {
        setSelectedQueueId(activeQueues[0]?.id || queues[0]?.id || null);
      }
    }
  }, [queueIdParam, queues, activeQueues, selectedQueueId]);

  const updateMetrics = useCallback((queueId: string, data: QueueMetrics) => {
    setQueueMetrics((prev) => ({
      ...prev,
      [queueId]: data,
    }));
  }, []);

  const loadQueueMetrics = useCallback(async () => {
    if (activeQueues.length === 0) return;

    const metricsUpdates: Record<string, QueueMetrics> = {};

    await Promise.all(
      activeQueues.map(async (queue) => {
        try {
          const data = await apiService.get(
            `/queues/${queue.id}/operator-view`,
            true
          );
          metricsUpdates[queue.id] = {
            waitingCount: data.tokens?.length || 0,
            nowServing: data.nowServing?.number ?? null,
          };
        } catch (err) {
          console.error("Failed to fetch queue metrics", err);
        }
      })
    );

    setQueueMetrics((prev) => ({
      ...prev,
      ...metricsUpdates,
    }));
  }, [activeQueues]);

  useEffect(() => {
    loadQueueMetrics();
  }, [loadQueueMetrics]);

  const hydrateFromSnapshot = useCallback(
    (payload: QueueUpdatePayload) => {
      setQueue({
        id: payload.queue.id,
        name: payload.queue.name,
        location: payload.queue.location,
        status: payload.queue.status,
      });

      setQueues((prev) =>
        prev.map((item) =>
          item.id === payload.queue.id
            ? { ...item, status: payload.queue.status }
            : item
        )
      );

      const mappedTokens = normalizeTokens(payload.tokens);

      setTokens(mappedTokens);

      const served = mappedTokens
        .filter((t) => t.status === "served")
        .sort((a, b) => b.number - a.number);

      setNowServing(
        served[0] ? { id: served[0].id, number: served[0].number } : null
      );

      updateMetrics(payload.queue.id, {
        waitingCount: mappedTokens.filter((t) => t.status === "waiting").length,
        nowServing: served[0]?.number ?? null,
      });
    },
    [updateMetrics]
  );

  const loadSelectedQueue = useCallback(async () => {
    if (!selectedQueueId) return;
    try {
      setLoadingQueue(true);
      const data = (await apiService.get(
        `/queues/${selectedQueueId}/operator-view`,
        true
      )) as OperatorViewResponse;
      const normalizedTokens = normalizeTokens(data.tokens || []);
      setQueue(data.queue);
      setTokens(normalizedTokens);
      setNowServing(
        data.nowServing
          ? { id: data.nowServing.id, number: data.nowServing.number }
          : null
      );
      updateMetrics(selectedQueueId, {
        waitingCount: normalizedTokens.length,
        nowServing: data.nowServing?.number ?? null,
      });
      setQueues((prev) =>
        prev.map((item) =>
          item.id === data.queue.id
            ? { ...item, status: data.queue.status }
            : item
        )
      );
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load queue";
      console.error("Failed to load queue", err);
      setError(message);
    } finally {
      setLoadingQueue(false);
    }
  }, [selectedQueueId, updateMetrics]);

  useEffect(() => {
    if (!selectedQueueId) return;

    loadSelectedQueue();
    const unsubscribe = subscribeToQueue(selectedQueueId, {
      onUpdate: hydrateFromSnapshot,
      onError: (err) => console.error("Socket error", err),
    });
    return () => {
      unsubscribe();
    };
  }, [selectedQueueId, hydrateFromSnapshot, loadSelectedQueue]);

  const callAction = async (action: string, method: "POST" | "PATCH") => {
    if (!selectedQueueId) return;
    try {
      setActionLoading(action);
      setError(null);
      if (method === "POST") {
        await apiService.post(
          `/operator/queues/${selectedQueueId}/${action}`,
          {},
          true
        );
      } else {
        await apiService.patch(
          `/operator/queues/${selectedQueueId}/${action}`,
          {},
          true
        );
      }
      await loadSelectedQueue();
      toast.success("Queue updated successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Action failed";
      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const serveNext = () => callAction("serve-next", "POST");
  const skipToken = () => callAction("skip", "POST");
  const recallToken = () => callAction("recall", "POST");
  const toggleQueueStatus = () =>
    queue?.status === "ACTIVE"
      ? callAction("pause", "PATCH")
      : callAction("resume", "PATCH");

  if (loadingQueues) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (queueListError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        {queueListError}
      </div>
    );
  }

  if (queues.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          No queues yet
        </h2>
        <p className="text-slate-600 mb-6">
          Create a queue to start serving users.
        </p>
        <Link
          href="/dashboard/operator/create"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition-colors"
        >
          Create a queue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(15,23,42,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                Live Queues
              </h1>
              <p className="text-slate-600 text-lg">
                Switch between active queues without leaving the dashboard.
              </p>
            </div>
            <Link
              href="/dashboard/operator/queues"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-white transition-colors"
            >
              View all queues
            </Link>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Active queues
              </h2>
              <span className="text-xs text-slate-400">
                {activeQueues.length} active
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {activeQueues.map((queueItem) => {
                const metrics = queueMetrics[queueItem.id];
                const isSelected = queueItem.id === selectedQueueId;
                return (
                  <button
                    key={queueItem.id}
                    onClick={() => setSelectedQueueId(queueItem.id)}
                    className={`min-w-[220px] text-left bg-white border rounded-2xl p-4 shadow-sm transition-all ${
                      isSelected
                        ? "border-sky-500 ring-2 ring-sky-200"
                        : "border-slate-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {queueItem.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <span>📍</span>
                          {queueItem.location}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        Live
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-slate-500">Waiting</p>
                        <p className="text-slate-900 font-semibold text-sm">
                          {metrics ? metrics.waitingCount : "—"}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-slate-500">Now Serving</p>
                        <p className="text-slate-900 font-semibold text-sm">
                          {metrics?.nowServing ?? "—"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              {error}
            </div>
          )}

          {loadingQueue ? (
            <div className="flex justify-center items-center min-h-[40vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
          ) : !queue ? (
            <div className="p-8 text-center text-red-500">Queue not found.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="text-sm font-medium text-slate-600">
                    Waiting
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {waitingTokens.length}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="text-sm font-medium text-slate-600">
                    Queue Status
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1 capitalize">
                    {queue.status.toLowerCase()}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="text-sm font-medium text-slate-600">
                    Now Serving
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {nowServing ? nowServing.number : "None"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <OperatorHeader queue={queue} status={queue.status} />
                  <NowServingCard token={nowServing} />
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <TokenList tokens={waitingTokens} />
                  <OperatorControls
                    onServeNext={serveNext}
                    onSkip={skipToken}
                    onRecall={recallToken}
                    onToggleQueue={toggleQueueStatus}
                    queueStatus={queue.status}
                  />
                  {actionLoading && (
                    <p className="text-sm text-slate-500">
                      Processing {actionLoading.replace("-", " ")}...
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
