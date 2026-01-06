"use client";

import AdminProfileSection from "@/app/components/profile/AdminProfileSection";
import CommonInfoSection from "@/app/components/profile/CommonInfoSection";
import OperatorProfileSection from "@/app/components/profile/OperatorProfileSection";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import ProfileLayout from "@/app/components/profile/ProfileLayout";
import UserProfileSection from "@/app/components/profile/UserProfileSection";
import { profileMock } from "@/lib/mock/profile";


export default function ProfilePage() {
  const profile = profileMock;

  return (
    <ProfileLayout>
      <ProfileHeader
        name={profile.name}
        role={profile.role}
      />

      <CommonInfoSection
        name={profile.name}
        email={profile.email}
        role={profile.role}
        joinedAt={profile.joinedAt}
      />

      {profile.role === "USER" && (
        <UserProfileSection
          collegeEmail={profile.collegeEmail}
          activeToken={profile.activeToken}
          recentQueues={profile.recentQueues}
        />
      )}

      {profile.role === "OPERATOR" && (
        <OperatorProfileSection
          department={profile.department}
          designation={profile.designation}
          assignedQueues={profile.assignedQueues}
          activeQueue={profile.activeQueue}
        />
      )}

      {profile.role === "ADMIN" && (
        <AdminProfileSection
          collegeEmail={profile.collegeEmail}
          scope={profile.scope}
          totalQueuesManaged={profile.totalQueuesManaged}
        />
      )}
    </ProfileLayout>
  );
}
