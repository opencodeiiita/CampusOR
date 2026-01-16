"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  List,
  LogOut,
  PlayCircle,
  User,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { apiService } from "@/app/services/api";
import { useEffect, useMemo, useState } from "react";

type SidebarQueue = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  location: string;
};

export default function OperatorSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout } = useAuth();
  const [queues, setQueues] = useState<SidebarQueue[]>([]);
  const [queueError, setQueueError] = useState(false);
  const selectedQueueId = searchParams.get("queueId");
  const linkStyle = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;
  };
  useEffect(() => {
    let active = true;
    const loadQueues = async () => {
      try {
        const data = await apiService.get("/operator/queues", true);
        const parsed = Array.isArray(data)
          ? data
          : data?.queues || data?.data?.queues || [];
        if (active) {
          setQueues(parsed);
        }
      } catch (error) {
        console.error("Failed to load sidebar queues", error);
        if (active) {
          setQueueError(true);
        }
      }
    };

    loadQueues();
    return () => {
      active = false;
    };
  }, []);

  const activeQueues = useMemo(
    () => queues.filter((queue) => queue.status === "ACTIVE"),
    [queues]
  );
  return (
    <aside className="w-48 sm:w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-4 sm:p-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          Ops<span className="hidden sm:inline">Portal</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <Link
          href="/dashboard/operator/queues"
          className={linkStyle("/dashboard/operator/queues")}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium text-sm sm:text-base">All Queues</span>
        </Link>
        <Link
          href="/dashboard/operator/live"
          className={linkStyle("/dashboard/operator/live")}
        >
          <PlayCircle size={20} />
          <span className="font-medium text-sm sm:text-base">Live Queues</span>
        </Link>
        <Link
          href="/dashboard/operator/create"
          className={linkStyle("/dashboard/operator/create")}
        >
          <Activity size={20} />
          <span className="font-medium text-sm sm:text-base">Create Queue</span>
        </Link>
        <Link href="/profile" className={linkStyle("/profile")}>
          <User size={20} />
          <span className="font-medium text-sm sm:text-base">Profile</span>
        </Link>

        <div className="pt-4">
          <div className="flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <List size={14} />
            Queue Switcher
          </div>
          {queueError ? (
            <p className="px-3 mt-2 text-xs text-red-500">
              Unable to load queues
            </p>
          ) : activeQueues.length === 0 ? (
            <p className="px-3 mt-2 text-xs text-slate-400">No active queues</p>
          ) : (
            <div className="mt-2 space-y-1">
              {activeQueues.map((queue) => {
                const isSelected = selectedQueueId === queue.id;
                return (
                  <Link
                    key={queue.id}
                    href={`/dashboard/operator/live?queueId=${queue.id}`}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-sky-100 text-sky-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{queue.name}</span>
                    <span className="text-[10px] text-slate-400">Live</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex items-center gap-3 px-3 sm:px-4 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
        >
          <LogOut
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
          <span className="font-medium text-sm sm:text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
}
