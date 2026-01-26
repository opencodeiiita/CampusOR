"use client";

import { useEffect } from "react";
import { socket } from "../services/socket";
import { toastBus } from "../utils/toastBus";

export const useSocketToasts = () => {
  useEffect(() => {
    socket.on("tokenGenerated", () => {
      toastBus.success("Token generated successfully");
    });

    socket.on("updateQueue", () => {
      toastBus.info("Queue updated");
    });

    socket.on("error", (data) => {
      toastBus.error(data?.message || "Socket error occurred");
    });

    socket.on("disconnect", () => {
      toastBus.warning("Connection lost");
    });

    socket.on("reconnect", () => {
      toastBus.success("Reconnected to server");
    });

    return () => {
      socket.off("tokenGenerated");
      socket.off("updateQueue");
      socket.off("error");
      socket.off("disconnect");
      socket.off("reconnect");
    };
  }, []);
};
