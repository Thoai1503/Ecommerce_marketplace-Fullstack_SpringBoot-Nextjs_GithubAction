"use client";
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Check, Search, ArrowLeft } from "lucide-react";

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
  const [attributes, setAttributes] = useState<Attribute[]>([
    // Ngành điện thoại
    {
      id: 101,
      name: "brand",
      label: "Thương hiệu",
      type: "dropdown",
      values: [
        { id: 1011, value: "Apple" },
        { id: 1012, value: "Samsung" },
        { id: 1013, value: "Xiaomi" },
        { id: 1014, value: "Oppo" },
        { id: 1015, value: "Huawei" },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: true,
      order: 1,
    },
    {
      id: 102,
      name: "battery_capacity",
      label: "Dung lượng pin",
      type: "dropdown",
      unit: "mAh",
      values: [
        { id: 1021, value: "3000" },
        { id: 1022, value: "4000" },
        { id: 1023, value: "5000" },
        { id: 1024, value: "6000" },
      ],
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
      order: 2,
    },
    {
      id: 103,
      name: "camera_resolution",
      label: "Độ phân giải camera chính",
      type: "multiple",
      unit: "MP",
      values: [
        { id: 1031, value: "48" },
        { id: 1032, value: "64" },
        { id: 1033, value: "108" },
        { id: 1034, value: "200" },
      ],
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
      order: 3,
    },
    {
      id: 104,
      name: "operating_system",
      label: "Hệ điều hành",
      type: "radio",
      values: [
        { id: 1041, value: "iOS" },
        { id: 1042, value: "Android" },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: false,
      order: 4,
    },
    {
      id: 105,
      name: "release_year",
      label: "Năm ra mắt",
      type: "dropdown",
      values: [
        { id: 1051, value: "2022" },
        { id: 1052, value: "2023" },
        { id: 1053, value: "2024" },
        { id: 1054, value: "2025" },
      ],
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
      order: 5,
    },
    // Ngành thời trang
    {
      id: 201,
      name: "clothing_size",
      label: "Kích cỡ quần áo",
      type: "dropdown",
      values: [
        { id: 2011, value: "XS" },
        { id: 2012, value: "S" },
        { id: 2013, value: "M" },
        { id: 2014, value: "L" },
        { id: 2015, value: "XL" },
        { id: 2016, value: "XXL" },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: false,
      order: 6,
    },
    {
      id: 202,
      name: "material",
      label: "Chất liệu",
      type: "multiple",
      values: [
        { id: 2021, value: "Cotton" },
        { id: 2022, value: "Polyester" },
        { id: 2023, value: "Wool" },
        { id: 2024, value: "Silk" },
        { id: 2025, value: "Denim" },
      ],
      isRequired: false,
      isFilterable: true,
      isSearchable: true,
      order: 7,
    },
    {
      id: 203,
      name: "gender",
      label: "Giới tính",
      type: "radio",
      values: [
        { id: 2031, value: "Nam" },
        { id: 2032, value: "Nữ" },
        { id: 2033, value: "Unisex" },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: false,
      order: 8,
    },
    {
      id: 204,
      name: "fashion_style",
      label: "Phong cách",
      type: "checkbox",
      values: [
        { id: 2041, value: "Casual" },
        { id: 2042, value: "Formal" },
        { id: 2043, value: "Sporty" },
        { id: 2044, value: "Vintage" },
      ],
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
      order: 9,
    },
    // Ngành thực phẩm
    {
      id: 301,
      name: "weight",
      label: "Trọng lượng",
      type: "number",
      unit: "g",
      values: [],
      isRequired: true,
      isFilterable: false,
      isSearchable: false,
      order: 10,
    },
    {
      id: 302,
      name: "expiration_date",
      label: "Hạn sử dụng",
      type: "date",
      values: [],
      isRequired: true,
      isFilterable: false,
      isSearchable: false,
      order: 11,
    },
    {
      id: 303,
      name: "ingredients",
      label: "Thành phần",
      type: "text",
      values: [],
      isRequired: false,
      isFilterable: false,
      isSearchable: true,
      order: 12,
    },
    {
      id: 304,
      name: "diet_type",
      label: "Loại chế độ ăn",
      type: "multiple",
      values: [
        { id: 3041, value: "Vegan" },
        { id: 3042, value: "Vegetarian" },
        { id: 3043, value: "Gluten-Free" },
        { id: 3044, value: "Organic" },
      ],
      isRequired: false,
      isFilterable: true,
      isSearchable: true,
      order: 13,
    },
    // Ngành sách
    {
      id: 401,
      name: "author",
      label: "Tác giả",
      type: "text",
      values: [],
      isRequired: true,
      isFilterable: true,
      isSearchable: true,
      order: 14,
    },
    {
      id: 402,
      name: "publisher",
      label: "Nhà xuất bản",
      type: "dropdown",
      values: [
        { id: 4021, value: "Kim Đồng" },
        { id: 4022, value: "Nhã Nam" },
        { id: 4023, value: "Penguin Books" },
        { id: 4024, value: "HarperCollins" },
      ],
      isRequired: false,
      isFilterable: true,
      isSearchable: true,
      order: 15,
    },
    {
      id: 403,
      name: "genre",
      label: "Thể loại",
      type: "multiple",
      values: [
        { id: 4031, value: "Tiểu thuyết" },
        { id: 4032, value: "Khoa học viễn tưởng" },
        { id: 4033, value: "Lịch sử" },
        { id: 4034, value: "Kinh tế" },
        { id: 4035, value: "Truyện tranh" },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: true,
      order: 16,
    },
    {
      id: 404,
      name: "pages",
      label: "Số trang",
      type: "number",
      values: [],
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
      order: 17,
    },
    // Ngành điện gia dụng
    {
      id: 501,
      name: "power_consumption",
      label: "Công suất tiêu thụ",
      type: "number",
      unit: "W",
      values: [],
      isRequired: true,
      isFilterable: true,
      isSearchable: false,
      order: 18,
    },
    {
      id: 502,
      name: "voltage",
      label: "Điện áp",
      type: "dropdown",
      unit: "V",
      values: [
        { id: 5021, value: "110" },
        { id: 5022, value: "220" },
        { id: 5023, value: "240" },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: false,
      order: 19,
    },
    {
      id: 503,
      name: "energy_efficiency",
      label: "Hiệu suất năng lượng",
      type: "radio",
      values: [
        { id: 5031, value: "A+++" },
        { id: 5032, value: "A++" },
        { id: 5033, value: "A+" },
        { id: 5034, value: "A" },
      ],
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
      order: 20,
    },
    // Ngành ô tô
    {
      id: 601,
      name: "fuel_type",
      label: "Loại nhiên liệu",
      type: "dropdown",
      values: [
        { id: 6011, value: "Xăng" },
        { id: 6012, value: "Diesel" },
        { id: 6013, value: "Điện" },
        { id: 6014, value: "Hybrid" },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: true,
      order: 21,
    },
    {
      id: 602,
      name: "transmission",
      label: "Hộp số",
      type: "radio",
      values: [
        { id: 6021, value: "Tự động" },
        { id: 6022, value: "Số sàn" },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: false,
      order: 22,
    },
    {
      id: 603,
      name: "seats",
      label: "Số chỗ ngồi",
      type: "number",
      values: [],
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
      order: 23,
    },
    {
      id: 604,
      name: "engine_capacity",
      label: "Dung tích động cơ",
      type: "dropdown",
      unit: "L",
      values: [
        { id: 6041, value: "1.0" },
        { id: 6042, value: "1.5" },
        { id: 6043, value: "2.0" },
        { id: 6044, value: "2.5" },
        { id: 6045, value: "3.0" },
      ],
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
      order: 24,
    },
    // Ngành mỹ phẩm
    {
      id: 701,
      name: "skin_type",
      label: "Loại da",
      type: "multiple",
      values: [
        { id: 7011, value: "Da khô" },
        { id: 7012, value: "Da dầu" },
        { id: 7013, value: "Da hỗn hợp" },
        { id: 7014, value: "Da nhạy cảm" },
      ],
      isRequired: false,
      isFilterable: true,
      isSearchable: true,
      order: 25,
    },
    {
      id: 702,
      name: "volume",
      label: "Dung tích",
      type: "dropdown",
      unit: "ml",
      values: [
        { id: 7021, value: "30" },
        { id: 7022, value: "50" },
        { id: 7023, value: "100" },
        { id: 7024, value: "200" },
      ],
      isRequired: true,
      isFilterable: true,
      isSearchable: false,
      order: 26,
    },
    {
      id: 703,
      name: "spf",
      label: "Chỉ số chống nắng",
      type: "number",
      values: [],
      isRequired: false,
      isFilterable: true,
      isSearchable: false,
      order: 27,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(
    null
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
      attr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSaveAttribute = () => {
    if (!formData.name.trim() || !formData.label.trim()) {
      alert("Vui lòng nhập tên thuộc tính và tên hiển thị!");
      return;
    }

    if (isEditing && selectedAttribute) {
      // Cập nhật
      setAttributes(
        attributes.map((attr) =>
          attr.id === selectedAttribute.id
            ? { ...attr, ...formData, values: tempValues }
            : attr
        )
      );
    } else {
      // Thêm mới
      const newAttr: Attribute = {
        id: Math.max(0, ...attributes.map((a) => a.id)) + 1,
        ...formData,
        values: tempValues,
        order: attributes.length + 1,
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

  const handleDeleteAttribute = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa thuộc tính chung này?")) {
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
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
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
