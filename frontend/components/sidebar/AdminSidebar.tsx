"use client";

import { useAuth } from "@/app/context/AuthContext";
import {
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  Settings,
  ShieldUser,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard size={20} /> },
  { href: "/admin/queues", label: "Queues Management", icon: <ListOrdered size={20} /> },
  { href: "/admin/operators", label: "Operators", icon: <Users size={20} /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
  { href: "/admin/manage-admins", label: "Manage Admins", icon: <ShieldUser size={20} /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings size={20} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const linkStyle = (href: string) => {
    const active = isActive(href);
    return `group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
      active
        ? "bg-white text-[var(--color-brand-deep)] shadow-lg"
        : "text-white/78 hover:bg-white/12 hover:text-white"
    }`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-60 rounded-xl border border-white/30 bg-white/85 p-2.5 shadow-lg backdrop-blur transition-colors lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(8,34,48,0.42)] backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`brand-sidebar fixed left-0 top-0 z-50 flex h-screen w-72 flex-col transition-transform duration-300 ease-in-out lg:w-64 xl:w-72 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="border-b border-white/12 p-6">
          <div className="brand-wordmark text-white">
            <span className="brand-wordmark-mark">u</span>
            <span className="brand-wordmark-name text-white">uniq</span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            Admin Control
          </p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
            Navigation
          </p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={linkStyle(item.href)}
            >
              <span
                className={
                  isActive(item.href)
                    ? "text-[var(--color-brand-deep)]"
                    : "text-white/78 group-hover:text-white"
                }
              >
                {item.icon}
              </span>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {isActive(item.href) && <ChevronRight size={16} className="text-[var(--color-brand-deep)]" />}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/12 p-4">
          <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
            Account
          </p>

          <Link
            href="/admin/profile"
            onClick={() => setIsOpen(false)}
            className={`mb-2 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
              pathname === "/admin/profile"
                ? "bg-white text-[var(--color-brand-deep)]"
                : "text-white/78 hover:bg-white/12 hover:text-white"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/16 bg-white/12">
              <User size={16} className="text-white/80" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-white/50">View Profile</p>
            </div>
          </Link>

          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-white/78 transition-all duration-300 hover:bg-white/12 hover:text-white"
          >
            <LogOut size={20} className="transition-transform group-hover:translate-x-1" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
