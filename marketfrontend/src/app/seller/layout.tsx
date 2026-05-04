import Sidebar from "@/components/seller/SideBar";
import ProfileCompletionBanner from "@/components/seller/ProfileCompletionBanner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SellerAuthProvider } from "@/context/SellerAuthContext";
import SellerProvider from "@/context/SellerProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
export default async function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rawRole = (await cookies()).get("role")?.value;
  const role: "buyer" | "seller" | "both" | undefined =
    rawRole === "buyer" || rawRole === "seller" || rawRole === "both" ? rawRole : undefined;
  const rawUserId = (await cookies()).get("user")?.value;
  const user_id = rawUserId ? Number(rawUserId) : undefined;
  const pathname = (await headers()).get("x-pathname") || "";
  console.log("Seller role: " + role + " " + user_id + " path=" + pathname);

  // Các route public/ngoại lệ — không cần login hoặc không cần check shop status
  const isPublicSellerRoute =
    pathname.startsWith("/seller/pending") ||
    pathname.startsWith("/seller/register") ||
    pathname.startsWith("/seller/login") ||
    pathname.startsWith("/seller/forgot-password") ||
    pathname.startsWith("/seller/verify-otp") ||
    pathname.startsWith("/seller/reset-password");

  if (!isPublicSellerRoute && role && role != "seller" && role != "both") {
    return redirect("/seller/login");
  }

  // Check shop status — chặn seller PENDING/REJECTED truy cập dashboard
  if (!isPublicSellerRoute && role === "seller" && user_id) {
    try {
      const apiUrl = process.env.INTERNAL_API || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const res = await fetch(`${apiUrl}/shops/by-user/${user_id}`, { cache: "no-store" });
      if (res.ok) {
        const shop = await res.json();
        if (shop?.status === "PENDING" || shop?.status === "REJECTED") {
          return redirect("/seller/pending");
        }
      }
    } catch (e) {
      console.error("Shop status check failed:", e);
    }
  }
  // Public routes: render without sidebar chrome
  if (isPublicSellerRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <ProtectedRoute requiredRole="SELLER">
        <SellerProvider role={role} user_id={user_id}>
          <div className="d-flex vh-100 bg-light">
            <Sidebar />
            <div className="flex-grow-1 overflow-auto">
              <ProfileCompletionBanner />
              {children}
            </div>
          </div>
        </SellerProvider>
      </ProtectedRoute>
    </>
  );
}
