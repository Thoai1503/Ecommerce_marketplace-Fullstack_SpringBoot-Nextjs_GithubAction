"use client";
import React, { useState } from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  isVisible: boolean;
  children?: Category[];
  isExpanded?: boolean;
}

const page = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>({
    id: 24,
    name: "Điện thoại di động",
    slug: "dien-thoai-di-dong",
    productCount: 0,
    isVisible: true,
  });

  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: "Điện tử & Thiết bị số",
      slug: "dien-tu-thiet-bi-so",
      productCount: 45,
      isVisible: true,
      isExpanded: true,
      children: [
        {
          id: 24,
          name: "Điện thoại di động",
          slug: "dien-thoai-di-dong",
          productCount: 0,
          isVisible: true,
          isExpanded: true,
          children: [
            {
              id: 3,
              name: "Smartphones",
              slug: "smartphones",
              productCount: 0,
              isVisible: true,
            },
            {
              id: 4,
              name: "Phụ kiện điện thoại",
              slug: "phu-kien-dien-thoai",
              productCount: 0,
              isVisible: true,
            },
          ],
        },
        {
          id: 5,
          name: "Máy tính bảng",
          slug: "may-tinh-bang",
          productCount: 0,
          isVisible: true,
          isExpanded: false,
        },
      ],
    },
    {
      id: 2,
      name: "Thời trang Nam",
      slug: "thoi-trang-nam",
      productCount: 120,
      isVisible: false,
      isExpanded: false,
    },
    {
      id: 6,
      name: "Nhà cửa & Đời sống",
      slug: "nha-cua-doi-song",
      productCount: 89,
      isVisible: true,
      isExpanded: false,
    },
  ]);

  const [formData, setFormData] = useState({
    parentId: 1,
    name: "Điện thoại di động",
    slug: "dien-thoai-di-dong",
    isVisible: true,
  });

  const toggleCategory = (id: number) => {
    const updateCategories = (cats: Category[]): Category[] => {
      return cats.map((cat) => {
        if (cat.id === id) {
          return { ...cat, isExpanded: !cat.isExpanded };
        }
        if (cat.children) {
          return { ...cat, children: updateCategories(cat.children) };
        }
        return cat;
      });
    };
    setCategories(updateCategories(categories));
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategory?.id === category.id;

    return (
      <div key={category.id} className={level > 0 ? `ms-${level * 4}` : ""}>
        <div
          className={`d-flex align-items-center gap-2 p-2 rounded border mb-1 category-item ${
            isSelected
              ? "bg-primary bg-opacity-10 border-primary"
              : "border-light"
          }`}
          onClick={() => setSelectedCategory(category)}
          style={{ cursor: "pointer" }}
        >
          <span className="text-muted" style={{ cursor: "move" }}>
            ☰
          </span>

          {hasChildren ? (
            <button
              className="btn btn-sm btn-link p-0 text-decoration-none text-muted"
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
            >
              <span>{category.isExpanded ? "▼" : "▶"}</span>
            </button>
          ) : (
            <span className="text-muted ms-2">─</span>
          )}

          {level === 0 && (
            <div
              className="bg-light "
              style={{ width: 32, height: 32, borderRadius: 4 }}
            ></div>
          )}

          <div className="flex-grow-1 min-w-0">
            <div
              className={`${
                level === 0 ? "fw-bold" : level === 1 ? "fw-semibold" : ""
              } text-truncate ${isSelected ? "text-primary" : ""}`}
            >
              {category.name}
            </div>
            {level === 0 && (
              <small className="text-muted text-truncate d-block">
                /{category.slug} • {category.productCount} products
              </small>
            )}
          </div>

          <div className="d-flex align-items-center gap-1 category-actions">
            {level === 0 && <div className="vr mx-1"></div>}
            <span
              className={`badge ${
                category.isVisible ? "bg-success" : "bg-secondary"
              } me-2`}
            >
              {category.isVisible ? "Hiện" : "Ẩn"}
            </span>
            <button className="btn btn-sm btn-outline-primary p-1" title="Edit">
              ✏️
            </button>
            {level === 0 && (
              <>
                <button
                  className="btn btn-sm btn-outline-secondary p-1"
                  title="Add Sub"
                >
                  ➕
                </button>
                <button
                  className="btn btn-sm btn-outline-danger p-1"
                  title="Delete"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        </div>

        {hasChildren && category.isExpanded && (
          <div className="border-start  ms-3 ps-2">
            {category.children!.map((child) =>
              renderCategory(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        body {
          font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          background-color: #f6f7f8;
        }
        .category-item .category-actions {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .category-item:hover .category-actions {
          opacity: 1;
        }
        .form-switch .form-check-input {
          width: 2.75rem;
          height: 1.5rem;
          cursor: pointer;
        }
      `}</style>

      <div className="min-vh-100 d-flex flex-column">
        {/* Top Navigation */}
        {/* <header className="bg-white border-bottom sticky-top shadow-sm">
          <div className="container-fluid px-lg-5 py-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="bg-primary bg-opacity-10 rounded d-flex align-items-center justify-center text-primary"
                  style={{ width: 32, height: 32 }}
                >
                  📊
                </div>
                <h2 className="h5 mb-0 fw-bold d-none d-sm-block">
                  Admin Portal
                </h2>
              </div>
              <div className="d-flex align-items-center gap-3 gap-lg-4">
                <nav className="d-none d-md-flex gap-4">
                  <a
                    className="text-decoration-none text-dark fw-medium"
                    href="#"
                  >
                    Dashboard
                  </a>
                  <a
                    className="text-decoration-none text-dark fw-medium"
                    href="#"
                  >
                    Products
                  </a>
                  <a
                    className="text-decoration-none text-primary fw-medium"
                    href="#"
                  >
                    Categories
                  </a>
                  <a
                    className="text-decoration-none text-dark fw-medium"
                    href="#"
                  >
                    Orders
                  </a>
                </nav>
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-link text-muted p-1">🔔</button>
                  <div
                    className="bg-secondary rounded-circle border border-2 border-white shadow-sm"
                    style={{ width: 36, height: 36 }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </header> */}

        {/* Main Content */}
        <main className="flex-grow-1 py-4">
          <div className="container-fluid px-lg-5">
            {/* Breadcrumbs & Header */}
            <div className="mb-4">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="#" className="text-decoration-none">
                      Dashboard
                    </a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Quản lý danh mục
                  </li>
                </ol>
              </nav>

              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                <h3 className="display-6 fw-bold mb-0">Danh mục sản phẩm</h3>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                    <span>📤</span>
                    <span>Nhập Excel</span>
                  </button>
                  <button className="btn btn-primary d-flex align-items-center gap-2">
                    <span>➕</span>
                    <span>Thêm danh mục gốc</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-4" style={{ maxWidth: 500 }}>
                <div className="input-group">
                  <span className="input-group-text bg-white">🔍</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm danh mục..."
                  />
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="row g-4">
              {/* Left Column: Category Tree */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm">
                  {/* Tree Header */}
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h3 className="h5 mb-0 fw-bold d-flex align-items-center gap-2">
                      <span>🌳</span>
                      Cấu trúc danh mục
                    </h3>
                    <span className="badge bg-secondary">
                      Tổng: 142 danh mục
                    </span>
                  </div>

                  {/* Tree Content */}
                  <div
                    className="card-body"
                    style={{ maxHeight: 700, overflowY: "auto" }}
                  >
                    {categories.map((category) => renderCategory(category))}
                  </div>

                  {/* Footer Actions */}
                  <div className="card-footer bg-light text-end">
                    <button className="btn btn-link text-primary text-decoration-none fw-bold">
                      <span className="me-1">💾</span>
                      Lưu thứ tự sắp xếp
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Edit Form */}
              <div className="col-lg-4">
                <div
                  className="card border-0 shadow sticky-top"
                  style={{ top: 80 }}
                >
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h3 className="h5 mb-0 fw-bold">Cập nhật danh mục</h3>
                    <span className="badge bg-primary">
                      ID: {selectedCategory?.id}
                    </span>
                  </div>

                  <div className="card-body">
                    {/* Parent Category */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Danh mục cha</label>
                      <select
                        className="form-select"
                        value={formData.parentId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parentId: Number(e.target.value),
                          })
                        }
                      >
                        <option value={1}>Điện tử & Thiết bị số</option>
                        <option value={0}>-- (Gốc)</option>
                        <option value={2}>Thời trang Nam</option>
                      </select>
                    </div>

                    {/* Name */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Tên danh mục <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    {/* Slug */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Đường dẫn (Slug)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted small">
                          /category/
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Icon Upload */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Icon / Hình ảnh
                      </label>
                      <div className="d-flex gap-3 align-items-center">
                        <div
                          className="border border-2 border-dashed rounded bg-light d-flex align-items-center justify-center"
                          style={{ width: 64, height: 64, cursor: "pointer" }}
                        >
                          <span style={{ fontSize: "1.5rem" }}>🖼️</span>
                        </div>
                        <small className="text-muted flex-grow-1">
                          Kích thước khuyến nghị 128x128px. Định dạng PNG, JPG.
                        </small>
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="d-flex justify-content-between align-items-center py-3">
                      <div>
                        <div className="fw-bold mb-1">Trạng thái</div>
                        <small className="text-muted">
                          Hiển thị trên trang chủ và menu
                        </small>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={formData.isVisible}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isVisible: e.target.checked,
                            })
                          }
                        />
                      </div>
                    </div>

                    <hr />

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 mt-3">
                      <button className="btn btn-outline-secondary flex-fill">
                        Hủy
                      </button>
                      <button className="btn btn-primary flex-fill">
                        Cập nhật
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default page;
