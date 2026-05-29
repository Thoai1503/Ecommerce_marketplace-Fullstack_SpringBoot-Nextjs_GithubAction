"use client";
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Check, Search, ArrowLeft } from "lucide-react";
import { API_URL } from "@/helper/api";

// Types (tái sử dụng từ trước)
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
  unit?: string;
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  order: number;
}

const GlobalAttributeManager = () => {
  // Danh sách thuộc tính chung (mở rộng cho nhiều ngành hàng)
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const ATTRIBUTE_API_URL = `${API_URL}/attribute`;

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const res = await fetch(ATTRIBUTE_API_URL);
      const data = await res.json();
      console.log("Fetched attributes:", data);
      alert(data);
      setAttributes(data);
    } catch (err) {
      console.error("Load attribute failed", err);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    type: "dropdown" as Attribute["type"],
    unit: "",
    isRequired: false,
    isFilterable: true,
    isSearchable: false,
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

  const filteredAttributes = attributes.filter(
    (attr) =>
      attr.label?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      attr.name?.toLowerCase().includes(searchTerm?.toLowerCase()),
  );

  const handleAddValue = () => {
    if (!newValue.trim()) return;

    const newId = Math.max(0, ...tempValues.map((v) => v.id)) + 1;
    const valueToAdd: AttributeValue = {
      id: newId,
      value: newValue.trim(),
      color: formData.type === "color" ? newColor : undefined,
    };

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
      unit: attr.unit || "",
      isRequired: attr.isRequired,
      isFilterable: attr.isFilterable,
      isSearchable: attr.isSearchable,
    });
    setTempValues([...attr.values]);
  };

  const handleSaveAttribute = async () => {
    if (!formData.name.trim() || !formData.label.trim()) {
      alert("Vui lòng nhập tên!");
      return;
    }

    const payload = {
      ...formData,
      values: tempValues,
    };

    try {
      if (isEditing && selectedAttribute) {
        // UPDATE
        await fetch(`${API_URL}/${selectedAttribute.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE
        await fetch(`${API_URL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      fetchAttributes();
      handleResetForm();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: "",
      label: "",
      type: "dropdown",
      unit: "",
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
    });
    setTempValues([]);
    setNewValue("");
    setSelectedAttribute(null);
    setIsEditing(false);
  };

  const handleDeleteAttribute = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchAttributes();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const needsValues = [
    "dropdown",
    "multiple",
    "checkbox",
    "radio",
    "color",
  ].includes(formData.type);
  const showUnitInput = ["dropdown", "multiple"].includes(formData.type);

  const formatValueWithUnit = (value: string, unit?: string) => {
    return unit ? `${value}${unit}` : value;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load Bootstrap JS chỉ một lần
      const bootstrap = require("bootstrap/dist/js/bootstrap.bundle.min.js");
      // Không cần làm gì thêm, chỉ cần import là đủ để kích hoạt dropdown
    }
  }, []);

  return (
    <>
      <style jsx global>{`
        body {
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          background-color: #f8f9fa;
        }
        .attribute-card {
          transition: all 0.15s ease;
          border: 1px solid #dee2e6;
        }
        .attribute-card:hover {
          border-color: #adb5bd;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .value-tag {
          padding: 0.25rem 0.5rem;
          background: #f1f3f5;
          border-radius: 4px;
          font-size: 0.8125rem;
        }
        .color-indicator {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          border: 1px solid #dee2e6;
          display: inline-block;
        }
      `}</style>

      <div className="min-vh-100 d-flex flex-column bg-light">
        <main className="flex-grow-1 py-4">
          <div className="container-fluid px-lg-5">
            {/* Header */}
            <div className="mb-4">
              <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <a href="#" className="text-decoration-none text-secondary">
                      Dashboard
                    </a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Quản lý thuộc tính chung
                  </li>
                </ol>
              </nav>

              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                <div>
                  <h1 className="h3 fw-semibold mb-1">Thuộc tính chung</h1>
                  <p className="text-secondary mb-0 small">
                    Quản lý các thuộc tính có thể áp dụng cho nhiều danh mục
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                    <ArrowLeft size={16} />
                    Quay lại
                  </button>
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleResetForm}
                  >
                    <Plus size={16} />
                    Thêm thuộc tính mới
                  </button>
                </div>
              </div>

              <div className="mb-4" style={{ maxWidth: 500 }}>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <Search size={16} className="text-secondary" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm thuộc tính..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Grid danh sách thuộc tính */}
            <div className="row g-4">
              {filteredAttributes.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <p className="text-secondary">
                    Không tìm thấy thuộc tính nào.
                  </p>
                </div>
              ) : (
                filteredAttributes.map((attr) => (
                  <div key={attr.id} className="col-md-6 col-lg-4">
                    <div className="card attribute-card h-100">
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title mb-0 fw-semibold">
                            {attr.label}
                          </h5>
                          <div className="attribute-actions">
                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-link text-secondary p-1"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <circle cx="12" cy="7" r="2" />
                                  <circle cx="12" cy="12" r="2" />
                                  <circle cx="12" cy="17" r="2" />
                                </svg>
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                                <li>
                                  <button
                                    className="dropdown-item d-flex align-items-center gap-2 py-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAttribute(attr);
                                    }}
                                  >
                                    <Edit2 size={16} />
                                    Chỉnh sửa
                                  </button>
                                </li>
                                <li>
                                  <hr className="dropdown-divider" />
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item d-flex align-items-center gap-0 py-0 text-danger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAttribute(attr.id);
                                    }}
                                  >
                                    <Trash2 size={16} />
                                    Xóa thuộc tính
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="small text-secondary mb-2">
                          <code>{attr.name}</code>
                        </div>
                        <div className="small text-muted mb-3">
                          {
                            attributeTypes.find((t) => t.value === attr.type)
                              ?.label
                          }
                          {attr.unit && ` • Đơn vị: ${attr.unit}`}
                        </div>

                        {attr.values.length > 0 && (
                          <div className="mt-auto">
                            <div className="small text-secondary mb-1">
                              Giá trị mẫu:
                            </div>
                            <div className="d-flex flex-wrap gap-1">
                              {attr.values.slice(0, 5).map((val) => (
                                <span key={val.id} className="value-tag">
                                  {attr.type === "color" && val.color && (
                                    <span
                                      className="color-indicator me-1"
                                      style={{ backgroundColor: val.color }}
                                    />
                                  )}
                                  {formatValueWithUnit(val.value, attr.unit)}
                                </span>
                              ))}
                              {attr.values.length > 5 && (
                                <span className="value-tag text-muted">
                                  +{attr.values.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Modal Form Thêm/Sửa */}
        {(isEditing || formData.name || formData.label) && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold">
                    {isEditing
                      ? "Cập nhật thuộc tính chung"
                      : "Thêm thuộc tính chung mới"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleResetForm}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Tên thuộc tính <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="brand"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                      <small className="text-muted">
                        Không dấu, dùng _ thay khoảng trắng
                      </small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Tên hiển thị <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Thương hiệu"
                        value={formData.label}
                        onChange={(e) =>
                          setFormData({ ...formData, label: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Loại dữ liệu
                      </label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => {
                          const newType = e.target.value as Attribute["type"];
                          setFormData({
                            ...formData,
                            type: newType,
                            unit: ["dropdown", "multiple"].includes(newType)
                              ? formData.unit
                              : "",
                          });
                        }}
                      >
                        {attributeTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {showUnitInput && (
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Đơn vị
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder='", GB, MP...'
                          value={formData.unit}
                          onChange={(e) =>
                            setFormData({ ...formData, unit: e.target.value })
                          }
                        />
                      </div>
                    )}
                  </div>

                  {needsValues && (
                    <>
                      <hr className="my-4" />
                      <label className="form-label small fw-semibold mb-2">
                        Giá trị
                      </label>
                      <div className="input-group mb-3">
                        {formData.type === "color" && (
                          <input
                            type="color"
                            className="form-control form-control-color"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                          />
                        )}
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nhập giá trị"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddValue()
                          }
                        />
                        <button
                          className="btn btn-primary"
                          onClick={handleAddValue}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {tempValues.length > 0 && (
                        <div className="d-flex flex-wrap gap-2">
                          {tempValues.map((val) => (
                            <span
                              key={val.id}
                              className="badge bg-light text-dark d-flex align-items-center gap-1"
                            >
                              {formData.type === "color" && val.color && (
                                <span
                                  className="color-indicator"
                                  style={{ backgroundColor: val.color }}
                                />
                              )}
                              {formatValueWithUnit(val.value, formData.unit)}
                              <button
                                className="btn-close btn-close-sm ms-1"
                                onClick={() => handleRemoveValue(val.id)}
                              ></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <hr className="my-4" />
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="req"
                          checked={formData.isRequired}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isRequired: e.target.checked,
                            })
                          }
                        />
                        <label className="form-check-label small" htmlFor="req">
                          Bắt buộc
                        </label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="filter"
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
                          htmlFor="filter"
                        >
                          Bộ lọc
                        </label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="search"
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
                          htmlFor="search"
                        >
                          Tìm kiếm
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleResetForm}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleSaveAttribute}
                  >
                    <Check size={16} />
                    {isEditing ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GlobalAttributeManager;
