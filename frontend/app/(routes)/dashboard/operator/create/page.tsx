"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/app/services/api";
import { toast } from "sonner";

export default function CreateQueuePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiService.post("/queues", formData, true); // true = include auth
      if (res.success) {
        toast.success("Queue created successfully.");
        router.push("/dashboard/operator/queues");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create queue";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl animate-in fade-in zoom-in">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">
          Create New Queue
        </h1>
        {error && (
          <p className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Queue Name
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              placeholder="e.g., Admin Office A"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Location
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              placeholder="e.g., Ground Floor"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Queue"}
          </button>
        </form>
      </div>
    </div>
  );
}
