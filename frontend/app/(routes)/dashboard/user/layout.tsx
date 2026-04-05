"use client";

import UserSidebar from "../../../../components/sidebar/UserSidebar";
import ProtectedRoute from "../../../components/ProtectedRoute";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute roles={["user"]}>
      <div className="brand-shell flex min-h-screen">
        <UserSidebar />
        <main className="flex-1 lg:ml-72">
          <div className="p-6 pt-20 lg:p-8 lg:pt-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
