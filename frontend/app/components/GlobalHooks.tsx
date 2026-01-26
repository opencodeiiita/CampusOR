"use client";

import { useSocketToasts } from "../hooks/useSocketToasts";

export default function GlobalHooks() {
  useSocketToasts();
  return null;
}
