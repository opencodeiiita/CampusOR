type Props = {
  queue: {
    name: string;
    location: string;
  };
  status: string;
};

export default function OperatorHeader({ queue, status }: Props) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-semibold">{queue.name}</h2>
        <p className="text-sm text-gray-500">{queue.location}</p>
      </div>

      <span
        className={`px-4 py-1 rounded-full text-xs font-semibold ${
          status === "ACTIVE"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-600"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
