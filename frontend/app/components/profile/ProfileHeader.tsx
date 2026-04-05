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
    <div className="brand-page-header">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-4">
          {/* Profile Avatar */}
          <div className="relative">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 sm:h-20 sm:w-20 sm:text-3xl ${
                role === "USER"
                  ? "bg-[rgba(255,255,255,0.18)]"
                  : role === "OPERATOR"
                  ? "bg-[rgba(255,255,255,0.16)]"
                  : "bg-[rgba(255,255,255,0.14)]"
              }`}
            >
              {initials}
            </div>
            {/* Status indicator */}
            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-[#85D8CE]"></div>
          </div>

          <div>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              {name}
            </h1>
            <p className="mt-2 text-sm font-medium text-white/80 sm:text-base">
              {roleMeta[role].desc}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-bold shadow-md transition-all duration-300 hover:scale-105 sm:px-6 sm:py-2.5 sm:text-base ${roleMeta[role].badge}`}
        >
          {roleMeta[role].label}
        </span>
      </div>
    </div>
  );
}
