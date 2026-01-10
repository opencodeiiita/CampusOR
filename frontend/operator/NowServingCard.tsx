type Props = {
  token: { number: number } | null;
};

export default function NowServingCard({ token }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 text-center transition-all duration-300 hover:shadow-xl animate-in fade-in zoom-in">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-orange-100 rounded-full p-3">
          <svg
            className="w-6 h-6 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
      </div>

      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">
        Now Serving
      </p>

      <div className="relative">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-wide text-slate-900">
          {token ? token.number : "--"}
        </h2>
        {token && (
          <div className="absolute inset-0 -z-[-1]">
            <div className="absolute inset-0 bg-orange-100/50 rounded-full blur-3xl"></div>
          </div>
        )}
      </div>

      {token && (
        <p className="text-sm text-slate-500 mt-4">
          Please proceed to the counter
        </p>
      )}
    </div>
  );
}
