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
    <div className="rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        User Details
      </h2>

      <Info label="College Email" value={collegeEmail} />
      <Info
        label="Active Token"
        value={activeToken ?? "None"}
      />

      <div className="mt-6">
        <p className="mb-2 text-sm text-gray-600">
          Recent Queue History
        </p>
        <ul className="space-y-2">
          {recentQueues.map((q, i) => (
            <li
              key={i}
              className="flex justify-between rounded-md bg-gray-50 px-4 py-2 text-sm"
            >
              <span>{q.queueName}</span>
              <span className="font-medium">{q.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}
