type Role = "USER" | "OPERATOR" | "ADMIN";

const roleMeta = {
  USER: {
    label: "USER",
    desc: "Queue participant",
    badge: "bg-blue-100 text-blue-700",
  },
  OPERATOR: {
    label: "OPERATOR",
    desc: "Queue operator",
    badge: "bg-green-100 text-green-700",
  },
  ADMIN: {
    label: "ADMIN",
    desc: "System administrator",
    badge: "bg-purple-100 text-purple-700",
  },
};

export default function ProfileHeader({
  name,
  role,
}: {
  name: string;
  role: Role;
}) {
  // Get user initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const initials = getInitials(name);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-4">
          {/* Profile Avatar */}
          <div className="relative">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 ${
                role === "USER"
                  ? "bg-blue-600"
                  : role === "OPERATOR"
                  ? "bg-green-600"
                  : "bg-purple-600"
              }`}
            >
              {initials}
            </div>
            {/* Status indicator */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              {name}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
              {roleMeta[role].desc}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-bold shadow-md transition-all duration-300 hover:scale-105 ${roleMeta[role].badge}`}
        >
          {roleMeta[role].label}
        </span>
      </div>
    </div>
  );
}
