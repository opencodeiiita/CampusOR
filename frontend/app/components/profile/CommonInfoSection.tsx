export default function CommonInfoSection({
  name,
  email,
  role,
  joinedAt,
  onLogout,
}: {
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  onLogout: () => void;
}) {
  return (
    <div className="brand-section-card transition-all duration-300 hover:shadow-xl">
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
          onClick={onLogout}
          className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 transition-all duration-300 hover:scale-105 hover:bg-red-100 hover:shadow-lg sm:flex-none sm:px-6 sm:py-3.5"
        >
          Logout
        </button>

        <button
          disabled
          className="brand-secondary-button flex-1 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:flex-none sm:px-6 sm:py-3.5"
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
