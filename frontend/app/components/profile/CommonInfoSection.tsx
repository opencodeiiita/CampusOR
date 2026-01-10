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
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
      <h2 className="mb-6 text-xl sm:text-2xl font-bold text-slate-900">
        Basic Information
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <Info label="Name" value={name} />
        <Info label="Email" value={email} />
        <Info label="Role" value={role} />
        <Info label="Joined" value={joinedAt} />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={handleLogout}
          className="flex-1 sm:flex-none rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-3 sm:py-3.5 px-4 sm:px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          Logout
        </button>

        <button
          disabled
          className="flex-1 sm:flex-none rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 sm:py-3.5 px-4 sm:px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Edit Profile (Coming Soon)
        </button>
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
