"use client";
import "bootstrap/dist/css/bootstrap.min.css";

import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );

  const menuItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Tổng quan",
      href: "/admin",
    },
    {
      id: "category-mangament",
      icon: LayoutDashboard,
      label: "Quản lý danh mục",
      href: "/admin/category",
    },
    {
      id: "attribute-mangament",
      icon: LayoutDashboard,
      label: "Quản lý thuộc tính",
      href: "/admin/attribute",
    },
        {
      id: "user-mangament",
      icon: LayoutDashboard,
      label: "Quản lý người dùng",
      href: "/admin/user",
    },
    {
      id: "orders",
      icon: ShoppingCart,
      label: "Đơn hàng",

      subItems: [
        { id: "all-orders", label: "Tất cả đơn hàng" },
        { id: "pending", label: "Chờ xử lý" },
        { id: "shipping", label: "Đang giao" },
        { id: "completed", label: "Hoàn thành" },
        { id: "cancelled", label: "Đã hủy" },
      ],
    },
    {
      id: "products",
      icon: Package,
      label: "Sản phẩm",
      subItems: [
        { id: "all-products", label: "Tất cả sản phẩm" },
        { id: "add-product", label: "Thêm sản phẩm" },
        { id: "categories", label: "Danh mục" },
        { id: "inventory", label: "Tồn kho" },
      ],
    },
    { id: "customers", icon: Users, label: "Khách hàng" },
    {
      id: "marketing",
      icon: Megaphone,
      label: "Marketing",
      subItems: [
        { id: "campaigns", label: "Chiến dịch" },
        { id: "discounts", label: "Mã giảm giá" },
        { id: "email", label: "Email marketing" },
      ],
    },
    {
      id: "settings",
      icon: Settings,
      label: "Cài đặt",
      subItems: [
        { id: "general", label: "Cài đặt chung" },
        { id: "payment", label: "Thanh toán" },
        { id: "shipping", label: "Vận chuyển" },
        { id: "notifications", label: "Thông báo" },
      ],
    },
  ];

  const toggleDropdown = (itemId: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="btn btn-primary d-lg-none position-fixed"
        style={{
          top: "1rem",
          left: "1rem",
          zIndex: 1050,
          width: "45px",
          height: "45px",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="d-lg-none position-fixed w-100 h-100"
          style={{
            top: 0,
            left: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1040,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`position-fixed h-100 bg-white border-end ${
          sidebarOpen ? "d-block" : "d-none d-lg-block"
        }`}
        style={{
          width: "280px",
          top: 0,
          left: 0,
          zIndex: 1045,
          transition: "transform 0.3s ease",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="d-flex flex-column h-100">
          {/* Header */}
          <div className="p-4 border-bottom">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center bg-primary text-white rounded"
                style={{
                  width: "48px",
                  height: "48px",
                  flexShrink: 0,
                }}
              >
                <Store size={24} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h5 className="mb-0 fw-bold text-truncate">Admin Center</h5>
                <small className="text-muted text-truncate d-block">
                  Quản lý cửa hàng
                </small>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-grow-1 overflow-auto p-3">
            <div className="d-flex flex-column gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isOpen = openDropdowns[item.id];

                return (
                  <div key={item.id}>
                    <Link
                      href={item.href || ""}
                      onClick={(e) => {
                        // e.preventDefault();
                        if (hasSubItems) {
                          toggleDropdown(item.id);
                        } else {
                          setActiveItem(item.id);
                          if (window.innerWidth < 992) setSidebarOpen(false);
                        }
                      }}
                      className={`d-flex align-items-center justify-content-between px-3 py-2 rounded text-decoration-none transition-all ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-dark hover-bg-light"
                      }`}
                      style={{
                        transition: "all 0.2s ease",
                        fontWeight: isActive ? "600" : "500",
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <Icon size={20} style={{ flexShrink: 0 }} />
                        <span>{item.label}</span>
                      </div>
                      {hasSubItems &&
                        (isOpen ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        ))}
                    </Link>

                    {/* Dropdown SubItems */}
                    {hasSubItems && isOpen && (
                      <div className="ms-3 mt-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive = activeItem === subItem.id;
                          return (
                            <a
                              key={subItem.id}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveItem(subItem.id);
                                if (window.innerWidth < 992)
                                  setSidebarOpen(false);
                              }}
                              className={`d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none transition-all ${
                                isSubActive
                                  ? "bg-primary bg-opacity-10 text-primary fw-semibold"
                                  : "text-secondary hover-bg-light"
                              }`}
                              style={{
                                fontSize: "0.9rem",
                                transition: "all 0.2s ease",
                                marginLeft: "1rem",
                              }}
                            >
                              <div
                                style={{
                                  width: "4px",
                                  height: "4px",
                                  borderRadius: "50%",
                                  backgroundColor: isSubActive
                                    ? "var(--bs-primary)"
                                    : "#adb5bd",
                                  flexShrink: 0,
                                }}
                              />
                              <span>{subItem.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-3 border-top">
            <button
              onClick={() => {
                // Handle logout
                console.log("Logout clicked");
              }}
              className="btn btn-light w-100 d-flex align-items-center gap-3 px-3 py-2"
              style={{
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }

        .transition-all {
          transition: all 0.2s ease;
        }

        @media (max-width: 991.98px) {
          .position-fixed[style*="width: 280px"] {
            transform: translateX(${sidebarOpen ? "0" : "-100%"});
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
