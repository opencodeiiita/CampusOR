"use client";

import { useState } from "react";
import { apiService } from "@/app/services/api";
import { useRouter } from "next/navigation";

export default function CreateQueue() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.post("/api/queues", { name, location }, true);
      if (res.success) {
        router.push(`/operator/live?queueId=${res.queue.id}`);
      }
    } catch {
      alert("Failed to create queue");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-xl text-center">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">
          Open a New Service Counter
        </h1>

        {/* Subheading */}
        <p className="mt-4 text-gray-600 text-lg">
          Create a virtual queue for your desk and start serving students in
          real time.
        </p>

        {/* Form */}
        <form
          onSubmit={handleCreate}
          className="mt-10 flex flex-col gap-4"
        >
          <input
            placeholder="Counter Name (e.g., Registrar Desk 1)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            placeholder="Location (e.g., Admin Block)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            type="submit"
            className="mt-4 bg-black text-white rounded-lg py-3 text-lg font-medium hover:bg-gray-900 transition"
          >
            Start Queue
          </button>
        </form>
      </div>
    </div>
  );
}
