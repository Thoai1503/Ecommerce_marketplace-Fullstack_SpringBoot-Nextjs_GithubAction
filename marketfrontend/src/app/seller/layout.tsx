"use client";
import Sidebar from "@/components/seller/SideBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";
export default function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <div className="d-flex vh-100 bg-light">
          <Sidebar />
          <div className="flex-grow-1 overflow-auto">{children}</div>
        </div>
      </QueryClientProvider>
    </>
  );
}
