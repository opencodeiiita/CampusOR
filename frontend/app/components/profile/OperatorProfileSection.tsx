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
    <div className="rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Operator Details
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Info label="Department" value={department} />
        <Info label="Designation" value={designation} />
        <Info
          label="Active Queue"
          value={activeQueue ?? "None"}
        />
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm text-gray-600">
          Assigned Queues
        </p>
        <ul className="list-disc pl-5 text-sm">
          {assignedQueues.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}
