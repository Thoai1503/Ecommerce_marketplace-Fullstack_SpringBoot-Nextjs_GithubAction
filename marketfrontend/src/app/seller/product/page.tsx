"use client";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { useProductPage } from "@/feature/admin/hooks/useProductPage";
import { Product } from "@/validators/product";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";

// interface Product {
//   id: string;
//   name: string;
//   image: string;
//   price: number;
//   stock: number;
//   sku: string;
//   productId: string;
//   modelId: string;
//   revenue: number;
//   status: string;
//   issues?: string;
// }

const page = () => {
  const { shop, products } = useProductPage();
  const [activeTab, setActiveTab] = useState("all");
  //  alert("Shop in Product Page: " + JSON.stringify(shop));
  // const [product] = useState<Product[]>([
  //   {
  //     id: "1",
  //     name: "Đầu kẹp mũi khoan B10 0.6-6mm cho motor 775. Kẹp cho mũi khoa...",
  //     image: "https://via.placeholder.com/80",
  //     price: 89000,
  //     stock: 94,
  //     sku: "2060646500",
  //     productId: "20606465001",
  //     modelId: "180368799208",
  //     revenue: 6,
  //     status: "active",
  //     issues: "1 Content Issue To Fix",
  //   },
  //   {
  //     id: "2",
  //     name: "Bộ đầu kẹp giữ lưỡi cắt trục 5mm. Dùng cho motor 775",
  //     image: "https://via.placeholder.com/80",
  //     price: 69000,
  //     stock: 76,
  //     sku: "-",
  //     productId: "-",
  //     modelId: "-",
  //     revenue: 20,
  //     status: "qualified",
  //   },
  // ]);
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleExpand = (productId: string) => {
    setExpandedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };
  return (
    <div className="flex-grow-1 overflow-auto">
      {/* Header */}
      <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h5 className="mb-0 me-3">Sản phẩm</h5>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="#" className="text-decoration-none">
                  Trang chủ
                </a>
              </li>
              <li className="breadcrumb-item active">Sản phẩm</li>
            </ol>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-secondary">
            <svg
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="me-1"
            >
              <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 4v2h6V4H1zm8 0v2h6V4H9zm5 3H9v8h4.5a.5.5 0 0 0 .5-.5V7zm-7 8V7H2v7.5a.5.5 0 0 0 .5.5H7z" />
            </svg>
            Cài đặt sản phẩm
          </button>
          <button className="btn btn-sm btn-outline-secondary">
            Công cụ xử lý hàng loạt
          </button>
          <button className="btn btn-danger btn-sm">
            + Thêm 1 sản phẩm mới
          </button>
        </div>
      </div>

      {/* Price Bidding Banner */}
      <div className="bg-white m-3 p-4 border rounded shadow-sm">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <img
              src="https://via.placeholder.com/60"
              alt="Price Bidding"
              className="me-3"
            />
            <h6 className="mb-0 fw-bold">
              Join Price Bidding To Improve Performance!
            </h6>
          </div>
          <div className="d-flex align-items-center gap-4">
            <div>
              <small className="text-muted">Impression</small>
              <div className="fw-bold text-success">9422.00% ▲</div>
            </div>
            <div>
              <small className="text-muted">Order</small>
              <div className="fw-bold text-success">14211.00% ▲</div>
            </div>
            <div>
              <small className="text-muted">Sales</small>
              <div className="fw-bold text-success">113.00% ▲</div>
            </div>
            <button className="btn btn-danger">Join Now ›</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mx-3 border-bottom">
        <ul className="nav nav-tabs border-0">
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "all"
                  ? "active border-danger text-danger"
                  : "text-dark"
              } border-0 border-bottom-3`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "active"
                  ? "active border-danger text-danger"
                  : "text-dark"
              } border-0`}
              onClick={() => setActiveTab("active")}
            >
              Đang hoạt động{" "}
              <span className="badge bg-danger rounded-circle ms-1">17</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "violation"
                  ? "active border-danger text-danger"
                  : "text-dark"
              } border-0`}
              onClick={() => setActiveTab("violation")}
            >
              Vi phạm (7)
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link text-dark border-0">
              Chờ duyệt bởi Shopee (0)
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link text-dark border-0">
              Chưa được đăng (5)
            </button>
          </li>
        </ul>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white mx-3 border-bottom">
        <ul className="nav">
          <li className="nav-item">
            <button className="nav-link active text-danger border-0 border-bottom border-3 border-danger">
              Tất cả
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link text-dark border-0">
              Cần bổ sung hàng (0)
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link text-dark border-0">
              Cần Cải Thiện Nội Dung (17) <span className="text-danger">●</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Filters */}
      <div className="bg-white mx-3 p-3 border-bottom">
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm Tên sản phẩm, SKU sản phẩm, SKU phải"
            />
          </div>
          <div className="col-md-3">
            <select className="form-select">
              <option>Ngành hàng</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select">
              <option>Sản phẩm chủ lực</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-danger w-100">Áp dụng</button>
          </div>
        </div>
      </div>

      {/* Product Count */}
      <div className="bg-white mx-3 p-3 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <span className="fw-bold">17 Sản Phẩm</span>
          <button className="btn btn-sm btn-link text-decoration-none ms-3">
            Đủ điều kiện tham gia Đấu giá
          </button>
          <button className="btn btn-sm btn-link text-decoration-none">
            Tiềm năng Dịch Vụ Hiển Thị
          </button>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
            </svg>
            Sắp xếp theo gợi ý
          </button>
          <button className="btn btn-sm btn-outline-secondary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white mx-3 mb-3">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: "40px" }}></th> {/* checkbox + expand icon */}
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Kho hàng</th>
              <th>Hiệu suất</th>
              <th>Đánh giá sản phẩm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter((product): product is Product => product.id !== undefined)
              .map((product: Product) => {
                const hasVariants = (product.variants?.length ?? 0) >= 2;
                const isExpanded = expandedProductIds.has(
                  product.id.toString(),
                );

                // Hàng  chính (parent)
                const renderMainRow = () => (
                  <tr key={product.id} className={isExpanded ? "bg-light" : ""}>
                    <td>
                      <div className="d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                        />
                        {hasVariants && (
                          <button
                            className="btn btn-sm btn-link p-0 text-muted"
                            onClick={() => toggleExpand(product.id.toString())}
                            style={{ lineHeight: 1 }}
                          >
                            {isExpanded ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-start">
                        <img
                          src={
                            product.image_url ||
                            "https://via.placeholder.com/80"
                          }
                          alt={product.product_name}
                          className="rounded me-3"
                          width="80"
                          height="80"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <div className="fw-normal mb-1">
                            {product.product_name}
                          </div>
                          <small className="text-muted d-block">
                            SKU sản phẩm: {product.id || "-"}
                          </small>
                          <small className="text-muted d-block">
                            ID Sản phẩm: {product.id}
                          </small>
                          {product.id && (
                            <small className="text-muted d-block">
                              Model ID: {product.id}
                            </small>
                          )}
                          {hasVariants && (
                            <small className="text-muted">
                              {product.variants?.length} biến thể
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>đ{(product.price ?? 0).toLocaleString()}</div>
                      <small className="badge bg-warning text-dark">
                        Price Bidding Eligible
                      </small>
                    </td>
                    <td>{product.stock_quantity ?? 0}</td>
                    <td>
                      <div className="small">Doanh số 120</div>
                      <div className="small text-muted">
                        Doanh Số Trong 30 Ngày Gần Nhất 0
                      </div>
                      <div className="small text-muted">
                        Lưu Lượng Truy Cập 18
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-warning text-dark me-2">
                          ⚠
                        </span>
                        <span className="small">qualified</span>
                      </div>
                      <div className="d-flex align-items-center text-success">
                        <span className="me-2">✓</span>
                        <span className="small">Content Qualified</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <a
                          href={`/seller/product/new?id=${product.id}`}
                          className="text-primary text-decoration-none small"
                        >
                          Cập nhật
                        </a>
                        <a
                          href="#"
                          className="text-primary text-decoration-none small"
                        >
                          Đang quảng cáo
                        </a>
                        <a
                          href="#"
                          className="text-primary text-decoration-none small"
                        >
                          Xem thêm
                        </a>
                      </div>
                    </td>
                  </tr>
                );

                // Các hàng variant (nếu có)
                const renderVariantRows = () =>
                  isExpanded &&
                  product.variants?.map((variant) => (
                    <tr
                      key={variant.id}
                      className="variant-row bg-light-subtle"
                    >
                      <td></td> {/* để trống cột checkbox + expand */}
                      <td>
                        <div className="d-flex align-items-center ps-5">
                          {variant.image_url && (
                            <img
                              src={variant.image_url}
                              alt={variant.name}
                              className="rounded me-3"
                              width="60"
                              height="60"
                              style={{ objectFit: "cover" }}
                            />
                          )}
                          <div>
                            <div className="fw-medium">{variant.name}</div>
                            <small className="text-muted">
                              SKU: {variant.sku || "-"}
                            </small>
                            <br />
                            <small className="text-muted">
                              Model ID: {variant.id || "-"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>đ{variant.price.toLocaleString()}</td>
                      <td>{variant.stock_quantity}</td>
                      <td colSpan={3}></td> {/* để trống các cột còn lại */}
                    </tr>
                  ));

                return (
                  <React.Fragment key={product.id}>
                    {renderMainRow()}
                    {renderVariantRows()}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default page;
//với mỗi sản phẩm tạo thêm các hàng sổ xuống nếu 2 từ 2 variant trở lên
