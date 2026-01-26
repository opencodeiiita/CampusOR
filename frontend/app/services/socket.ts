import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: true,
});
