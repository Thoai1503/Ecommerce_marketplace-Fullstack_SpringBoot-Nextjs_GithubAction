"use client";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <div className={`sidebar ${sidebarOpen ? "show" : ""}`}>
        <div className="d-flex flex-column h-100 p-3">
          <div className="mb-4">
            <div className="d-flex align-items-center gap-3 p-2">
              <div
                className="bg-primary rounded"
                style={{ width: 40, height: 40 }}
              ></div>
              <div>
                <h6 className="mb-0 fw-bold">Admin Center</h6>
                <small className="text-muted">Quản lý cửa hàng</small>
              </div>
            </div>
          </div>

          <nav className="flex-grow-1">
            <a href="#" className="nav-link-custom active">
              <span>📊</span>
              <span>Tổng quan</span>
            </a>
            <a href="#" className="nav-link-custom">
              <span>🛍️</span>
              <span>Đơn hàng</span>
            </a>
            <a href="#" className="nav-link-custom">
              <span>📦</span>
              <span>Sản phẩm</span>
            </a>
            <a href="#" className="nav-link-custom">
              <span>👥</span>
              <span>Khách hàng</span>
            </a>
            <a href="#" className="nav-link-custom">
              <span>📢</span>
              <span>Marketing</span>
            </a>
            <a href="#" className="nav-link-custom">
              <span>⚙️</span>
              <span>Cài đặt</span>
            </a>
          </nav>

          <div className="border-top pt-3">
            <button className="btn btn-light w-100 text-start">
              <span className="me-2">🚪</span>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
