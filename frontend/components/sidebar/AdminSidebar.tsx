"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ListOrdered,
  Users,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard size={20} /> },
  {
    href: "/admin/queues",
    label: "Queues Management",
    icon: <ListOrdered size={20} />,
  },
  { href: "/admin/operators", label: "Operators", icon: <Users size={20} /> },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: <BarChart3 size={20} />,
  },
  { href: "/admin/settings", label: "Settings", icon: <Settings size={20} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const linkStyle = (href: string) => {
    const active = isActive(href);
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active
        ? "bg-[#2563EB] text-white shadow-md"
        : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
    }`;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 
          flex flex-col transition-transform duration-300 ease-in-out
          w-72 lg:w-64 xl:w-72
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-md">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E293B] tracking-tight">
                Admin Portal
              </h1>
              <p className="text-xs text-[#94A3B8]">System Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-[#94A3B8]/50 [&::-webkit-scrollbar-track]:bg-transparent">
          <p className="px-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
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
                    ? "text-white"
                    : "text-[#475569] group-hover:text-[#1E293B]"
                }
              >
                {item.icon}
              </span>
              <span className="font-medium text-sm flex-1">{item.label}</span>
              {isActive(item.href) && (
                <ChevronRight size={16} className="text-white" />
              )}
            </Link>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-gray-100">
          <p className="px-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">
            Account
          </p>

          <Link
            href="/admin/profile"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2 ${
              pathname === "/admin/profile"
                ? "bg-[#F8FAFC] text-[#1E293B]"
                : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#94A3B8] flex items-center justify-center">
              <User size={16} className="text-[#475569]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-[#94A3B8]">View Profile</p>
            </div>
          </Link>

          <button className="flex items-center gap-3 px-4 py-3 w-full text-[#475569] hover:text-[#DC2626] hover:bg-red-50 rounded-xl transition-all duration-200 group">
            <LogOut
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
