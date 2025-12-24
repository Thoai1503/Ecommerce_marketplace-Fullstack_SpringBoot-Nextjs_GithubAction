import Sidebar from "@/components/admin/Sidebar";
import "../admin/Home.modules.css";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <div className="main-content">{children}</div>
    </>
  );
}
