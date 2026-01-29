type Props = {
  onServeNext: () => void;
  onSkip: () => void;
  onRecall: () => void;
  onExtend: () => void;
  onNoShow: () => void;
  onToggleQueue: () => void;
  queueStatus: string;
};

export default function OperatorControls({
  onServeNext,
  onSkip,
  onRecall,
  onExtend,
  onNoShow,
  onToggleQueue,
  queueStatus,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          Queue Controls
        </h3>
        <button
          onClick={onToggleQueue}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${queueStatus === "ACTIVE"
            ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
            }`}
        >
          {queueStatus === "ACTIVE" ? "Pause Queue" : "Resume Queue"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Primary Action */}
        <button
          onClick={onServeNext}
          className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-sm hover:shadow transition-all group"
        >
          <span className="text-lg">Serve Next</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>

        {/* Secondary Actions */}
        <button
          onClick={onExtend}
          className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center gap-1 font-medium transition-colors"
        >
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-sm">Extend Timer</span>
        </button>

        <button
          onClick={onRecall}
          className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center gap-1 font-medium transition-colors"
        >
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="text-sm">Recall User</span>
        </button>

        <button
          onClick={onSkip}
          className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center gap-1 font-medium transition-colors"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          <span className="text-sm">Skip</span>
        </button>

        <button
          onClick={onNoShow}
          className="bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 p-4 rounded-xl flex flex-col items-center justify-center gap-1 font-medium transition-colors"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          <span className="text-sm">Mark No-Show</span>
        </button>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 px-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Managing the queue? Use &quot;Serve Next&quot; to call the next person.</span>
      </div>
    </div>
  );
}
