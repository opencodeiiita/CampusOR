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
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            {name}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {roleMeta[role].desc}
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-1 text-sm font-medium ${roleMeta[role].badge}`}
        >
          {roleMeta[role].label}
        </span>
      </div>
    </div>
  );
}
