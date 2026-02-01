import Sidebar from "@/components/seller/SideBar";
import { SellerAuthProvider } from "@/context/SellerAuthContext";
import SellerProvider from "@/context/SellerProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = (await cookies()).get("role")?.value;
  const user_id = (await cookies()).get("user")?.value as number | undefined;
  console.log("Seller role: " + role + " " + user_id);
  if (role != "seller" && role != "both") return redirect("/login");
  return (
    <>
      <SellerProvider role={role} user_id={user_id}>
        <div className="d-flex vh-100 bg-light">
          <Sidebar />
          <div className="flex-grow-1 overflow-auto">{children}</div>
        </div>
      </SellerProvider>
    </>
  );
}
