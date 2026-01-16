"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  LayoutDashboard,
  History,
  Bell,
  ListChecks,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

// User-specific navigation items for dashboard
const navItems: NavItem[] = [
  {
    href: "/dashboard/user",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    href: "/dashboard/user/queues",
    label: "Browse Queues",
    icon: <Activity size={20} />,
  },
  {
    href: "/dashboard/user/myqueue",
    label: "My Queue",
    icon: <ListChecks size={20} />,
  },
  {
    href: "/dashboard/user/history",
    label: "History",
    icon: <History size={20} />,
  },
  {
    href: "/dashboard/user/notification",
    label: "Notifications",
    icon: <Bell size={20} />,
  },
  {
    href: "/dashboard/user/settings",
    label: "Settings",
    icon: <Settings size={20} />,
  },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard/user") {
      return pathname === "/dashboard/user";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">User Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">CampusOR</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {isActive(item.href) && (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
                router.push("/login");
              }}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
