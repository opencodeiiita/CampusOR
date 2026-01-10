type Props = {
  queue: {
    name: string;
    location: string;
  };
  status: string;
};

export default function OperatorHeader({ queue, status }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 hover:shadow-xl">
      <div className="mb-4 sm:mb-0">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-1">
          {queue.name}
        </h2>
        <div className="flex items-center text-sm text-slate-600">
          <svg
            className="w-4 h-4 mr-2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {queue.location}
        </div>
      </div>

      <span
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
          status === "ACTIVE"
            ? "bg-green-100 text-green-700 border-2 border-green-200"
            : "bg-red-100 text-red-600 border-2 border-red-200"
        }`}
      >
        <span className="flex items-center">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${
              status === "ACTIVE" ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></span>
          {status}
        </span>
      </span>
    </div>
  );
}
