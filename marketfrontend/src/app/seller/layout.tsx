import Sidebar from "@/components/seller/SideBar";
import "bootstrap/dist/css/bootstrap.min.css";
export default async function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="d-flex vh-100 bg-light">
        <Sidebar />
        <div className="flex-grow-1 overflow-auto">{children}</div>
      </div>
    </>
  );
}
