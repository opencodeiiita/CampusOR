"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, UserRole } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  redirectUnauthenticatedTo?: string;
  redirectUnauthorizedTo?: string;
}

export default function ProtectedRoute({
  children,
  roles,
  redirectUnauthenticatedTo = "/login",
  redirectUnauthorizedTo = "/403",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`${redirectUnauthenticatedTo}?next=${next}`);
      return;
    }

    if (roles && roles.length > 0 && !hasRole(roles)) {
      router.replace(redirectUnauthorizedTo);
    }
  }, [
    isAuthenticated,
    isLoading,
    roles,
    hasRole,
    router,
    pathname,
    redirectUnauthenticatedTo,
    redirectUnauthorizedTo,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Checking access...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (roles && roles.length > 0 && !hasRole(roles)) {
    return null;
  }

  return <>{children}</>;
}
