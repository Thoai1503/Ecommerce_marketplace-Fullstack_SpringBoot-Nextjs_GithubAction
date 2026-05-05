import Sidebar from "@/components/seller/SideBar";
import SellerProvider from "@/context/SellerProvider";
import "bootstrap/dist/css/bootstrap.min.css";
import { cookies, headers } from "next/headers";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headersList = await headers();

  const rawRole = cookieStore.get("role")?.value;
  const role = rawRole === "seller" || rawRole === "both" || rawRole === "buyer"
    ? rawRole
    : undefined;
  const rawUserId = cookieStore.get("user")?.value;
  const user_id = rawUserId ? Number(rawUserId) : undefined;

  const pathname = headersList.get("x-pathname") || "";
  const hideSidebar = pathname.startsWith("/seller/createshop");

  return (
    <SellerProvider role={role} user_id={user_id}>
      <div className="d-flex vh-100 bg-light">
        {!hideSidebar && <Sidebar />}

        <div className="flex-grow-1 overflow-auto">
          {children}
        </div>
      </div>
    </SellerProvider>
  );
}