"use client";

import React, { useEffect, useRef, useState } from "react";
import { convertDbCategoriesToComponentFormat } from "@/helper/utils";
import type { DbCategory, Category } from "@/helper/utils";
import { useQuery } from "@tanstack/react-query";
import { categoryQuery } from "@/query/category";
import {
  FolderTree,
  Plus,
  Search,
  Upload,
  Save,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  FileText,
  Eye,
  EyeOff,
  Image,
} from "lucide-react";
import { Skeleton } from "@mui/material";
import { useCategoryPage } from "@/hooks/admin/category_page/useCategoryPage";
import {
  CButton,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from "@coreui/react";
const Page: React.FC = () => {
  const exampleToast = (message = "default") => (
    <CToast>
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <div className="fw-bold me-auto">CoreUI for React.js</div>
        <small>7 min ago</small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  );
  const [toast, addToast] = useState<any>();
  const toaster = useRef(null);
  const {
    searchQuery,
    setSearchQuery,
    categories,
    isPending,
    toggleCategory,
    selectedCategory,
    handleSelectCategory,
    setSelectedCategory,
    resetToCreateMode,
    handleDelete,
    handleNameChange,
    handleSubmit,
    formData,
    setFormData,
    formMode,
    setFormMode,
    data,
  } = useCategoryPage((message: string) => {
    addToast(exampleToast(message));
  });

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategory?.id === category.id;

    return (
      <div key={category.id} className={level > 0 ? `ms-${level * 3}` : ""}>
        <div
          className={`category-item d-flex align-items-center gap-3 px-3 py-3 mb-2 rounded-3 border ${
            isSelected
              ? "border-primary bg-primary bg-opacity-10 shadow-sm"
              : "border-light bg-white"
          }`}
          onClick={() => handleSelectCategory(category)}
          style={{
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {/* Expand/Collapse Icon */}
          <div style={{ width: "20px" }}>
            {hasChildren ? (
              <button
                className="btn btn-link p-0 text-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category.id);
                }}
              >
                {category.isExpanded ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
            ) : (
              <div className="d-flex align-items-center justify-content-center">
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#dee2e6",
                  }}
                />
              </div>
            )}
          </div>

          {/* Category Icon/Image */}
          {level === 0 && (
            <div
              className="d-flex align-items-center justify-content-center bg-light rounded-2"
              style={{ width: 40, height: 40, flexShrink: 0 }}
            >
              <FolderTree size={20} className="text-primary" />
            </div>
          )}

          {/* Category Info */}
          <div className="flex-grow-1 min-w-0">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h6
                className={`mb-0 text-truncate ${
                  level === 0 ? "fw-bold" : "fw-semibold"
                } ${isSelected ? "text-primary" : "text-dark"}`}
                style={{ fontSize: level === 0 ? "0.95rem" : "0.875rem" }}
              >
                {category.name}
              </h6>
              {level === 0 && (
                <span className="badge bg-light text-secondary border">
                  {category.productCount || 0}
                </span>
              )}
            </div>
            {level === 0 && (
              <small className="text-muted d-flex align-items-center gap-1">
                <FileText size={12} />/{category.slug}
              </small>
            )}
          </div>

          {/* Status Badge */}
          <div className="d-flex align-items-center gap-2 category-actions">
            {category.isVisible ? (
              <span className="badge bg-success-subtle text-success border border-success">
                <Eye size={12} className="me-1" />
                Hiển thị
              </span>
            ) : (
              <span className="badge bg-secondary-subtle text-secondary border border-secondary">
                <EyeOff size={12} className="me-1" />
                Ẩn
              </span>
            )}

            {/* Action Buttons */}
            <div className="d-flex align-items-center gap-1">
              <button
                className="btn btn-sm btn-light border"
                title="Chỉnh sửa"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectCategory(category);
                }}
              >
                <Edit2 size={14} />
              </button>
              {level === 0 && (
                <>
                  <button
                    className="btn btn-sm btn-light border"
                    title="Thêm danh mục con"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormMode("create");
                      setFormData({
                        id: null,
                        parent_id: category.id,
                        name: "",
                        slug: "",
                        level: category.level,
                        isVisible: true,
                      });
                      setSelectedCategory(null);
                    }}
                  >
                    <FolderPlus size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-light border text-danger"
                    title="Xóa"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(category.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {hasChildren && category.isExpanded && (
          <div className="ms-4 border-start  ps-3 mb-2">
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
          font-family: "Inter", "Plus Jakarta Sans", -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          background-color: #f8f9fa;
        }

        .category-item {
          transition: all 0.2s ease;
        }

        .category-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }

        .category-item .category-actions {
          opacity: 0;
          transition: opacity 0.2s;
        }

        .category-item:hover .category-actions {
          opacity: 1;
        }

        .form-switch .form-check-input {
          width: 3rem;
          height: 1.5rem;
          cursor: pointer;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1);
        }

        .card {
          border-radius: 12px;
        }

        .btn {
          border-radius: 8px;
          font-weight: 500;
        }
      `}</style>

      <div className="min-vh-100 container ml-4">
        <main className="py-4">
          <div className="container-fluid px-4">
            {/* Header Section */}
            <div className="mb-4">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">
                <div>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-2">
                      <li className="breadcrumb-item">
                        <a href="#" className="text-decoration-none">
                          Dashboard
                        </a>
                      </li>
                      <li className="breadcrumb-item active">
                        Quản lý danh mục
                      </li>
                    </ol>
                  </nav>
                  <h2 className="h3 fw-bold mb-0">Danh mục sản phẩm</h2>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-primary d-flex align-items-center gap-2">
                    <Upload size={18} />
                    <span>Nhập Excel</span>
                  </button>
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={resetToCreateMode}
                  >
                    <Plus size={18} />
                    <span>Thêm danh mục</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-4" style={{ maxWidth: 500 }}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={18} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Tìm kiếm danh mục..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="row g-4">
              {/* Left Column: Category Tree */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                    <div className="d-flex align-items-center gap-2">
                      <FolderTree size={20} className="text-primary" />
                      <h5 className="mb-0 fw-bold">Cấu trúc danh mục</h5>
                    </div>
                    <span className="badge bg-primary-subtle text-primary border border-primary">
                      {categories.length} danh mục
                    </span>
                  </div>

                  <div
                    className="card-body p-3"
                    style={{ maxHeight: 700, overflowY: "auto" }}
                  >
                    {isPending ? (
                      <>
                        <Skeleton height={90} />
                        <Skeleton height={90} />
                        <Skeleton height={90} />
                        <Skeleton height={90} />
                      </>
                    ) : categories.length === 0 ? (
                      <div className="text-center py-5">
                        <FolderTree size={48} className="text-muted mb-3" />
                        <p className="text-muted mb-0">Chưa có danh mục nào.</p>
                        <button
                          className="btn btn-primary mt-3"
                          onClick={resetToCreateMode}
                        >
                          <Plus size={18} className="me-2" />
                          Tạo danh mục đầu tiên
                        </button>
                      </div>
                    ) : (
                      categories.map((category) => renderCategory(category))
                    )}
                  </div>

                  <div className="card-footer bg-light border-top text-end py-3">
                    <button className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
                      <Save size={18} />
                      <span>Lưu thứ tự</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="col-lg-4">
                <div
                  className="card border-0 shadow-sm sticky-top"
                  style={{ top: 20 }}
                >
                  <div className="card-header bg-white border-bottom py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        {formMode === "create" ? (
                          <Plus size={20} className="text-success" />
                        ) : (
                          <Edit2 size={20} className="text-primary" />
                        )}
                        <h5 className="mb-0 fw-bold">
                          {formMode === "create"
                            ? "Thêm danh mục"
                            : "Chỉnh sửa danh mục"}
                        </h5>
                      </div>
                      {formMode === "edit" && (
                        <button
                          className="btn btn-sm btn-light border"
                          onClick={resetToCreateMode}
                          title="Đóng"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="card-body p-4">
                    {/* Mode Badge */}
                    {formMode === "edit" && selectedCategory && (
                      <div className="alert alert-info d-flex align-items-center gap-2 mb-4">
                        <Edit2 size={16} />
                        <small className="mb-0">
                          Đang chỉnh sửa:{" "}
                          <strong>{selectedCategory.name}</strong>
                        </small>
                      </div>
                    )}

                    {/* Parent Category */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold d-flex align-items-center gap-2">
                        <FolderTree size={16} />
                        Danh mục cha
                      </label>
                      <select
                        className="form-select"
                        value={formData.parent_id ?? 0}
                        onChange={(e) => {
                          const selectedOption = e.target.selectedOptions[0];
                          const parentId = Number(e.target.value);
                          const parentLevel = selectedOption
                            ? Number(selectedOption.dataset.level || 0)
                            : 0;

                          setFormData({
                            ...formData,
                            parent_id: parentId,
                            level: parentId === 0 ? 0 : parentLevel + 1,
                          });
                        }}
                      >
                        <option value={0}>-- Danh mục gốc --</option>
                        {data?.map((cat) => (
                          <option
                            key={cat.id}
                            value={cat.id}
                            data-level={cat.level}
                          >
                            {"─".repeat(cat.level * 2)} {cat.category_name} (cấp{" "}
                            {cat.level})
                          </option>
                        ))}
                      </select>
                      {formData.parent_id === 0 && (
                        <small className="text-muted mt-1 d-block">
                          Danh mục này sẽ hiển thị ở cấp cao nhất
                        </small>
                      )}
                    </div>

                    {/* Name */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Tên danh mục <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="VD: Điện thoại di động"
                        required
                      />
                    </div>

                    {/* Slug */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Đường dẫn (URL Slug)
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
                          placeholder="dien-thoai-di-dong"
                        />
                      </div>
                      <small className="text-muted mt-1 d-block">
                        Tự động tạo từ tên danh mục
                      </small>
                    </div>

                    {/* Icon Upload */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold d-flex align-items-center gap-2">
                        <Image size={16} />
                        Hình ảnh đại diện
                      </label>
                      <div className="d-flex gap-3 align-items-center">
                        <div
                          className="border border-2 border-dashed rounded-3 bg-light d-flex align-items-center justify-content-center"
                          style={{ width: 80, height: 80, cursor: "pointer" }}
                        >
                          <Image size={28} className="text-muted" />
                        </div>
                        <div className="flex-grow-1">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm mb-2"
                          >
                            <Upload size={14} className="me-1" />
                            Tải ảnh lên
                          </button>
                          <small className="text-muted d-block">
                            PNG, JPG. Tối đa 2MB
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="border rounded-3 p-3 mb-4 bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold mb-1">
                            Trạng thái hiển thị
                          </div>
                          <small className="text-muted">
                            {formData.isVisible
                              ? "Danh mục đang hiển thị công khai"
                              : "Danh mục đang ẩn"}
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
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="card-footer bg-white border-top p-4">
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary flex-fill"
                        onClick={resetToCreateMode}
                      >
                        {formMode === "create" ? "Làm mới" : "Hủy"}
                      </button>
                      <button
                        type="button"
                        className={`btn flex-fill ${
                          formMode === "create" ? "btn-success" : "btn-primary"
                        }`}
                        onClick={handleSubmit}
                      >
                        {formMode === "create" ? (
                          <>
                            <Plus size={18} className="me-1" />
                            Tạo mới
                          </>
                        ) : (
                          <>
                            <Save size={18} className="me-1" />
                            Cập nhật
                          </>
                        )}
                      </button>
                    </div>

                    {formMode === "edit" && (
                      <button
                        type="button"
                        className="btn btn-outline-danger w-100 mt-2"
                        onClick={() => formData.id && handleDelete(formData.id)}
                      >
                        <Trash2 size={18} className="me-1" />
                        Xóa danh mục này
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <CToaster
        className="p-3"
        placement="top-end"
        push={toast}
        ref={toaster}
      />
    </>
  );
};

export default Page;
