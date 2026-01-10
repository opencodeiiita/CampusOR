type Token = {
  id: string;
  number: number;
  status: string;
};

export default function TokenList({ tokens }: { tokens: Token[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Upcoming Tokens
        </h3>
        <div className="bg-sky-100 rounded-full px-3 py-1">
          <span className="text-sm font-semibold text-sky-700">
            {tokens.length} in queue
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tokens.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-slate-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-slate-500">No tokens in queue</p>
            <p className="text-sm text-slate-400 mt-1">
              All tokens have been served
            </p>
          </div>
        ) : (
          tokens.map((token, index) => (
            <div
              key={token.id}
              className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all duration-300 hover:shadow-md group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-sky-100 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-sky-700">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <span className="text-slate-900 font-medium">
                    Token {token.number}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Position #{index + 1}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  token.status === "waiting"
                    ? "bg-sky-100 text-sky-700"
                    : token.status === "served"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {token.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
