import { io, Socket } from "socket.io-client";

type UpdateQueuePayload = {
  queue: {
    id: string;
    name: string;
    location: string;
    status: "ACTIVE" | "PAUSED";
    nextSequence: number;
  };
  queueId: string;
  tokens: Array<{
    id: string;
    seq: number;
    status: string;
    createdAt: string;
  }>;
  stats: {
    totalWaiting: number;
    totalActive: number;
    totalCompleted: number;
  };
};

type SubscribeHandlers = {
  onUpdate?: (snapshot: UpdateQueuePayload) => void;
  onError?: (error: { message: string }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

let socket: Socket | null = null;
const subscribedQueues = new Set<string>();

function getSocket(): Socket {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
  });

  socket.on("connect", () => {
    console.log("Socket connected");
    // Re-subscribe to all rooms after reconnect
    subscribedQueues.forEach((queueId) => {
      socket?.emit("subscribeQueue", { queueId });
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
}

export function subscribeToQueue(queueId: string, handlers: SubscribeHandlers) {
  const client = getSocket();
  const { onUpdate, onError, onConnect, onDisconnect } = handlers;

  const handleUpdate = (payload: UpdateQueuePayload) => {
    if (payload.queueId !== queueId) return;
    onUpdate?.(payload);
  };
  const handleError = (err: { message: string }) => onError?.(err);
  const handleConnect = () => onConnect?.();
  const handleDisconnect = () => onDisconnect?.();

  client.on("updateQueue", handleUpdate);
  client.on("error", handleError);
  client.on("connect", handleConnect);
  client.on("disconnect", handleDisconnect);

  subscribedQueues.add(queueId);
  client.emit("subscribeQueue", { queueId });

  // If already connected, trigger onConnect immediately
  if (client.connected) {
    onConnect?.();
  }

  return () => {
    subscribedQueues.delete(queueId);
    client.emit("unsubscribeQueue", { queueId });
    client.off("updateQueue", handleUpdate);
    client.off("error", handleError);
    client.off("connect", handleConnect);
    client.off("disconnect", handleDisconnect);
  };
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  subscribedQueues.clear();
}
