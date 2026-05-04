import Sidebar from "@/components/seller/SideBar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SellerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const role = cookieStore.get("role")?.value;

  // Chỉ seller hoặc both mới vào dashboard seller
  if (role !== "seller" && role !== "both") {
    redirect("/seller/createshop");
  }

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar />
      <div className="flex-grow-1 overflow-auto">{children}</div>
    </div>
  );
}