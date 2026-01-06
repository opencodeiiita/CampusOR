import StatCard from "@/components/charts/StatCard";
import QueueLoadChart from "@/components/charts/QueueLoadChart";
import WaitTimeChart from "@/components/charts/WaitTimeChart";
import TokensServedChart from "@/components/charts/TokensServedChart";
import ServiceEfficiencyChart from "@/components/charts/ServiceEfficiencyChart";
import AdminSidebar from "@/components/sidebar/AdminSidebar";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 xl:ml-72">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 pt-12 lg:pt-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Admin Analytics Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Overview of system performance and metrics
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            <StatCard title="Active Tokens" value="42" color="blue" />
            <StatCard title="Served Today" value="128" color="green" />
            <StatCard title="Skipped Tokens" value="9" color="amber" />
            <StatCard title="Total Tokens Today" value="185" color="blue" />
            <StatCard title="Peak Hour" value="11:00 – 12:00" color="purple" />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QueueLoadChart />
            <WaitTimeChart />
            <TokensServedChart />
            <ServiceEfficiencyChart />
          </div>
        </div>
      </main>
    </div>
  );
}
