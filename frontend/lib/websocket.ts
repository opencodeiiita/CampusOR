import { io, Socket } from "socket.io-client";

// Backend Socket.IO types
export interface QueueSnapshot {
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

export interface TokenData {
  id: string;
  queueId: string;
  seq: number;
  status: string;
  createdAt: string;
}

interface ServerToClientEvents {
  updateQueue: (data: QueueSnapshot) => void;
  tokenGenerated: (data: TokenData) => void;
  error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
  joinQueue: (
    data: { queueId: string },
    callback: (response: { success: boolean; token?: TokenData; error?: string }) => void
  ) => void;
  subscribeQueue: (data: { queueId: string }) => void;
  unsubscribeQueue: (data: { queueId: string }) => void;
}

class WebSocketClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private readonly url: string;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor() {
    // Use environment variable or default to localhost
    this.url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
  }

  /**
   * Connect to the Socket.IO server
   */
  connect(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.url, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket.IO connected:", this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
      }
    });

    this.socket.on("error", (data) => {
      console.error("Socket error:", data.message);
    });

    return this.socket;
  }

  /**
   * Subscribe to queue updates
   */
  subscribeQueue(
    queueId: string,
    onUpdate: (data: QueueSnapshot) => void,
    onError?: (message: string) => void
  ): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected. Call connect() first.");
      return;
    }

    // Listen for queue updates
    this.socket.on("updateQueue", onUpdate);

    // Listen for errors
    if (onError) {
      this.socket.on("error", (data) => onError(data.message));
    }

    // Subscribe to the queue room
    this.socket.emit("subscribeQueue", { queueId });
    console.log(`📡 Subscribed to queue: ${queueId}`);
  }

  /**
   * Unsubscribe from queue updates
   */
  unsubscribeQueue(queueId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    // Remove all listeners for updateQueue
    this.socket.off("updateQueue");
    this.socket.off("error");

    // Unsubscribe from the queue room
    this.socket.emit("unsubscribeQueue", { queueId });
    console.log(`📡 Unsubscribed from queue: ${queueId}`);
  }

  /**
   * Join a queue (generate a token)
   */
  joinQueue(
    queueId: string,
    callback: (response: { success: boolean; token?: TokenData; error?: string }) => void
  ): void {
    if (!this.socket?.connected) {
      callback({ success: false, error: "Socket not connected" });
      return;
    }

    this.socket.emit("joinQueue", { queueId }, callback);
  }

  /**
   * Listen for token generation events
   */
  onTokenGenerated(callback: (token: TokenData) => void): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.on("tokenGenerated", callback);
  }

  /**
   * Disconnect the socket
   */
  disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
      console.log("Socket disconnected");
    }
    this.socket = null;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get the socket instance (for advanced usage)
   */
  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();