"use client";
import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronRight,
  Search,
  ArrowLeft,
  Save,
} from "lucide-react";

// Types
interface AttributeValue {
  id: number;
  value: string;
  color?: string;
}

interface Attribute {
  id: number;
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "dropdown"
    | "multiple"
    | "checkbox"
    | "radio"
    | "color"
    | "date";
  values: AttributeValue[];
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  order: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const CategoryAttributeManager = () => {
  // Sample data
  const [selectedCategory] = useState<Category>({
    id: 24,
    name: "Điện thoại di động",
    slug: "dien-thoai-di-dong",
  });

  const [attributes, setAttributes] = useState<Attribute[]>([
    {
      id: 1,
      name: "screen_size",
      label: "Kích thước màn hình",
      type: "dropdown",
      values: [
        { id: 1, value: '6.1"' },
        { id: 2, value: '6.5"' },
        { id: 3, value: '6.7"' },
        { id: 4, value: '6.9"' },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: true,
      order: 1,
    },
    {
      id: 2,
      name: "ram",
      label: "Dung lượng RAM",
      type: "multiple",
      values: [
        { id: 5, value: "4GB" },
        { id: 6, value: "6GB" },
        { id: 7, value: "8GB" },
        { id: 8, value: "12GB" },
        { id: 9, value: "16GB" },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: false,
      order: 2,
    },
    {
      id: 3,
      name: "storage",
      label: "Bộ nhớ trong",
      type: "checkbox",
      values: [
        { id: 10, value: "64GB" },
        { id: 11, value: "128GB" },
        { id: 12, value: "256GB" },
        { id: 13, value: "512GB" },
        { id: 14, value: "1TB" },
      ],
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
      order: 3,
    },
    {
      id: 4,
      name: "color",
      label: "Màu sắc",
      type: "color",
      values: [
        { id: 15, value: "Đỏ", color: "#DC3545" },
        { id: 16, value: "Đen", color: "#212529" },
        { id: 17, value: "Trắng", color: "#F8F9FA" },
        { id: 18, value: "Xanh dương", color: "#0D6EFD" },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: false,
      order: 4,
    },
  ]);

  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    type: "dropdown" as Attribute["type"],
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
    order: attributes.length + 1,
  });

  const [newValue, setNewValue] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  const [tempValues, setTempValues] = useState<AttributeValue[]>([]);

  const attributeTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "dropdown", label: "Dropdown" },
    { value: "multiple", label: "Multiple Select" },
    { value: "checkbox", label: "Checkbox" },
    { value: "radio", label: "Radio" },
    { value: "color", label: "Color" },
    { value: "date", label: "Date" },
  ];

  const handleAddValue = () => {
    if (!newValue.trim()) return;

    const newId = Math.max(0, ...tempValues.map((v) => v.id)) + 1;
    const valueToAdd: AttributeValue = {
      id: newId,
      value: newValue.trim(),
    };

    if (formData.type === "color") {
      valueToAdd.color = newColor;
    }

    setTempValues([...tempValues, valueToAdd]);
    setNewValue("");
    setNewColor("#000000");
  };

  const handleRemoveValue = (id: number) => {
    setTempValues(tempValues.filter((v) => v.id !== id));
  };

  const handleEditAttribute = (attr: Attribute) => {
    setSelectedAttribute(attr);
    setIsEditing(true);
    setFormData({
      name: attr.name,
      label: attr.label,
      type: attr.type,
      isRequired: attr.isRequired,
      isFilterable: attr.isFilterable,
      isSearchable: attr.isSearchable,
      order: attr.order,
    });
    setTempValues([...attr.values]);
  };

  const handleSaveAttribute = () => {
    if (!formData.name.trim() || !formData.label.trim()) {
      alert("Vui lòng nhập tên thuộc tính và label!");
      return;
    }

    if (isEditing && selectedAttribute) {
      // Update existing
      setAttributes(
        attributes.map((attr) =>
          attr.id === selectedAttribute.id
            ? {
                ...attr,
                ...formData,
                values: tempValues,
              }
            : attr
        )
      );
    } else {
      // Add new
      const newAttr: Attribute = {
        id: Math.max(0, ...attributes.map((a) => a.id)) + 1,
        ...formData,
        values: tempValues,
      };
      setAttributes([...attributes, newAttr]);
    }

    handleResetForm();
  };

  const handleResetForm = () => {
    setFormData({
      name: "",
      label: "",
      type: "dropdown",
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
      order: attributes.length + 1,
    });
    setTempValues([]);
    setNewValue("");
    setSelectedAttribute(null);
    setIsEditing(false);
  };

  const handleDeleteAttribute = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa thuộc tính này?")) {
      setAttributes(attributes.filter((attr) => attr.id !== id));
      if (selectedAttribute?.id === id) {
        handleResetForm();
      }
    }
  };

  const needsValues = [
    "dropdown",
    "multiple",
    "checkbox",
    "radio",
    "color",
  ].includes(formData.type);

  return (
    <>
      <style jsx global>{`
        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          background-color: #f8f9fa;
        }
        .attribute-item {
          transition: all 0.15s ease;
          border: 1px solid #dee2e6;
          background: white;
        }
        .attribute-item:hover {
          border-color: #adb5bd;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }
        .attribute-item.selected {
          border-color: #0d6efd;
          background-color: #f0f5ff;
        }
        .attribute-actions {
          opacity: 0;
          transition: opacity 0.15s;
        }
        .attribute-item:hover .attribute-actions {
          opacity: 1;
        }
        .value-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.625rem;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 0.8125rem;
          color: #495057;
        }
        .color-indicator {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          border: 1px solid #dee2e6;
          display: inline-block;
        }
        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .btn-icon {
          width: 32px;
          height: 32px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          border: 1px solid #dee2e6;
        }
        .badge {
          font-weight: 500;
          padding: 0.25rem 0.5rem;
        }
      `}</style>

      <div className="min-vh-100 d-flex flex-column">
        <main className="flex-grow-1 py-4">
          <div className="container-fluid px-lg-5">
            {/* Breadcrumbs & Header */}
            <div className="mb-4">
              <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <a href="#" className="text-decoration-none text-secondary">
                      Dashboard
                    </a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="#" className="text-decoration-none text-secondary">
                      Danh mục
                    </a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="#" className="text-decoration-none text-secondary">
                      {selectedCategory.name}
                    </a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Quản lý thuộc tính
                  </li>
                </ol>
              </nav>

              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                <div>
                  <h1 className="h3 fw-semibold mb-1">
                    Thuộc tính: {selectedCategory.name}
                  </h1>
                  <p className="text-secondary mb-0 small">
                    Quản lý các thuộc tính cho sản phẩm thuộc danh mục này
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                    <ArrowLeft size={16} />
                    <span>Quay lại</span>
                  </button>
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleResetForm}
                  >
                    <Plus size={16} />
                    <span>Thêm thuộc tính</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-4" style={{ maxWidth: 400 }}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={16} className="text-secondary" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Tìm kiếm thuộc tính..."
                  />
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="row g-4">
              {/* Left Column: Attributes List */}
              <div className="col-lg-8">
                <div className="card shadow-sm">
                  <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                    <h2 className="h6 mb-0 fw-semibold">
                      Danh sách thuộc tính
                    </h2>
                    <span className="badge bg-secondary">
                      {attributes.length} thuộc tính
                    </span>
                  </div>

                  <div
                    className="card-body p-3"
                    style={{ maxHeight: 700, overflowY: "auto" }}
                  >
                    {attributes.length === 0 ? (
                      <div className="text-center py-5">
                        <div className="text-secondary mb-3">
                          <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="9" y1="9" x2="15" y2="9" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="13" y2="17" />
                          </svg>
                        </div>
                        <p className="text-secondary mb-1">
                          Chưa có thuộc tính nào
                        </p>
                        <p className="small text-muted">
                          Nhấn "Thêm thuộc tính" để bắt đầu
                        </p>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {attributes
                          .sort((a, b) => a.order - b.order)
                          .map((attr) => (
                            <div
                              key={attr.id}
                              className={`attribute-item rounded p-3 ${
                                selectedAttribute?.id === attr.id
                                  ? "selected"
                                  : ""
                              }`}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleEditAttribute(attr)}
                            >
                              <div className="d-flex align-items-start gap-3">
                                <div
                                  className="d-flex flex-column gap-1 text-secondary"
                                  style={{ cursor: "move" }}
                                >
                                  <div
                                    style={{
                                      width: 4,
                                      height: 4,
                                      backgroundColor: "#adb5bd",
                                      borderRadius: "50%",
                                    }}
                                  ></div>
                                  <div
                                    style={{
                                      width: 4,
                                      height: 4,
                                      backgroundColor: "#adb5bd",
                                      borderRadius: "50%",
                                    }}
                                  ></div>
                                  <div
                                    style={{
                                      width: 4,
                                      height: 4,
                                      backgroundColor: "#adb5bd",
                                      borderRadius: "50%",
                                    }}
                                  ></div>
                                </div>

                                <div className="flex-grow-1 min-w-0">
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <h3 className="h6 mb-0 fw-semibold">
                                      {attr.label}
                                    </h3>
                                    {attr.isRequired && (
                                      <span className="badge bg-danger-subtle text-danger border border-danger">
                                        Bắt buộc
                                      </span>
                                    )}
                                    {attr.isFilterable && (
                                      <span className="badge bg-info-subtle text-info border border-info">
                                        Bộ lọc
                                      </span>
                                    )}
                                  </div>

                                  <div className="small text-secondary mb-2">
                                    <span className="me-3">
                                      <strong>Tên:</strong> {attr.name}
                                    </span>
                                    <span>
                                      <strong>Loại:</strong>{" "}
                                      {
                                        attributeTypes.find(
                                          (t) => t.value === attr.type
                                        )?.label
                                      }
                                    </span>
                                  </div>

                                  {attr.values.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 align-items-center">
                                      <span className="small text-secondary">
                                        Giá trị:
                                      </span>
                                      {attr.values.map((val) => (
                                        <span
                                          key={val.id}
                                          className="value-tag"
                                        >
                                          {attr.type === "color" &&
                                            val.color && (
                                              <span
                                                className="color-indicator"
                                                style={{
                                                  backgroundColor: val.color,
                                                }}
                                              />
                                            )}
                                          {val.value}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="attribute-actions d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-primary btn-icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAttribute(attr);
                                    }}
                                    title="Chỉnh sửa"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger btn-icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAttribute(attr.id);
                                    }}
                                    title="Xóa"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="card-footer bg-white border-top text-end py-2">
                    <button className="btn btn-sm btn-link text-decoration-none">
                      <Save size={14} className="me-1" />
                      Lưu thứ tự sắp xếp
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Add/Edit Form */}
              <div className="col-lg-4">
                <div className="card shadow-sm sticky-top" style={{ top: 20 }}>
                  <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                    <h2 className="h6 mb-0 fw-semibold">
                      {isEditing
                        ? "Cập nhật thuộc tính"
                        : "Thêm thuộc tính mới"}
                    </h2>
                    {isEditing && selectedAttribute && (
                      <span className="badge bg-primary">
                        #{selectedAttribute.id}
                      </span>
                    )}
                  </div>

                  <div
                    className="card-body p-3"
                    style={{ maxHeight: 600, overflowY: "auto" }}
                  >
                    {/* Name */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small mb-1">
                        Tên thuộc tính <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="screen_size"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                      <small className="text-muted">
                        Không dấu, viết thường, dùng _ thay khoảng trắng
                      </small>
                    </div>

                    {/* Label */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small mb-1">
                        Tên hiển thị <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Kích thước màn hình"
                        value={formData.label}
                        onChange={(e) =>
                          setFormData({ ...formData, label: e.target.value })
                        }
                      />
                    </div>

                    {/* Type */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small mb-1">
                        Loại dữ liệu <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as Attribute["type"],
                          })
                        }
                      >
                        {attributeTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <hr className="my-3" />

                    {/* Values Section */}
                    {needsValues && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold small mb-2">
                          Giá trị thuộc tính
                        </label>

                        <div className="input-group mb-2">
                          {formData.type === "color" && (
                            <input
                              type="color"
                              className="form-control form-control-color"
                              value={newColor}
                              onChange={(e) => setNewColor(e.target.value)}
                              style={{ maxWidth: 48 }}
                            />
                          )}
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập giá trị"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddValue();
                              }
                            }}
                          />
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={handleAddValue}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {tempValues.length > 0 && (
                          <div
                            className="border rounded p-2 bg-light"
                            style={{ maxHeight: 180, overflowY: "auto" }}
                          >
                            <div className="small text-secondary mb-2">
                              Đã thêm ({tempValues.length})
                            </div>
                            <div className="d-flex flex-column gap-1">
                              {tempValues.map((val) => (
                                <div
                                  key={val.id}
                                  className="d-flex align-items-center gap-2 p-2 bg-white border rounded"
                                >
                                  {formData.type === "color" && val.color && (
                                    <span
                                      className="color-indicator"
                                      style={{ backgroundColor: val.color }}
                                    />
                                  )}
                                  <span className="flex-grow-1 small">
                                    {val.value}
                                  </span>
                                  <button
                                    className="btn btn-sm btn-link text-danger p-0"
                                    onClick={() => handleRemoveValue(val.id)}
                                    style={{ width: 20, height: 20 }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <hr className="my-3" />

                    {/* Options */}
                    <div className="mb-3">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isRequired"
                          checked={formData.isRequired}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isRequired: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="isRequired"
                        >
                          Bắt buộc khi tạo sản phẩm
                        </label>
                      </div>

                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isFilterable"
                          checked={formData.isFilterable}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isFilterable: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="isFilterable"
                        >
                          Hiển thị trong bộ lọc
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isSearchable"
                          checked={formData.isSearchable}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isSearchable: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="isSearchable"
                        >
                          Cho phép tìm kiếm
                        </label>
                      </div>
                    </div>

                    {/* Order */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small mb-1">
                        Thứ tự hiển thị
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.order}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="card-footer bg-white border-top py-3">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary flex-fill"
                        onClick={handleResetForm}
                      >
                        Hủy
                      </button>
                      <button
                        className="btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2"
                        onClick={handleSaveAttribute}
                      >
                        <Check size={16} />
                        {isEditing ? "Cập nhật" : "Thêm mới"}
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

export default CategoryAttributeManager;
