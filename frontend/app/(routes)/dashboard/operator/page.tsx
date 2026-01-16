"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OperatorHomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/operator/queues");
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600" />
    </div>
  );
}
