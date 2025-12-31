"use client";

interface StatCardProps {
  title: string;
  value: string;
  color: "blue" | "green" | "amber" | "purple";
}

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  green: { bg: "bg-green-50", text: "text-green-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
};

export default function StatCard({ title, value, color }: StatCardProps) {
  const styles = colorMap[color];

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text}`}>
        {title}
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-3">
        {value}
      </p>
    </div>
  );
}
