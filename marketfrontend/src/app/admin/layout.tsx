import Sidebar from "@/components/admin/Sidebar";
import "../admin/Home.modules.css";
import { RootPrivider } from "@/components/context/RootProvider";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <RootPrivider>
        <Sidebar />
        <div className="main-content">{children}</div>
      </RootPrivider>
    </>
  );
}
