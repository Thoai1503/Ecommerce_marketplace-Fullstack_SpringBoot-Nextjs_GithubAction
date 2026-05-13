"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSellerSideBarContext } from "@/context/SellerSideBarContext";

interface MenuItem {
  id: string;
  label: string;
  icon: JSX.Element;
  href?: string;
  badge?: string;
  submenu?: {
    label: string;
    href: string;
    badge?: string;
  }[];
}

export default function Sidebar() {
  const { isOpen } = useSellerSideBarContext();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["products"]);

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        id: "home",
        label: "Home page",
        href: "/seller",
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z" />
          </svg>
        ),
      },
      {
        id: "orders",
        label: "Order Management",
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        ),
        submenu: [
          { label: "All", href: "/seller/orders" },
          { label: "Mass Delivery", href: "/seller/orders/bulk" },
          {
            label: "Selling and Delivering Orders",
            href: "/seller/orders/handover",
          },
          {
            label: "Return/Refund Request or Cancellation Request",
            href: "/seller/orders/returns",
          },
          { label: "Shipping Settings", href: "/seller/orders/shipping" },
        ],
      },
      {
        id: "products",
        label: "Product Management",
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.5 0A1.5 1.5 0 0 0 1 1.5v13A1.5 1.5 0 0 0 2.5 16h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 13.5 0h-11zM2 1.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5V13h-1V4.5A1.5 1.5 0 0 0 11.5 3h-7A1.5 1.5 0 0 0 3 4.5V13H2V1.5z" />
          </svg>
        ),
        submenu: [
          { label: "All Products", href: "/seller/product" },
          { label: "Add Product", href: "/seller/product/new" },
        ],
      },
      {
        id: "marketing",
        label: "Kênh Marketing",
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.5 5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 8.5V5z" />
            <path d="M6.5 0A.5.5 0 0 1 7 .5V3h2V.5a.5.5 0 0 1 1 0V3h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H9.071l-.5.5H11.5a.5.5 0 0 1 0 1H4a.5.5 0 0 1 0-1h2.429l-.5-.5H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5z" />
          </svg>
        ),
        submenu: [
          { label: "Kênh Marketing", href: "/seller/marketing" },
          { label: "Đấu Giá Rẻ Vô Địch", href: "/seller/marketing/auction" },
          {
            label: "Dịch Vụ Hiển Thị Shopee",
            href: "/seller/marketing/display",
          },
          { label: "Tăng Đơn Cùng KOL", href: "/seller/marketing/kol" },
          {
            label: "Live & Video",
            href: "/seller/marketing/live",
            badge: "NEW",
          },
        ],
      },
      {
        id: "promotions",
        label: "Quản Lý Khuyến Mãi",
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
          </svg>
        ),
        submenu: [
          { label: "Khuyến Mãi Của Shop", href: "/seller/promotions" },
          {
            label: "Mã Giảm Giá Của Shop",
            href: "/seller/promotions/vouchers",
          },
        ],
      },
      {
        id: "finance",
        label: "Tài Chính",
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z" />
          </svg>
        ),
        submenu: [
          { label: "Doanh Thu", href: "/seller/finance/revenue" },
          { label: "Số Dư TK Shopee", href: "/seller/finance/balance" },
          { label: "Báo Cáo Tài Chính", href: "/seller/finance/reports" },
        ],
      },
      {
        id: "data",
        label: "Dữ Liệu",
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z" />
          </svg>
        ),
        submenu: [
          { label: "Phân Tích Bán Hàng", href: "/seller/data/sales" },
          { label: "Hiệu Quả Hoạt Động", href: "/seller/data/performance" },
        ],
      },
      {
        id: "shop",
        label: "Quản Lý Shop",
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
          </svg>
        ),
        submenu: [
          { label: "Hồ Sơ Shop", href: "/seller/shop/profile" },
          { label: "Trang Trí Shop", href: "/seller/shop/decoration" },
          { label: "Đánh Giá Shop", href: "/seller/shop/ratings" },
        ],
      },
    ],
    [],
  );

  useEffect(() => {
    const currentMenu = menuItems.find((menu) =>
      menu.submenu?.some(
        (subItem) =>
          pathname === subItem.href || pathname.startsWith(`${subItem.href}/`),
      ),
    );

    if (currentMenu) {
      setOpenMenus((prev) =>
        prev.includes(currentMenu.id) ? prev : [...prev, currentMenu.id],
      );
    }
  }, [menuItems, pathname]);

  const activeSubmenuHref =
    menuItems
      .flatMap((menu) => menu.submenu ?? [])
      .filter(
        (subItem) =>
          pathname === subItem.href || pathname.startsWith(`${subItem.href}/`),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;

  const isSubmenuActive = (href: string) => activeSubmenuHref === href;

  const isMenuActive = (menu: MenuItem) =>
    menu.href
      ? pathname === menu.href || pathname.startsWith(`${menu.href}/`)
      : Boolean(menu.submenu?.some((subItem) => isSubmenuActive(subItem.href)));

  return (
    <div
      className="bg-white border-end"
      style={{
        width: "250px",
        overflowY: "auto",
        height: "100vh",
        display: isOpen ? "block" : "none",
      }}
    >
      <div className="p-3 border-bottom">
        <div className="d-flex align-items-center">
          <div
            className="bg-danger text-white rounded p-2 me-2"
            style={{ width: "32px", height: "32px" }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z" />
            </svg>
          </div>
          <span className="fw-bold fs-6">My Marketplace</span>
        </div>
      </div>

      <div className="py-2">
        {menuItems.map((menu) => (
          <div key={menu.id} className="mt-1">
            {menu.submenu ? (
              <>
                <button
                  onClick={() => toggleMenu(menu.id)}
                  className={`btn btn-link text-decoration-none text-dark d-flex align-items-center justify-content-between w-100 px-3 py-2 text-start hover-bg-light ${
                    isMenuActive(menu) ? "bg-danger bg-opacity-10" : ""
                  }`}
                >
                  <div className="d-flex align-items-center">
                    <span className="me-2">{menu.icon}</span>
                    <span className="small fw-semibold">{menu.label}</span>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    style={{
                      transform: openMenus.includes(menu.id)
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: openMenus.includes(menu.id) ? "500px" : "0",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <div className="ps-4">
                    {menu.submenu.map((subItem, idx) => (
                      <Link
                        key={idx}
                        href={subItem.href}
                        className={`d-block px-3 py-1 text-decoration-none small hover-bg-light ${
                          isSubmenuActive(subItem.href)
                            ? "text-danger fw-semibold border-start border-3 border-danger"
                            : "text-secondary"
                        }`}
                      >
                        {subItem.badge && (
                          <span
                            className="badge bg-danger rounded-pill me-1"
                            style={{ fontSize: "8px" }}
                          >
                            {subItem.badge}
                          </span>
                        )}
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <Link
                href={menu.href || "#"}
                className={`d-block px-3 py-2 text-decoration-none hover-bg-light ${
                  isMenuActive(menu) ? "text-danger fw-semibold" : "text-dark"
                }`}
              >
                <div className="d-flex align-items-center">
                  <span className="me-2">{menu.icon}</span>
                  <span className="small">{menu.label}</span>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
        .btn:focus {
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
