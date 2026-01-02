type Props = {
  token: { number: number } | null;
};

export default function NowServingCard({ token }: Props) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-8 text-center">
      <p className="text-sm text-gray-500">Now Serving</p>

      <h2 className="text-5xl font-bold mt-3 tracking-wide">
        {token ? token.number : "--"}
      </h2>
    </div>
  );
}
