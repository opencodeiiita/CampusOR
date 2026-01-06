import React from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] py-10">
      <div className="mx-auto max-w-5xl space-y-6 px-6">
        {children}
      </div>
    </div>
  );
}
