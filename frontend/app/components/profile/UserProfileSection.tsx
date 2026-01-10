export default function UserProfileSection({
  collegeEmail,
  activeToken,
  recentQueues,
}: {
  collegeEmail: string;
  activeToken?: string;
  recentQueues: { queueName: string; status: string }[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
      <h2 className="mb-6 text-xl sm:text-2xl font-bold text-slate-900">
        User Details
      </h2>

      <div className="space-y-4">
        <Info label="College Email" value={collegeEmail} />
        <Info label="Active Token" value={activeToken || "None"} />
      </div>

      <div className="mt-8">
        <p className="mb-4 text-sm sm:text-base font-semibold text-slate-600">
          Recent Queue History
        </p>
        <ul className="space-y-3">
          {recentQueues.map((q, i) => (
            <li
              key={i}
              className="flex justify-between items-center rounded-lg bg-slate-50 border border-slate-200 px-4 sm:px-6 py-3 sm:py-3.5 transition-all duration-300 hover:bg-slate-100 hover:shadow-md"
            >
              <span className="text-sm sm:text-base font-medium text-slate-800">
                {q.queueName}
              </span>
              <span className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full bg-slate-200 text-slate-700">
                {q.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
        {label}
      </p>
      <p className="text-sm sm:text-base font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}
