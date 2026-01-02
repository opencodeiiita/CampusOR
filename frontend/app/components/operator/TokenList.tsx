type Token = {
  id: string;
  number: number;
  status: string;
};

export default function TokenList({ tokens }: { tokens: Token[] }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">
        Upcoming Tokens
      </h3>

      <ul className="space-y-3">
        {tokens.map((token) => (
          <li
            key={token.id}
            className="flex justify-between items-center text-sm"
          >
            <span>Token {token.number}</span>

            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {token.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
