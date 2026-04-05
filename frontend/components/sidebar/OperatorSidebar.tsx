"use client";

import { useAuth } from "@/app/context/AuthContext";
import { apiService } from "@/app/services/api";
import {
  Activity,
  LayoutDashboard,
  List,
  LogOut,
  PlayCircle,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
    return `flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${
      isActive
        ? "bg-white text-[var(--color-brand-deep)] shadow-lg"
        : "text-white/78 hover:bg-white/12 hover:text-white"
    }`;
  };

  useEffect(() => {
    let active = true;
    const loadQueues = async () => {
      try {
        const data = await apiService.get("/operator/queues", true);
        const parsed = Array.isArray(data) ? data : data?.queues || data?.data?.queues || [];
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
    [queues],
  );

  return (
    <aside className="brand-sidebar fixed left-0 top-0 z-50 flex h-screen w-48 flex-col sm:w-72">
      <div className="border-b border-white/12 p-4 sm:p-6">
        <div className="brand-wordmark text-white">
          <span className="brand-wordmark-mark">u</span>
          <span className="brand-wordmark-name text-white">uniq</span>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
          Operator Console
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        <Link href="/dashboard/operator/queues" className={linkStyle("/dashboard/operator/queues")}>
          <LayoutDashboard size={20} />
          <span className="font-medium text-sm sm:text-base">All Queues</span>
        </Link>
        <Link href="/dashboard/operator/live" className={linkStyle("/dashboard/operator/live")}>
          <PlayCircle size={20} />
          <span className="font-medium text-sm sm:text-base">Live Queues</span>
        </Link>
        <Link href="/dashboard/operator/create" className={linkStyle("/dashboard/operator/create")}>
          <Activity size={20} />
          <span className="font-medium text-sm sm:text-base">Create Queue</span>
        </Link>
        <Link href="/profile" className={linkStyle("/profile")}>
          <User size={20} />
          <span className="font-medium text-sm sm:text-base">Profile</span>
        </Link>

        <div className="pt-4">
          <div className="flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-white/50">
            <List size={14} />
            Queue Switcher
          </div>
          {queueError ? (
            <p className="mt-2 px-3 text-xs text-red-200">Unable to load queues</p>
          ) : activeQueues.length === 0 ? (
            <p className="mt-2 px-3 text-xs text-white/50">No active queues</p>
          ) : (
            <div className="mt-2 space-y-1">
              {activeQueues.map((queue) => {
                const isSelected = selectedQueueId === queue.id;
                return (
                  <Link
                    key={queue.id}
                    href={`/dashboard/operator/live?queueId=${queue.id}`}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-white text-[var(--color-brand-deep)]"
                        : "text-white/78 hover:bg-white/12 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{queue.name}</span>
                    <span className="text-[10px] text-white/45">Live</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-white/12 p-4">
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-white/80 transition-colors hover:bg-white/12 hover:text-white sm:px-4"
        >
          <LogOut size={20} className="transition-transform group-hover:translate-x-1" />
          <span className="font-medium text-sm sm:text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
}
