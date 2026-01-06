const handleLogout = () => {
  console.log("Logout clicked");
  alert("Logout functionality will be integrated with auth later.");
};

export default function CommonInfoSection({
  name,
  email,
  role,
  joinedAt,
}: {
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Basic Information
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Info label="Name" value={name} />
        <Info label="Email" value={email} />
        <Info label="Role" value={role} />
        <Info label="Joined" value={joinedAt} />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleLogout}
          className="rounded-md border cursor-pointer px-4 py-2 text-sm"
        >
          Logout
        </button>

        <button
          disabled
          className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-400"
        >
          Edit Profile (Coming Soon)
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
