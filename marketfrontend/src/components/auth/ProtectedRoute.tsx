"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "SUPER_ADMIN" | "SELLER" | "CUSTOMER";
}

// Kiểm tra role có đủ quyền không (SUPER_ADMIN luôn có quyền admin)
function hasAccess(userRole: string, requiredRole?: string): boolean {
  if (!requiredRole) return true;
  if (userRole === "SUPER_ADMIN") return true; // SUPER_ADMIN vào được mọi nơi
  return userRole === requiredRole;
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const loginPath = requiredRole === "SELLER" ? "/seller/login" : "/admin/login";
      router.replace(loginPath);
      return;
    }
    if (requiredRole && !hasAccess(user.role, requiredRole)) {
      const path = user.role === "ADMIN" || user.role === "SUPER_ADMIN"
        ? "/admin"
        : user.role === "SELLER"
        ? "/seller"
        : "/";
      router.replace(path);
    }
  }, [loading, user, requiredRole, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  if (!user) return null;
  if (requiredRole && !hasAccess(user.role, requiredRole)) return null;

  return <>{children}</>;
}
