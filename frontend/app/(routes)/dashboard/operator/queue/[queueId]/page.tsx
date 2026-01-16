"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

type PageParams = {
  params: Promise<{ queueId: string }>;
};

export default function OperatorLiveControllerRedirect({ params }: PageParams) {
  const { queueId } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/operator/live?queueId=${queueId}`);
  }, [queueId, router]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
    </div>
  );
}
