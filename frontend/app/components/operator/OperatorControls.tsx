type Props = {
  onServeNext: () => void;
  onSkip: () => void;
  onRecall: () => void;
  onToggleQueue: () => void;
  queueStatus: string;
};

export default function OperatorControls({
  onServeNext,
  onSkip,
  onRecall,
  onToggleQueue,
  queueStatus,
}: Props) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex gap-4 flex-wrap">
        <button onClick={onServeNext} className="btn">
          Serve Next
        </button>

        <button onClick={onSkip} className="btn">
          Skip
        </button>

        <button onClick={onRecall} className="btn">
          Recall
        </button>

        <button
          onClick={onToggleQueue}
          className={`btn ${
            queueStatus === "ACTIVE"
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          {queueStatus === "ACTIVE" ? "Pause Queue" : "Resume Queue"}
        </button>
      </div>
    </div>
  );
}
