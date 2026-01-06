"use client";

import { mockQueue, mockTokens } from "@/operator/MockData";
import NowServingCard from "@/operator/NowServingCard";
import OperatorControls from "@/operator/OperatorControls";
import OperatorHeader from "@/operator/OperatorHeader";
import TokenList from "@/operator/TokenList";
import { useState } from "react";

export default function OperatorDashboard() {
  const [queueStatus, setQueueStatus] = useState(mockQueue.status);
  const [tokens, setTokens] = useState(mockTokens);
  const [currentToken, setCurrentToken] = useState<{
    id: string;
    number: number;
    status: string;
  } | null>(null);

  // Serve next waiting token
  const serveNext = () => {
    if (queueStatus === "PAUSED") return;

    const nextToken = tokens.find((token) => token.status === "WAITING");

    if (!nextToken) return;

    setCurrentToken(nextToken);

    setTokens((prev) =>
      prev.map((token) =>
        token.id === nextToken.id ? { ...token, status: "SERVED" } : token
      )
    );
  };

  // Skip current token
  const skipToken = () => {
    if (!currentToken) return;

    setTokens((prev) =>
      prev.map((token) =>
        token.id === currentToken.id ? { ...token, status: "SKIPPED" } : token
      )
    );

    setCurrentToken(null);
  };

  // Recall current token (mock behavior)
  const recallToken = () => {
    if (!currentToken) return;

    alert(`Recalling Token ${currentToken.number}`);
  };

  // Pause / Resume queue
  const toggleQueueStatus = () => {
    setQueueStatus((prev) => (prev === "ACTIVE" ? "PAUSED" : "ACTIVE"));
  };

  // ------------------ UI ------------------
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <OperatorHeader queue={mockQueue} status={queueStatus} />

      <NowServingCard token={currentToken} />

      <TokenList tokens={tokens.slice(0, 10)} />

      <OperatorControls
        onServeNext={serveNext}
        onSkip={skipToken}
        onRecall={recallToken}
        onToggleQueue={toggleQueueStatus}
        queueStatus={queueStatus}
      />
    </div>
  );
}
