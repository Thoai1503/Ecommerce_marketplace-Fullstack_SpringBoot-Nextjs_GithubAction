"use client";

import React from "react";
import { useSellerAuth } from "@/context/SellerAuthContext";

const DashboardPage: React.FC = () => {
  const { shop } = useSellerAuth();
  const shopName = shop?.shop_name || "linhkiendientudy123";
  const shopInitial = shopName.charAt(0).toUpperCase();
  const todoStats = [
    { value: 2, label: "Waiting for Delivery" },
    { value: 3, label: "Processed" },
    { value: 1, label: "Returns/Refunds/Cancellations" },
    { value: 7, label: "Temporarily Blocked Products", highlight: true },
    { value: 0, label: "Participating in Cheap Auctions" },
  ];

  const salesStats = [
    { label: "Sales", value: "đ398.000", change: "0,00%", icon: "?" },
    { label: "Hits", value: "0", change: "0,00%", icon: "?" },
    { label: "Product Clicks", value: "10", change: "0,00%", icon: "?" },
    { label: "Orders", value: "2", change: "0,00%", icon: "?" },
    {
      label: "Order Conversion Rate",
      value: "0,00%",
      change: "0,00%",
      icon: "?",
    },
  ];

  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <div className="bg-white border-bottom py-3 px-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="bg-danger text-white rounded p-2 me-3">
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z" />
              </svg>
            </div>
            <h5 className="mb-0">Kênh Người Bán</h5>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link text-dark">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5z" />
              </svg>
            </button>
            <button className="btn btn-link text-dark">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5z" />
              </svg>
            </button>
            <div className="d-flex align-items-center">
              <div
                className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center me-2"
                style={{ width: "32px", height: "32px" }}
              >
                <span className="small">{shopInitial}</span>
              </div>
              <span className="small">{shopName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid p-4">
        <div className="row g-4">
          {/* Left Column */}
          <div className="col-lg-8">
            {/* To Do List */}
            <div className="card mb-4 shadow-sm border-0">
              <div className="card-body">
                <h6 className="card-title fw-bold mb-3">Danh sách cần làm</h6>
                <div className="d-flex justify-content-between">
                  {todoStats.map((stat, idx) => (
                    <div key={idx} className="text-center flex-fill">
                      <div
                        className={`display-6 fw-bold ${
                          stat.highlight ? "text-primary" : "text-dark"
                        }`}
                      >
                        {stat.value}
                      </div>
                      <small
                        className="text-muted d-block mt-2"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {stat.label}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sales Analytics */}
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h6 className="fw-bold mb-1">Phân Tích Bán Hàng</h6>
                    <small className="text-muted">
                      Hôm nay 00:00 GMT+7 14:00(Dữ liệu thay đổi so với hôm qua)
                    </small>
                  </div>
                  <a
                    href="#"
                    className="text-primary text-decoration-none small"
                  >
                    Xem thêm ›
                  </a>
                </div>

                <div className="row g-3">
                  {salesStats.map((stat, idx) => (
                    <div key={idx} className="col">
                      <div className="border-end pe-3">
                        <div className="d-flex align-items-center mb-2">
                          <span className="text-muted small me-2">
                            {stat.label}
                          </span>
                          <svg
                            width="14"
                            height="14"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            className="text-muted"
                          >
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                          </svg>
                        </div>
                        <div className="h4 fw-bold mb-1">{stat.value}</div>
                        <small className="text-muted">
                          <span className="me-1">—</span>
                          {stat.change}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Analytics Sections */}
            <div className="card mt-4 shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Phân Tích Sản Phẩm</h6>
                  <a
                    href="#"
                    className="text-primary text-decoration-none small"
                  >
                    Xem thêm ›
                  </a>
                </div>
                <div className="text-center py-5 text-muted">
                  <svg
                    width="64"
                    height="64"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="mb-3 opacity-25"
                  >
                    <path d="M2.5 0A1.5 1.5 0 0 0 1 1.5v13A1.5 1.5 0 0 0 2.5 16h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 13.5 0h-11z" />
                  </svg>
                  <div>Chưa có dữ liệu</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-lg-4">
            {/* Sales Performance */}
            <div className="card mb-4 shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Hiệu quả bán hàng</h6>
                  <a
                    href="#"
                    className="text-primary text-decoration-none small"
                  >
                    ›
                  </a>
                </div>
                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                  <div>
                    <div className="text-danger fw-bold mb-1">Tốt</div>
                    <small className="text-muted">1 chỉ số không đạt</small>
                  </div>
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Internal News */}
            <div className="card mb-4 shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Tin Nội Bật</h6>
                  <a
                    href="#"
                    className="text-primary text-decoration-none small"
                  >
                    Xem thêm ›
                  </a>
                </div>

                {/* Promotion Banner */}
                <div
                  className="position-relative rounded overflow-hidden mb-3"
                  style={{
                    minHeight: "200px",
                    background:
                      "linear-gradient(135deg, #FF6B35 0%, #FFD93D 50%, #6BCF7F 100%)",
                  }}
                >
                  <div className="position-absolute top-0 start-0 w-100 h-100" />
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white">
                    <div
                      className="bg-dark px-3 py-1 mb-2"
                      style={{ fontSize: "0.75rem" }}
                    >
                      GIAO - GỬI - SHIP HÀNG
                    </div>
                    <h4 className="fw-bold text-center mb-2">
                      NHẬN NGAY
                      <br />
                      QUÀ CHẤT
                    </h4>
                    <button className="btn btn-warning btn-sm fw-bold">
                      THAM GIA NGAY ›
                    </button>
                  </div>
                </div>

                {/* News Item */}
                <div className="border-top pt-3">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div
                        className="bg-primary rounded"
                        style={{ width: "80px", height: "60px" }}
                      ></div>
                    </div>
                    <div>
                      <div className="fw-semibold mb-1 small">
                        Thời gian khiếu nại nơi trả chậm
                      </div>
                      <small className="text-muted">1 ngày trước</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shopee Academy */}
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Học Viện Shopee</h6>
                  <a
                    href="#"
                    className="text-primary text-decoration-none small"
                  >
                    Xem thêm ›
                  </a>
                </div>
                <div className="text-center py-4">
                  <div className="bg-light rounded p-4 mb-3">
                    <svg
                      width="48"
                      height="48"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      className="text-muted"
                    >
                      <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z" />
                    </svg>
                  </div>
                  <small className="text-muted">
                    Khám phá các khóa học miễn phí
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
