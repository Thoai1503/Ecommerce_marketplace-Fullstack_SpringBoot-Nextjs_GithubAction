"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Store,
  Ticket,
  Wallet,
  Layers,
  ShieldCheck,
  Settings,
  ChevronDown,
  LogOut,
  ChevronLeft,
  X,
} from "lucide-react";

const SidebarItem = ({
  label,
  path,
  icon,
  badge,
  active,
  children,
  isOpen,
  onToggle,
  isCollapsed,
  onClick,
}: any) => {
  const hasChildren = children && children.length > 0;
  const isParentActive =
    hasChildren && children.some((child: any) => child.active);

  const handleClick = () => {
    if (!hasChildren && onClick) {
      onClick();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {hasChildren ? (
        <button
          onClick={onToggle}
          title={isCollapsed ? label : ""}
          data-tooltip={label}
          className={`group tooltip-trigger flex items-center gap-3 px-3 py-2.5 mx-3 rounded-xl transition-all duration-300 text-left border-0 w-[calc(100%-24px)] relative ${
            active || isOpen || isParentActive
              ? "text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          } ${isParentActive && !isCollapsed ? "bg-white/5 ring-1 ring-white/10" : "bg-transparent"}`}
        >
          {/* Icon Highlight Logic */}
          <div
            className={`shrink-0 transition-all duration-300 ${isParentActive ? "scale-110 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "group-hover:text-slate-200"}`}
          >
            {React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
              size: 20,
            })}
          </div>

          {!isCollapsed && (
            <>
              <span
                className={`flex-1 text-sm transition-colors duration-300 ${isParentActive ? "font-bold text-blue-50" : "font-medium"}`}
              >
                {label}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${isParentActive ? "text-blue-400" : "text-slate-500"}`}
              />
            </>
          )}

          {/* Collapsed Indicator */}
          {isParentActive && isCollapsed && (
            <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          )}
        </button>
      ) : (
        <Link
          href={path}
          onClick={handleClick}
          title={isCollapsed ? label : ""}
          data-tooltip={label}
          className={`group tooltip-trigger no-underline flex items-center gap-3 px-3 py-2.5 mx-3 rounded-xl transition-all duration-300 relative ${
            active
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <div
            className={`shrink-0 transition-transform duration-300 ${active ? "scale-110" : ""}`}
          >
            {React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
              size: 20,
            })}
          </div>
          {!isCollapsed && (
            <>
              <span
                className={`flex-1 text-sm ${active ? "font-bold" : "font-medium"}`}
              >
                {label}
              </span>
              {badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-transform group-hover:scale-110 ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {badge}
                </span>
              )}
            </>
          )}
          {active && isCollapsed && (
            <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          )}
        </Link>
      )}

      {/* Children Submenu with visual connection */}
      {hasChildren && isOpen && !isCollapsed && (
        <div className="flex flex-col gap-1 ml-9 mr-3 mt-1 animate-in slide-in-from-top-2 duration-300 border-l border-slate-800">
          {children.map((child: any, idx: number) => (
            <Link
              key={idx}
              href={child.path}
              onClick={onClick}
              className={`no-underline py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                child.active
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {child.active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-500 rounded-r-full" />
              )}
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

interface AdminSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  // Auto-expand parent menu when a child is active
  useEffect(() => {
    if (pathname.includes("/admin/categories")) {
      setOpenSubmenu("categories");
    }
    if (pathname.includes("/admin/finance")) {
      setOpenSubmenu("finance");
    }
  }, [pathname]);

  const navigation = [
    {
      group: "CHÍNH",
      items: [
        { label: "Tổng quan", path: "/admin", icon: <LayoutDashboard /> },
        {
          label: "Đơn hàng",
          path: "/admin/orders",
          icon: <ShoppingCart />,
          badge: 5,
        },
      ],
    },
    {
      group: "KINH DOANH",
      items: [
        { label: "Sản phẩm", path: "/admin/products", icon: <Package /> },
        { label: "Khách hàng", path: "/admin/customers", icon: <Users /> },
        { label: "Nhà bán hàng", path: "/admin/sellers", icon: <Store /> },
        { label: "Mã giảm giá", path: "/admin/vouchers", icon: <Ticket /> },
        {
          label: "Tài chính",
          id: "finance",
          icon: <Wallet />,
          children: [
            {
              label: "Tổng quan",
              path: "/admin/finance",
              active: pathname === "/admin/finance",
            },
            {
              label: "Revenue Snapshot",
              path: "/admin/finance/revenue-snapshots",
              active: pathname === "/admin/finance/revenue-snapshots",
            },
            {
              label: "Reconciliation",
              path: "/admin/finance/reconciliation",
              active: pathname === "/admin/finance/reconciliation",
            },
            {
              label: "Giao dịch",
              path: "/admin/finance/transactions",
              active: pathname === "/admin/finance/transactions",
            },
            {
              label: "Hoàn tiền",
              path: "/admin/finance/refunds",
              active: pathname === "/admin/finance/refunds",
            },
            {
              label: "Tranh chấp",
              path: "/admin/finance/disputes",
              active: pathname === "/admin/finance/disputes",
            },
            {
              label: "Đối soát seller",
              path: "/admin/finance/settlements",
              active: pathname === "/admin/finance/settlements",
            },
            {
              label: "Ví người dùng",
              path: "/admin/finance/wallets",
              active: pathname === "/admin/finance/wallets",
            },
            {
              label: "Thanh toán Seller",
              path: "/admin/finance/payments",
              active: pathname === "/admin/finance/payments",
            },
          ],
        },
      ],
    },
    {
      group: "CONFIGURATION",
      items: [
        {
          label: "Categories",
          id: "categories",
          icon: <Layers />,
          children: [
            {
              label: "Product industry",
              path: "/admin/categories/industries",
              active: pathname === "/admin/categories/industries",
            },
            {
              label: "Attributes",
              path: "/admin/categories/attributes",
              active: pathname === "/admin/categories/attributes",
            },
            {
              label: "Units",
              path: "/admin/categories/units",
              active: pathname === "/admin/categories/units",
            },
            {
              label: "Brands",
              path: "/admin/categories/brands",
              active: pathname === "/admin/categories/brands",
            },
          ],
        },
        { label: "Phân quyền", path: "/admin/users", icon: <ShieldCheck /> },
        { label: "Cài đặt", path: "/admin/settings", icon: <Settings /> },
      ],
    },
  ];

  const sidebarClasses = `
    z-50 bg-[#111827] text-white flex flex-col h-screen 
    border-r border-slate-800 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shrink-0
    fixed lg:relative
    ${isCollapsed ? "lg:w-[80px] sidebar-collapsed" : "lg:w-[280px]"}
    ${isMobileOpen ? "w-[280px] translate-x-0" : "w-[280px] lg:translate-x-0 -translate-x-full"}
  `;

  return (
    <aside className={sidebarClasses}>
      <div
        className={`h-20 flex items-center justify-between px-6 border-b border-slate-800/50 shrink-0`}
      >
        <Link
          href="/admin"
          onClick={onCloseMobile}
          data-tooltip="Trang chủ"
          className="no-underline tooltip-trigger flex items-center gap-3 overflow-hidden"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <span className="font-black text-xl text-white italic">S</span>
          </div>
          <span
            className={`font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent transition-opacity duration-300 ${isCollapsed ? "lg:opacity-0" : "opacity-100"}`}
          >
            STAY-GO
          </span>
        </Link>

        <div className="flex items-center">
          <button
            onClick={onToggleCollapse}
            data-tooltip={isCollapsed ? "Mở rộng" : "Thu gọn"}
            className="hidden lg:flex tooltip-trigger p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white border-0 transition-colors"
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            />
          </button>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white border-0 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {navigation.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-1">
            <h4
              className={`px-7 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 transition-opacity duration-300 ${isCollapsed ? "lg:opacity-0 lg:h-0" : "opacity-100"}`}
            >
              {group.group}
            </h4>
            <div className="flex flex-col gap-1">
              {group.items.map((item, idx) => (
                <SidebarItem
                  key={idx}
                  {...item}
                  isCollapsed={isCollapsed}
                  active={
                    item.path
                      ? pathname === item.path ||
                        (item.path !== "/admin" &&
                          pathname.startsWith(item.path))
                      : false
                  }
                  isOpen={(item as any).id === openSubmenu}
                  onClick={onCloseMobile}
                  onToggle={() =>
                    setOpenSubmenu(
                      openSubmenu === (item as any).id
                        ? null
                        : (item as any).id || null,
                    )
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800/50 shrink-0">
        <div
          className={`px-2 py-3 bg-slate-800/30 rounded-2xl flex items-center gap-3 border border-slate-800/50 relative overflow-hidden transition-all duration-300 ${isCollapsed ? "lg:justify-center" : ""}`}
        >
          <div
            className="relative shrink-0 tooltip-trigger cursor-help"
            data-tooltip="Admin Manager"
          >
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Avatar"
              className="w-10 h-10 rounded-xl bg-slate-800 object-cover border border-slate-700"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#111827] rounded-full"></div>
          </div>

          <div
            className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100 w-auto"}`}
          >
            <p className="text-sm font-bold text-white truncate">
              Admin Manager
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              Sàn TMĐT STAY-GO
            </p>
          </div>

          <button
            title="Đăng xuất"
            className={`p-2 text-slate-500 hover:text-red-400 transition-all duration-300 border-0 bg-transparent shrink-0 ${isCollapsed ? "lg:opacity-0 lg:absolute" : "opacity-100"}`}
          >
            <LogOut size={18} />
          </button>

          {isCollapsed && (
            <button
              onClick={() => console.log("logout")}
              className="absolute inset-0 opacity-0 cursor-pointer lg:block hidden"
              data-tooltip="Đăng xuất"
            />
          )}
        </div>
      </div>
    </aside>
  );
}
