"use client";

import { useAuth } from "@/app/context/AuthContext";
import { userQueueService } from "@/lib/services/userQueueService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Settings,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";

type SettingsSnapshot = {
  isInQueue: boolean;
  queueId?: string;
  currentQueueName?: string;
  tokenNumber?: string;
  unreadNotifications: number;
  totalQueuesJoined: number;
  averageWaitTime: number;
};

export default function UserSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SettingsSnapshot>({
    isInQueue: false,
    unreadNotifications: 0,
    totalQueuesJoined: 0,
    averageWaitTime: 0,
  });

  useEffect(() => {
    const loadSettingsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [stateResponse, currentQueueResponse, notificationsResponse, statsResponse] =
          await Promise.all([
            userQueueService.getUserState(),
            userQueueService.getCurrentQueue(),
            userQueueService.getNotifications(true),
            userQueueService.getUserStats(),
          ]);

        setSnapshot({
          isInQueue: stateResponse.data.isInQueue,
          queueId: stateResponse.data.queueId,
          currentQueueName: currentQueueResponse.data?.queueName,
          tokenNumber: currentQueueResponse.data?.tokenNumber,
          unreadNotifications: notificationsResponse.data.length,
          totalQueuesJoined: statsResponse.data.totalQueuesJoined,
          averageWaitTime: statsResponse.data.averageWaitTime,
        });
      } catch (err) {
        console.error("Failed to load settings data:", err);
        setError("Failed to load account settings.");
      } finally {
        setLoading(false);
      }
    };

    loadSettingsData();
  }, []);

  const joinedAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Not available";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="brand-page-header">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-white" />
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
        </div>
        <div className="brand-section-card p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            <span className="ml-3 text-gray-600">Loading account settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="brand-page-header">
        <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-white" />
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-white/80">
            Your account, queue status, and activity summary.
          </p>
        </div>
      </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 space-y-6">
          <div className="brand-section-card">
            <div className="flex items-center gap-3 mb-5">
              <UserCircle2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Account Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <InfoRow label="Name" value={user?.name || "Not available"} />
              <InfoRow label="Email" value={user?.email || "Not available"} />
              <InfoRow
                label="College Email"
                value={user?.collegeEmail || "Not provided"}
              />
              <InfoRow
                label="Role"
                value={user?.role ? capitalize(user.role) : "User"}
              />
              <InfoRow label="Joined" value={joinedAt} />
              <InfoRow
                label="Email Verification"
                value={user?.emailVerified ? "Verified" : "Pending"}
              />
            </div>
          </div>

          <div className="brand-section-card">
            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Live Account Status
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <InfoRow
                label="Currently In Queue"
                value={snapshot.isInQueue ? "Yes" : "No"}
              />
              <InfoRow
                label="Active Queue"
                value={snapshot.currentQueueName || "No active queue"}
              />
              <InfoRow
                label="Current Token"
                value={snapshot.tokenNumber || "No active token"}
              />
              <InfoRow
                label="Unread Notifications"
                value={String(snapshot.unreadNotifications)}
              />
            </div>
          </div>

          <div className="brand-section-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Quick Actions
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/profile"
                className="brand-primary-button"
              >
                Open Profile
              </Link>
              <Link
                href="/dashboard/user/notification"
                className="brand-secondary-button"
              >
                Review Notifications
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700 transition-colors hover:bg-red-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="brand-section-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Activity Snapshot
            </h2>
            <div className="space-y-4">
              <StatTile
                icon={<Bell className="w-5 h-5 text-orange-600" />}
                label="Unread Alerts"
                value={String(snapshot.unreadNotifications)}
              />
              <StatTile
                icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                label="Queues Joined"
                value={String(snapshot.totalQueuesJoined)}
              />
              <StatTile
                icon={<Clock className="w-5 h-5 text-blue-600" />}
                label="Average Wait"
                value={`${snapshot.averageWaitTime} min`}
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-[rgba(8,80,120,0.14)] bg-gradient-to-br from-[rgba(8,80,120,0.98)] via-[rgba(21,116,144,0.9)] to-[rgba(133,216,206,0.82)] p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Account Health
            </h2>
            <p className="mb-4 text-sm text-white/85">
              Your dashboard is using live backend data for account, queue, and
              notification status.
            </p>
            <ul className="space-y-3 text-sm text-white/85">
              <li>
                Email status:{" "}
                <span className="font-semibold text-white">
                  {user?.emailVerified ? "verified" : "not verified"}
                </span>
              </li>
              <li>
                Queue session:{" "}
                <span className="font-semibold text-white">
                  {snapshot.isInQueue ? "active" : "idle"}
                </span>
              </li>
              <li>
                Notification feed:{" "}
                <span className="font-semibold text-white">connected to backend</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="text-base font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
