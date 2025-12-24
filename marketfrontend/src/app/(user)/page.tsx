import React from "react";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="container mt-4">
        {/* Category Icons */}
        <div className="row mt-4">
          <div className="col">
            <div className="category-icon">
              <i className="bi bi-truck"></i>
              <div>Freeship</div>
            </div>
          </div>
          <div className="col">
            <div className="category-icon">
              <i className="bi bi-lightning-fill text-warning"></i>
              <div>Flash Sale</div>
            </div>
          </div>
          <div className="col">
            <div className="category-icon">
              <i className="bi bi-shop"></i>
              <div>Mall</div>
            </div>
          </div>
          <div className="col">
            <div className="category-icon">
              <i className="bi bi-ticket-perforated"></i>
              <div>Mã Giảm Giá</div>
            </div>
          </div>
          <div className="col">
            <div className="category-icon">
              <i className="bi bi-phone"></i>
              <div>Nạp Thẻ</div>
            </div>
          </div>
          <div className="col">
            <div className="category-icon">
              <i className="bi bi-coin"></i>
              <div>Hoàn Xu</div>
            </div>
          </div>
          <div className="col">
            <div className="category-icon">
              <i className="bi bi-airplane"></i>
              <div>Khởi Trang</div>
            </div>
          </div>
          <div className="col">
            <div className="category-icon">
              <i className="bi bi-globe"></i>
              <div>Hàng Quốc Tế</div>
            </div>
          </div>
          <div className="col">
            <div className="category-icon">
              <i className="bi bi-heart"></i>
              <div>Biết Trend</div>
            </div>
          </div>
          <div className="col">
            <div className="category-icon">
              <i className="bi bi-grid-3x3"></i>
              <div>Tất Cả</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <h4 className="mt-5 mb-4">DANH MỤC</h4>
        <div className="category-grid" style={{ display: "flex" }}>
          <div className="category-item">
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "#ffe4b5",
                borderRadius: "8px",
                margin: "0 auto 10px",
              }}
            ></div>
            <small>Giày Dép</small>
          </div>
          <div className="category-item">
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "#2c3e50",
                borderRadius: "8px",
                margin: "0 auto 10px",
              }}
            ></div>
            <small>Nhà Cửa</small>
          </div>
          <div className="category-item">
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "#34495e",
                borderRadius: "8px",
                margin: "0 auto 10px",
              }}
            ></div>
            <small>Điện Thoại</small>
          </div>
          <div className="category-item">
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "#87ceeb",
                borderRadius: "8px",
                margin: "0 auto 10px",
              }}
            ></div>
            <small>Thời Trang Nam</small>
          </div>
          <div className="category-item">
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "#8b4513",
                borderRadius: "8px",
                margin: "0 auto 10px",
              }}
            ></div>
            <small>Sức Đẹp</small>
          </div>
          <div className="category-item">
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "#d2b48c",
                borderRadius: "8px",
                margin: "0 auto 10px",
              }}
            ></div>
            <small>Mẹ & Bé</small>
          </div>
          <div className="category-item">
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "#000",
                borderRadius: "8px",
                margin: "0 auto 10px",
              }}
            ></div>
            <small>Đồng Hồ</small>
          </div>
          <div className="category-item">
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "#4a7c59",
                borderRadius: "8px",
                margin: "0 auto 10px",
              }}
            ></div>
            <small>Máy Tính</small>
          </div>
          <div className="category-item">
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "#87ceeb",
                borderRadius: "8px",
                margin: "0 auto 10px",
              }}
            ></div>
            <small>Sức Khỏe</small>
          </div>
          <div className="category-item">
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "#d3d3d3",
                borderRadius: "8px",
                margin: "0 auto 10px",
              }}
            ></div>
            <small>Xem Thêm</small>
          </div>
        </div>

        {/* Flash Sale */}
        <div className="section-title">
          <i className="bi bi-lightning-fill text-warning"></i>
          <h4 className="mb-0">FLASH SALE</h4>
          <span className="ms-auto">
            <a href="#" className="text-decoration-none">
              Xem tất cả <i className="bi bi-arrow-right"></i>
            </a>
          </span>
        </div>

        <div className="row g-3">
          <div className="col-md-2">
            <div className="product-card position-relative">
              <span className="discount-badge">-50%</span>
              <span className="product-badge">MALL</span>
              <div
                className="product-image"
                style={{
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-shoe"
                  style={{ fontSize: "48px", color: "#ff0000" }}
                ></i>
              </div>
              <div className="p-3">
                <div className="price">₫1.250.000</div>
                <div className="old-price">₫2.500.000</div>
                <button className="btn btn-danger btn-sm btn-action">
                  ĐÃ BÁN 99
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="product-card position-relative">
              <span className="discount-badge">-35%</span>
              <div
                className="product-image"
                style={{
                  background: "linear-gradient(#ffe4b5, #f5deb3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-droplet"
                  style={{ fontSize: "48px", color: "#ffa500" }}
                ></i>
              </div>
              <div className="p-3">
                <div className="price">₫350.000</div>
                <div className="old-price">₫550.000</div>
                <button className="btn btn-danger btn-sm btn-action">
                  ĐÃ BÁN 95
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="product-card position-relative">
              <span className="discount-badge">-20%</span>
              <div
                className="product-image"
                style={{
                  background: "#2c3e50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-headphones"
                  style={{ fontSize: "48px", color: "#95a5a6" }}
                ></i>
              </div>
              <div className="p-3">
                <div className="price">₫890.000</div>
                <div className="old-price">₫1.110.000</div>
                <button className="btn btn-warning btn-sm btn-action">
                  ĐẶT HÀNG
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="product-card position-relative">
              <span className="discount-badge">-45%</span>
              <div
                className="product-image"
                style={{
                  background: "#ffb6a3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-earbuds"
                  style={{ fontSize: "48px", color: "#fff" }}
                ></i>
              </div>
              <div className="p-3">
                <div className="price">₫450.000</div>
                <div className="old-price">₫820.000</div>
                <button className="btn btn-danger btn-sm btn-action">
                  ĐÃ BÁN 99
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="product-card position-relative">
              <span className="discount-badge">-15%</span>
              <div
                className="product-image"
                style={{
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-camera"
                  style={{ fontSize: "48px", color: "#34495e" }}
                ></i>
              </div>
              <div className="p-3">
                <div className="price">₫2.100.000</div>
                <div className="old-price">₫2.470.000</div>
                <button className="btn btn-danger btn-sm btn-action">
                  ĐẶT HÀNG
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="product-card position-relative">
              <span className="discount-badge">-25%</span>
              <div
                className="product-image"
                style={{
                  background: "#2c3e50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-keyboard"
                  style={{ fontSize: "48px", color: "#95a5a6" }}
                ></i>
              </div>
              <div className="p-3">
                <div className="price">₫1.500.000</div>
                <div className="old-price">₫2.000.000</div>
                <button className="btn btn-danger btn-sm btn-action">
                  MUA NGAY
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
