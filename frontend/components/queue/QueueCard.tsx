import { Queue } from "./queue.types";
import { useRouter } from "next/navigation";

interface QueueCardProps {
  queue: Queue;
}

export default function QueueCard({ queue }: QueueCardProps) {
  const router = useRouter();

  const getAccentColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-[#16A34A]"; // Success (Open)
      case "paused":
        return "bg-[#D97706]"; // Warning (Paused)
      case "closed":
        return "bg-[#DC2626]"; // Danger (Full / Closed)
      default:
        return "bg-[#16A34A]";
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "open":
        return { label: "Live", color: "#16A34A" };
      case "paused":
        return { label: "Paused", color: "#D97706" };
      case "closed":
        return { label: "Full", color: "#DC2626" };
      case "serving":
        return { label: "Serving", color: "#2563EB" };
      default:
        return { label: "Open", color: "#16A34A" };
    }
  };

  const statusInfo = getStatusInfo(queue.status);
  const isLive = queue.status === "open";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative">
      {/* Left accent line */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${getAccentColor(queue.status)}`}
      />

      <div className="p-5 pl-6">
        {/* Header with Status indicator */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-[#1E293B] leading-tight">
            {queue.queueName}
          </h3>
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50">
              <div className="w-2 h-2 rounded-full bg-[#16A34A]"></div>
              <span className="text-xs font-medium text-[#16A34A]">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusInfo.color }}
              ></div>
              <span
                className="text-xs font-medium"
                style={{ color: statusInfo.color }}
              >
                {statusInfo.label}
              </span>
            </div>
          )}
        </div>

        {/* Location and Counter */}
        <p className="text-sm text-[#64748B] mb-4 font-normal">
          {queue.location}
          {queue.counterNumber > 0 && ` • Counter ${queue.counterNumber}`}
        </p>

        {/* Queue Length and Estimated Wait Time Box */}
        <div className="border-dashed border border-gray-200 rounded-lg p-4 mb-4 bg-[#F8FAFC]">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-normal">
              Queue Length
            </span>
            <span className="font-normal text-gray-700">
              {queue.queueLength} people
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-normal">
              Estimated Wait
            </span>
            <span className="text-2xl font-bold text-[#2563EB]">
              {queue.waitTime === null || queue.waitTime === undefined
                ? "—"
                : `~ ${queue.waitTime} mins`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* View Kiosk Button */}
          <button
            className="bg-slate-700 text-white py-3 rounded-md font-bold text-base hover:bg-slate-600 transition-colors"
            onClick={() => {
              router.push(`/kiosk/${queue.queueId}`);
            }}
          >
            View
          </button>

          {/* Join Queue Button */}
          <button
            className="bg-[#2563EB] text-white py-3 rounded-md font-bold text-base hover:bg-[#1d4ed8] transition-colors"
            onClick={() => {
              // Placeholder for join queue action
              console.log("Join queue:", queue.queueId);
            }}
          >
            Join Queue
          </button>
        </div>
      </div>
    </div>
  );
}
