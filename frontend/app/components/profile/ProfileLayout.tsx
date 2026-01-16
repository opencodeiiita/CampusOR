"use client";

import React from "react";
import OperatorSidebar from "@/components/sidebar/OperatorSidebar";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOperator, isLoading } = useAuth();

  if (!isLoading && isOperator) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <OperatorSidebar />
        <main className="flex-1 ml-48 sm:ml-64 min-h-screen">
          <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 py-10">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
