"use client";

interface StatCardProps {
  title: string;
  value: string;
  color: "blue" | "green" | "amber" | "purple";
}

const colorMap = {
  blue: { bg: "bg-blue-100", text: "text-blue-700" },
  green: { bg: "bg-green-100", text: "text-green-700" },
  amber: { bg: "bg-amber-100", text: "text-amber-700" },
  purple: { bg: "bg-purple-100", text: "text-purple-700" },
};

export default function StatCard({ title, value, color }: StatCardProps) {
  const styles = colorMap[color];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      <div
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text}`}
      >
        {title}
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-3">{value}</p>
    </div>
  );
}
