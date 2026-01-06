import UserDashboard from "../../../../components/user_dashboard/UserDashboard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen w-full">
      <UserDashboard autoRotate={true} />
    </main>
  );
}
