"use client";

import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg w-full bg-white border border-slate-200 shadow-lg rounded-2xl p-8 text-center">
        <p className="text-lg font-semibold text-sky-600 mb-2">Access denied</p>

        <p className="text-slate-600 mb-6">
          You don&apos;t have permission to view this page. If you think this is a mistake,
          please sign in with an account that has the right role.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors"
          >
            Go to login
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
