import StatCard from "@/app/components/charts/StatCard";
import QueueLoadChart from "@/app/components/charts/QueueLoadChart";
import WaitTimeChart from "@/app/components/charts/WaitTimeChart";
import ServiceEfficiencyChart from "@/app/components/charts/ServiceEfficiencyChart";

export default function AdminPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">
        Admin Analytics Dashboard
      </h1>

<div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-10">
  <StatCard title="Active Tokens" value="42" color="blue" />
  <StatCard title="Served Today" value="128" color="green" />
  <StatCard title="Skipped Tokens" value="9" color="amber" />
  <StatCard title="Total Tokens Today" value="185" color="blue" />
  <StatCard title="Peak Hour" value="11:00 – 12:00" color="purple" />
</div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QueueLoadChart />
        <WaitTimeChart />
        <ServiceEfficiencyChart />
      </div>
    </div>
  );
}
