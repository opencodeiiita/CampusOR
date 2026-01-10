export default function OperatorProfileSection({
  department,
  designation,
  assignedQueues,
  activeQueue,
}: {
  department: string;
  designation: string;
  assignedQueues: string[];
  activeQueue?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
      <h2 className="mb-6 text-xl sm:text-2xl font-bold text-slate-900">
        Operator Details
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <Info label="Department" value={department} />
        <Info label="Designation" value={designation} />
        <Info label="Active Queue" value={activeQueue || "None"} />
      </div>

      <div className="mt-8">
        <p className="mb-4 text-sm sm:text-base font-semibold text-slate-600">
          Assigned Queues
        </p>
        <ul className="list-disc space-y-2 pl-5 sm:pl-6">
          {assignedQueues.map((q, i) => (
            <li
              key={i}
              className="text-sm sm:text-base text-slate-800 py-2 transition-all duration-300 hover:text-slate-900 hover:translate-x-1"
            >
              {q}
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
