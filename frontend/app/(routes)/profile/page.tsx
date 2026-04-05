"use client";

import { apiService } from "@/app/services/api";
import AdminProfileSection from "@/app/components/profile/AdminProfileSection";
import CommonInfoSection from "@/app/components/profile/CommonInfoSection";
import OperatorProfileSection from "@/app/components/profile/OperatorProfileSection";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import ProfileLayout from "@/app/components/profile/ProfileLayout";
import UserProfileSection from "@/app/components/profile/UserProfileSection";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";

type CurrentQueueResponse = {
  queueName: string;
  tokenNumber: string;
};

type HistoryItem = {
  queueId: string;
  queueName: string;
  status: string;
};

type OperatorQueue = {
  id: string;
  name: string;
  status?: "ACTIVE" | "PAUSED";
};

type QueueDataResponse = {
  data?: {
    queues?: Array<{ _id?: string; id?: string }>;
  };
};

export default function ProfilePage() {
  const { user, role, isLoading, isAuthenticated, logout } = useAuth();
  const [activeToken, setActiveToken] = useState<string | undefined>();
  const [recentQueues, setRecentQueues] = useState<
    { queueName: string; status: string }[]
  >([]);
  const [assignedQueues, setAssignedQueues] = useState<string[]>([]);
  const [activeQueue, setActiveQueue] = useState<string | undefined>();
  const [totalQueuesManaged, setTotalQueuesManaged] = useState(0);
  const profileRole = (role || user?.role || "user").toUpperCase();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const loadProfileDetails = async () => {
      try {
        if (profileRole === "USER") {
          const [currentQueueResponse, historyResponse] = await Promise.all([
            apiService.get("/user-status/current-queue", true),
            apiService.get("/user-status/history", true),
          ]);

          const currentQueue = currentQueueResponse.data as
            | CurrentQueueResponse
            | null;
          const history = ((historyResponse.data as HistoryItem[]) || []).slice(
            0,
            5,
          );

          setActiveToken(currentQueue?.tokenNumber);
          setRecentQueues(
            history.map((item) => ({
              queueName: item.queueName,
              status: item.status,
            })),
          );
        }

        if (profileRole === "OPERATOR") {
          const operatorQueues = (await apiService.get(
            "/operator/queues",
            true,
          )) as OperatorQueue[];

          setAssignedQueues(operatorQueues.map((queue) => queue.name));
          setActiveQueue(
            operatorQueues.find((queue) => queue.status === "ACTIVE")?.name,
          );
        }

        if (profileRole === "ADMIN") {
          const response = (await apiService.get(
            "/queue-data",
            true,
          )) as QueueDataResponse;
          setTotalQueuesManaged(response.data?.queues?.length || 0);
        }
      } catch (error) {
        console.error("Failed to load profile details:", error);
      }
    };

    loadProfileDetails();
  }, [isAuthenticated, profileRole, user]);

  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600" />
        </div>
      </ProfileLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <ProfileLayout>
        <div className="brand-section-card text-center text-slate-600">
          Please log in to view your profile.
        </div>
      </ProfileLayout>
    );
  }

  const joinedAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Not available";

  return (
    <ProfileLayout>
      <ProfileHeader name={user.name || "User"} role={profileRole} />

      <CommonInfoSection
        name={user.name || "User"}
        email={user.email || "Not available"}
        role={profileRole}
        joinedAt={joinedAt}
        onLogout={logout}
      />

      {profileRole === "USER" && (
        <UserProfileSection
          collegeEmail={user.collegeEmail || user.email || "Not available"}
          activeToken={activeToken}
          recentQueues={recentQueues}
        />
      )}

      {profileRole === "OPERATOR" && (
        <OperatorProfileSection
          department={user.department || "Not available"}
          designation={user.position || "Not available"}
          assignedQueues={assignedQueues}
          activeQueue={activeQueue}
        />
      )}

      {profileRole === "ADMIN" && (
        <AdminProfileSection
          collegeEmail={user.email || "Not available"}
          scope="Campus-wide"
          totalQueuesManaged={totalQueuesManaged}
        />
      )}
    </ProfileLayout>
  );
}
