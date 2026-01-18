import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { TokenService } from "../modules/queue/services/token.service.js";
import { Queue, Token, TokenStatus } from "../modules/queue/queue.model.js";

interface QueueSnapshot {
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
}

interface TokenData {
  id: string;
  queueId: string;
  seq: number;
  status: string;
  createdAt: string;
}

interface JoinQueueResponse {
  success: boolean;
  token?: TokenData;
  error?: string;
}

interface ServerToClientEvents {
  updateQueue: (data: QueueSnapshot) => void;
  tokenGenerated: (data: TokenData) => void;
  error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
  joinQueue: (
    data: { queueId: string },
    callback: (response: JoinQueueResponse) => void,
  ) => void;
  subscribeQueue: (data: { queueId: string }) => void;
  unsubscribeQueue: (data: { queueId: string }) => void;
}

let io: Server<ClientToServerEvents, ServerToClientEvents>;

export function initializeSocket(httpServer: HttpServer): void {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", handleConnection);
  console.log("✅ Socket.IO server initialized");
}

//  CONNECTION HANDLER

function handleConnection(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
): void {
  console.log(`Client connected: ${socket.id}`);

  socket.on("joinQueue", (data, callback) =>
    handleJoinQueue(socket, data, callback),
  );
  socket.on("subscribeQueue", (data) => handleSubscribeToQueue(socket, data));
  socket.on("unsubscribeQueue", (data) =>
    handleUnsubscribeFromQueue(socket, data),
  );
  socket.on("disconnect", () => handleDisconnect(socket));
}

// EVENT HANDLERS

async function handleJoinQueue(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  data: { queueId: string },
  callback: (response: JoinQueueResponse) => void,
): Promise<void> {
  try {
    const { queueId } = data;
    console.log(`Client ${socket.id} joining queue ${queueId}`);

    if (!queueId) {
      const response: JoinQueueResponse = {
        success: false,
        error: "Queue ID is required",
      };
      callback(response);
      return;
    }
    const result = await TokenService.generateToken(queueId);

    if (!result.success || !result.token) {
      console.log(`Failed to generate token: ${result.error}`);
      callback({
        success: false,
        error: result.error || "Failed to generate token",
      });

      socket.emit("error", {
        message: result.error || "Failed to generate token",
      });
      return;
    }

    const response: JoinQueueResponse = {
      success: true,
      token: result.token,
    };
    callback(response);
    socket.emit("tokenGenerated", result.token);
    await broadcastQueueUpdate(queueId);
  } catch (error) {
    console.log(`Error in joinQueue for client ${socket.id}`, error);

    const response: JoinQueueResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to join queue",
    };
    callback(response);
    socket.emit("error", {
      message: error instanceof Error ? error.message : "Failed to join queue",
    });
  }
}

async function handleSubscribeToQueue(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  data: { queueId: string },
): Promise<void> {
  try {
    const { queueId } = data;
    if (!queueId) {
      socket.emit("error", { message: "queueId is required" });
      return;
    }
    const roomName = getRoomName(queueId);
    socket.join(roomName);

    console.log(`Client ${socket.id} subscribed to queue ${queueId}`);

    try {
      const snapshot = await getQueueSnapshot(queueId);
      socket.emit("updateQueue", snapshot);
    } catch (error) {
      console.error(`Error fetching initial queue snapshot:`, error);
      socket.emit("error", {
        message: "Failed to fetch queue state",
      });
    }
  } catch (error) {
    console.log(`Error in subscribeQueue for client ${socket.id}`, error);
    socket.emit("error", {
      message:
        error instanceof Error ? error.message : "Failed to subscribe to queue",
    });
  }
}

function handleUnsubscribeFromQueue(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  data: { queueId: string },
): void {
  try {
    const { queueId } = data;
    if (!queueId) {
      socket.emit("error", { message: "queueId is required" });
      return;
    }
    const roomName = getRoomName(queueId);
    socket.leave(roomName);
    console.log(`Client ${socket.id} unsubscribed from queue ${queueId}`);
  } catch (error) {
    console.log(`Error in unsubscribeQueue for client ${socket.id}`, error);
    socket.emit("error", {
      message:
        error instanceof Error
          ? error.message
          : "Failed to unsubscribe from queue",
    });
  }
}

function handleDisconnect(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
): void {
  console.log(`Client disconnected: ${socket.id}`);
}

//  UTILITY FUNCTIONS

export async function broadcastQueueUpdate(queueId: string): Promise<void> {
  try {
    const roomName = getRoomName(queueId);
    const snapshot = await getQueueSnapshot(queueId);

    console.log(`Broadcasting queue update for queue ${roomName}`);

    io.to(roomName).emit("updateQueue", snapshot);
  } catch (error) {
    console.error(`Error broadcasting queue update for queue ${queueId}:`, error);
    // Don't throw - broadcast failures shouldn't break the main flow
    // But log the error for monitoring/debugging
  }
}

export function emitErrorToClient(socketId: string, message: string): void {
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.emit("error", { message });
  }
}

function getRoomName(queueId: string): string {
  return `queue:${queueId}`;
}

export function getIO(): Server<
  ClientToServerEvents,
  ServerToClientEvents
> | null {
  return io || null;
}

// QUEUE SNAPSHOT HELPER
async function getQueueSnapshot(queueId: string): Promise<QueueSnapshot> {
  const queue = await Queue.findById(queueId);
  if (!queue) {
    throw new Error("Queue not found");
  }

  // Only fetch active tokens (WAITING and SERVED) for efficiency
  // This significantly reduces data transfer and improves performance
  const activeTokens = await Token.find({
    queue: queueId,
    status: { $in: [TokenStatus.WAITING, TokenStatus.SERVED] },
  })
    .sort({ seq: 1 })
    .lean();

  // Calculate stats efficiently
  const stats = {
    totalWaiting: activeTokens.filter((t) => t.status === TokenStatus.WAITING).length,
    totalActive: activeTokens.filter((t) => t.status === TokenStatus.SERVED).length,
    // Count completed tokens separately (only count, don't fetch all)
    totalCompleted: await Token.countDocuments({
      queue: queueId,
      status: TokenStatus.COMPLETED,
    }),
  };

  return {
    queue: {
      id: queue._id.toString(),
      name: queue.name,
      location: queue.location,
      status: queue.isActive ? "ACTIVE" : "PAUSED",
      nextSequence: queue.nextSequence,
    },
    queueId,
    tokens: activeTokens.map((t) => ({
      id: t._id.toString(),
      seq: t.seq,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
    stats,
  };
}
