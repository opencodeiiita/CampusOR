export default function AdminProfileSection({
  collegeEmail,
  scope,
  totalQueuesManaged,
}: {
  collegeEmail: string;
  scope: string;
  totalQueuesManaged: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Admin Details
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Info label="College Email" value={collegeEmail} />
        <Info label="Scope" value={scope} />
        <Info
          label="Queues Managed"
          value={String(totalQueuesManaged)}
        />
      </div>

      <p className="mt-4 text-sm text-gray-500">
        This account has system-wide administrative privileges.
      </p>
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
