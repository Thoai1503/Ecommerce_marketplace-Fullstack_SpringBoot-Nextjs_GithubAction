"use client";
import React, { useState, useRef, useEffect } from "react";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal, Upload, UploadFile, UploadProps, message } from "antd";
//import "bootstrap-icons/font/bootstrap-icons.css"; // ← Uncommented

interface ProductFormData {
  name: string;
  category: string;
  brand: string;
  description: string;
  price: string;
  inventory: string;
  material: string;
  origin: string;
  style: string;
  waterResistance: string;
  status: string;
  salesChannels: {
    onlineStore: boolean;
    facebookShop: boolean;
  };
  hasVariations: boolean;
}

interface TabSection {
  id: string;
  label: string;
  ref: React.RefObject<HTMLDivElement | null>;
}

const AddProductForm: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "Minimalist Watch Series 5",
    category: "Watches & Accessories > Men's Watches",
    brand: "Nordic Time",
    description: "",
    price: "149.00",
    inventory: "250",
    material: "",
    origin: "",
    style: "",
    waterResistance: "",
    status: "active",
    salesChannels: {
      onlineStore: true,
      facebookShop: false,
    },
    hasVariations: true,
  });

  // Refs for each section
  const basicInfoRef = useRef<HTMLDivElement>(null);
  const salesPricingRef = useRef<HTMLDivElement>(null);
  const shippingRef = useRef<HTMLDivElement>(null);
  const attributesRef = useRef<HTMLDivElement>(null);

  const tabSections: TabSection[] = [
    { id: "basic-info", label: "Basic Information", ref: basicInfoRef },
    { id: "sales-pricing", label: "Sales & Pricing", ref: salesPricingRef },
    { id: "shipping", label: "Shipping & Delivery", ref: shippingRef },
    { id: "attributes", label: "Attributes & SEO", ref: attributesRef },
  ];

  // Smooth scroll to section with proper header offset
  const scrollToSection = (index: number) => {
    const section = tabSections[index];
    if (section.ref.current) {
      section.ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setCurrentTab(index);
  };

  // IntersectionObserver for scroll-spy (reliable detection)
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    tabSections.forEach((section, index) => {
      if (section.ref.current) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setCurrentTab(index);
            }
          },
          {
            rootMargin: "-140px 0px -50% 0px", // Adjust for sticky header + threshold
            threshold: 0,
          }
        );

        observer.observe(section.ref.current);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name.startsWith("channel-")) {
      const channel = name.replace(
        "channel-",
        ""
      ) as keyof typeof formData.salesChannels;
      setFormData((prev) => ({
        ...prev,
        salesChannels: { ...prev.salesChannels, [channel]: checked },
      }));
    } else if (name === "hasVariations") {
      setFormData((prev) => ({ ...prev, hasVariations: checked }));
    }
  };

  const handleNextStep = () => {
    const nextIndex = Math.min(currentTab + 1, tabSections.length - 1);
    scrollToSection(nextIndex);
  };

  const isLastTab = currentTab === tabSections.length - 1;

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    // Giới hạn tối đa 8 ảnh như yêu cầu
    const updatedList = newFileList.slice(0, 8);
    setFileList(updatedList);

    // Optional: thông báo khi đạt giới hạn
    if (newFileList.length > 8) {
      message.warning("Chỉ được upload tối đa 8 ảnh!");
    }
  };

  // Tùy chỉnh trước khi upload (ở đây ta không upload thật → return false)
  const beforeUpload = () => {
    return false; // Ngăn upload tự động lên server (chúng ta chỉ preview)
  };

  // Xác định ảnh đầu tiên là cover
  const isCover = (index: number) => index === 0;

  return (
    <>
      {/* Add scroll margin to all sections to prevent header overlap */}
      <style jsx>{`
        .scroll-section {
          scroll-margin-top: 140px;
        }
      `}</style>

      <div className="min-vh-100 bg-light">
        {/* Header */}
        <header
          className="sticky-top bg-white border-bottom shadow-sm"
          style={{ zIndex: 15 }}
        >
          <div className="container-fluid px-4 py-3">
            <div className="row align-items-center">
              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <button className="btn btn-link text-secondary p-0">
                    <i className="bi bi-arrow-left fs-4"></i>
                  </button>
                  <div>
                    <h2 className="h4 mb-0 fw-bold">Add New Product</h2>
                    <small className="text-muted d-none d-md-block">
                      Draft auto-saved 2 mins ago
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-8">
                <div className="d-flex justify-content-end align-items-center gap-2">
                  <span className="badge bg-danger-subtle text-danger d-none d-lg-inline-flex align-items-center gap-2">
                    <span
                      className="spinner-grow spinner-grow-sm"
                      role="status"
                    ></span>
                    Step {currentTab + 1} of {tabSections.length}:{" "}
                    {tabSections[currentTab].label}
                  </span>
                  <button className="btn btn-link text-secondary d-none d-md-inline">
                    Discard
                  </button>
                  <button className="btn btn-outline-secondary d-none d-md-inline">
                    Save Draft
                  </button>
                  <button
                    className="btn btn-danger d-flex align-items-center gap-2"
                    onClick={handleNextStep}
                    disabled={isLastTab}
                  >
                    {isLastTab ? "Finish" : "Next Step"}{" "}
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-top">
            <div className="container-fluid px-4">
              <ul className="nav nav-tabs border-0">
                {tabSections.map((tab, index) => (
                  <li className="nav-item" key={index}>
                    <button
                      className={`nav-link border-0 ${
                        currentTab === index
                          ? "active text-danger border-bottom border-danger border-3"
                          : "text-secondary"
                      }`}
                      onClick={() => scrollToSection(index)}
                      style={{ cursor: "pointer" }}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container-fluid px-4 py-4">
          <div className="row g-4">
            {/* Left Column */}
            <div className="col-lg-8">
              {/* SECTION 1: Basic Information */}
              <div
                ref={basicInfoRef}
                id="basic-info"
                className="scroll-section"
              >
                {/* ... Product Details, Specifications giữ nguyên ... */}

                {/* Product Media - Phần được thay thế */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="h5 mb-0 fw-bold">Product Media</h3>
                      <small className="text-muted">
                        Add up to 8 images. First image will be used as cover.
                      </small>
                    </div>
                    <button className="btn btn-link text-danger p-0">
                      Media Guidelines
                    </button>
                  </div>

                  <div className="card-body">
                    <Upload.Dragger
                      name="images"
                      multiple
                      maxCount={8}
                      listType="picture-card" // kiểu hiển thị đẹp cho ảnh
                      fileList={fileList}
                      beforeUpload={beforeUpload}
                      onChange={handleChange}
                      accept="image/*"
                      className="product-media-upload"
                    >
                      {fileList.length >= 8 ? null : (
                        <div className="p-4 text-center">
                          <InboxOutlined
                            style={{ fontSize: 36, color: "#ff4d4f" }}
                          />
                          <p className="mt-2 fw-bold text-danger">
                            Click or drag images here
                          </p>
                          <small className="text-muted">
                            Support JPG, PNG • Max 8 images
                          </small>
                        </div>
                      )}
                    </Upload.Dragger>

                    {/* Hiển thị thông tin thêm nếu cần */}
                    {fileList.length > 0 && (
                      <div className="mt-3 text-muted small">
                        {fileList.length} image{fileList.length > 1 ? "s" : ""}{" "}
                        selected
                      </div>
                    )}
                  </div>
                </div>
                {/* Product Details */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h3 className="h5 mb-0 fw-bold">Product Details</h3>
                    <span className="badge bg-secondary">Required</span>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Product Name <span className="text-danger">*</span>
                          <span className="float-end text-muted small">
                            {formData.name.length}/120
                          </span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g. Minimalist Watch Series 5"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Category <span className="text-danger">*</span>
                        </label>
                        <div className="input-group" onClick={showModal}>
                          <input
                            type="text"
                            className="form-control"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            readOnly
                          />
                          <button className="btn btn-outline-secondary">
                            <i className="bi bi-pencil"></i>
                          </button>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Brand / Manufacturer
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Description
                        </label>
                        <div className="border rounded">
                          <div
                            className="btn-toolbar bg-light border-bottom p-2"
                            role="toolbar"
                          >
                            <div className="btn-group btn-group-sm me-2">
                              <button className="btn btn-outline-secondary">
                                <i className="bi bi-type-bold"></i>
                              </button>
                              <button className="btn btn-outline-secondary">
                                <i className="bi bi-type-italic"></i>
                              </button>
                            </div>
                            <div className="btn-group btn-group-sm me-2">
                              <button className="btn btn-outline-secondary">
                                <i className="bi bi-list-ul"></i>
                              </button>
                              <button className="btn btn-outline-secondary">
                                <i className="bi bi-list-ol"></i>
                              </button>
                            </div>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-secondary">
                                <i className="bi bi-link-45deg"></i>
                              </button>
                              <button className="btn btn-outline-secondary">
                                <i className="bi bi-image"></i>
                              </button>
                            </div>
                          </div>
                          <textarea
                            className="form-control border-0"
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe your product specs, features, and benefits..."
                          ></textarea>
                          <div className="bg-light px-3 py-1 text-end small text-muted border-top">
                            {formData.description.length}/3000
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="card shadow-sm mb-5">
                  <div className="card-header bg-white">
                    <h3 className="h5 mb-0 fw-bold">Detailed Specifications</h3>
                    <small className="text-muted">
                      Fill in attributes to improve search visibility.
                    </small>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {[
                        {
                          name: "material",
                          label: "Material",
                          options: [
                            "Stainless Steel",
                            "Leather",
                            "Gold Plated",
                          ],
                        },
                        {
                          name: "origin",
                          label: "Origin",
                          options: ["Switzerland", "Japan", "China", "USA"],
                        },
                        {
                          name: "style",
                          label: "Style",
                          options: ["Casual", "Formal", "Sport"],
                        },
                        {
                          name: "waterResistance",
                          label: "Water Resistance",
                          options: ["30m", "50m", "100m"],
                        },
                      ].map((field) => (
                        <div className="col-md-6" key={field.name}>
                          <label className="form-label fw-semibold">
                            {field.label}
                          </label>
                          <select
                            className="form-select"
                            name={field.name}
                            value={(formData as any)[field.name]}
                            onChange={handleInputChange}
                          >
                            <option value="">
                              Select {field.label.toLowerCase()}
                            </option>
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                      <div className="col-12">
                        <button className="btn btn-link text-danger p-0">
                          Show more attributes{" "}
                          <i className="bi bi-chevron-down"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ... các section còn lại ... */}

              {/* Optional: CSS bổ sung */}

              {/* SECTION 2: Sales & Pricing */}
              <div
                ref={salesPricingRef}
                id="sales-pricing"
                className="scroll-section mb-5"
              >
                <div className="mb-3">
                  <h2 className="h4 fw-bold text-danger mb-1">
                    <i className="bi bi-2-circle-fill me-2"></i>
                    Sales & Pricing
                  </h2>
                  <p className="text-muted small mb-4">
                    Configure pricing, discounts, and inventory management
                  </p>
                </div>

                <div className="card shadow-sm">
                  <div className="card-body">
                    <h3 className="h5 fw-bold mb-4">Pricing Configuration</h3>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Base Price
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="text"
                            className="form-control"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Compare at Price
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Cost per Item
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="alert alert-danger">
                          <i className="bi bi-info-circle me-2"></i>
                          <small>
                            Customers won't see the cost per item. Use it to
                            calculate profit margins.
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Shipping & Delivery */}
              <div
                ref={shippingRef}
                id="shipping"
                className="scroll-section mb-5"
              >
                <div className="mb-3">
                  <h2 className="h4 fw-bold  mb-1">
                    <i className="bi bi-3-circle-fill me-2"></i>
                    Shipping & Delivery
                  </h2>
                  <p className="text-muted small mb-4">
                    Set shipping options and delivery timeframes
                  </p>
                </div>

                <div className="card shadow-sm">
                  <div className="card-body">
                    <h3 className="h5 fw-bold mb-4">Shipping Information</h3>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Weight</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0.0"
                          />
                          <span className="input-group-text">kg</span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Length</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0"
                          />
                          <span className="input-group-text">cm</span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Width</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0"
                          />
                          <span className="input-group-text">cm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Attributes & SEO */}
              <div
                ref={attributesRef}
                id="attributes"
                className="scroll-section mb-5"
              >
                <div className="mb-3">
                  <h2 className="h4 fw-bold  mb-1">
                    <i className="bi bi-4-circle-fill me-2"></i>
                    Attributes & SEO
                  </h2>
                  <p className="text-muted small mb-4">
                    Optimize your product for search engines
                  </p>
                </div>

                <div className="card shadow-sm">
                  <div className="card-body">
                    <h3 className="h5 fw-bold mb-4">
                      Search Engine Optimization
                    </h3>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Product meta title"
                        />
                        <small className="text-muted">
                          Recommended: 50-60 characters
                        </small>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Meta Description
                        </label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Brief description for search results"
                        ></textarea>
                        <small className="text-muted">
                          Recommended: 150-160 characters
                        </small>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Keywords
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="watch, minimalist, timepiece"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="col-lg-4">
              <div className="" style={{ top: "160px" }}>
                {/* Publishing Status */}
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <h3 className="h6 fw-bold mb-3">Publishing Status</h3>
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded border mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success rounded-circle p-2"></span>
                        <span className="fw-semibold">Active</span>
                      </div>
                      <button className="btn btn-link text-danger p-0 small">
                        Change
                      </button>
                    </div>

                    <div className="mb-2">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-semibold small">
                          Sales Channels
                        </span>
                        <span className="text-muted small">2 Active</span>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="onlineStore"
                          name="channel-onlineStore"
                          checked={formData.salesChannels.onlineStore}
                          onChange={handleCheckboxChange}
                        />
                        <label
                          className="form-check-label w-100"
                          htmlFor="onlineStore"
                        >
                          <div className="fw-semibold">Online Store</div>
                          <small className="text-muted">
                            Schedule availability
                          </small>
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="facebookShop"
                          name="channel-facebookShop"
                          checked={formData.salesChannels.facebookShop}
                          onChange={handleCheckboxChange}
                        />
                        <label
                          className="form-check-label w-100"
                          htmlFor="facebookShop"
                        >
                          <div className="fw-semibold">Facebook Shop</div>
                          <small className="text-muted">Sync pending</small>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Snapshot */}
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="h6 fw-bold mb-0">Pricing Snapshot</h3>
                      <button className="btn btn-link text-danger p-0 small">
                        Full Edit
                      </button>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label small text-muted fw-semibold">
                          Price
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="text"
                            className="form-control fw-bold"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <label className="form-label small text-muted fw-semibold">
                          Inventory
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="inventory"
                          value={formData.inventory}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="alert alert-danger py-2 mb-0">
                      <small className="d-flex gap-2">
                        <i className="bi bi-info-circle"></i>
                        <span>
                          Full pricing, tax, and inventory options are available
                          in the "Sales & Pricing" tab.
                        </span>
                      </small>
                    </div>
                  </div>
                </div>

                {/* Variations */}
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="h6 fw-bold mb-0">Variations</h3>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="hasVariations"
                          name="hasVariations"
                          checked={formData.hasVariations}
                          onChange={handleCheckboxChange}
                        />
                      </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge bg-light text-dark border">
                        Color: Black
                      </span>
                      <span className="badge bg-light text-dark border">
                        Color: Silver
                      </span>
                      <span className="badge bg-light text-dark border">
                        Color: Gold
                      </span>
                      <button className="badge bg-white text-danger border border-danger border-dashed">
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="card shadow-sm mb-4 border-primary">
                  <div className="card-body">
                    <h3 className="h6 fw-bold mb-3">Form Progress</h3>
                    <div className="progress mb-2" style={{ height: "8px" }}>
                      <div
                        className="progress-bar bg-danger"
                        role="progressbar"
                        style={{
                          width: `${
                            ((currentTab + 1) / tabSections.length) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <small className="text-muted">
                      Section {currentTab + 1} of {tabSections.length} completed
                    </small>
                  </div>
                </div>

                {/* Selling Tip */}
                <div className="card shadow-sm border-danger">
                  <div className="card-body bg-danger bg-opacity-10">
                    <div className="d-flex gap-3">
                      <div
                        className="bg-white rounded p-2 shadow-sm"
                        style={{ height: "fit-content" }}
                      >
                        <i className="bi bi-lightbulb text-danger fs-4"></i>
                      </div>
                      <div>
                        <h4 className="h6 fw-bold text-danger mb-1">
                          Selling Tip
                        </h4>
                        <small className="text-danger">
                          Adding a detailed description and at least 3
                          high-quality images increases conversion by up to 24%.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Bottom Bar */}
        <div className="fixed-bottom bg-white border-top p-3 d-md-none">
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary flex-fill">
              Draft
            </button>
            <button
              className="btn btn-danger flex-fill"
              onClick={handleNextStep}
              disabled={isLastTab}
            >
              {isLastTab ? "Finish" : "Next Step"}
            </button>
          </div>
        </div>
      </div>

      <Modal
        title="Basic Modal"
        width={1000}
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-input-border-light dark:border-input-border-dark p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-xl">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-1 focus:ring-primary"
                placeholder="Search for category..."
                type="text"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 h-64 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md overflow-hidden">
              <div className="border-r border-gray-200 dark:border-gray-700 overflow-y-auto custom-scrollbar">
                <div className="p-2 space-y-0.5">
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center group">
                    <span>Women's Fashion</span>
                    <span className="material-symbols-outlined text-gray-400 text-base group-hover:text-gray-600">
                      chevron_right
                    </span>
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm bg-primary/10 text-primary font-medium rounded flex justify-between items-center">
                    <span>Men's Fashion</span>
                    <span className="material-symbols-outlined text-primary text-base">
                      chevron_right
                    </span>
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center group">
                    <span>Electronics</span>
                    <span className="material-symbols-outlined text-gray-400 text-base group-hover:text-gray-600">
                      chevron_right
                    </span>
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center group">
                    <span>Home &amp; Living</span>
                    <span className="material-symbols-outlined text-gray-400 text-base group-hover:text-gray-600">
                      chevron_right
                    </span>
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center group">
                    <span>Beauty &amp; Personal Care</span>
                    <span className="material-symbols-outlined text-gray-400 text-base group-hover:text-gray-600">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
              <div className="border-r border-gray-200 dark:border-gray-700 overflow-y-auto custom-scrollbar">
                <div className="p-2 space-y-0.5">
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center group">
                    <span>Tops</span>
                    <span className="material-symbols-outlined text-gray-400 text-base group-hover:text-gray-600">
                      chevron_right
                    </span>
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm bg-primary/10 text-primary font-medium rounded flex justify-between items-center">
                    <span>Watches</span>
                    <span className="material-symbols-outlined text-primary text-base">
                      chevron_right
                    </span>
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center group">
                    <span>Shoes</span>
                    <span className="material-symbols-outlined text-gray-400 text-base group-hover:text-gray-600">
                      chevron_right
                    </span>
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center group">
                    <span>Accessories</span>
                    <span className="material-symbols-outlined text-gray-400 text-base group-hover:text-gray-600">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto custom-scrollbar">
                <div className="p-2 space-y-0.5">
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span>Analog</span>
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center text-primary font-medium">
                    <span>Digital</span>
                    <span className="material-symbols-outlined text-primary text-base">
                      check
                    </span>
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span>Smart Watch</span>
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span>Chronograph</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
              <span className="font-semibold">Selected:</span>
              <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                Men's Fashion &gt; Watches &gt; Digital
              </span>
            </div>
          </div>
        </div>
      </Modal>
      <style jsx>{`
        /* Khu vực drag & drop chính */
        .ant-upload-drag {
          border: 2px dashed #ff4d4f !important; /* Viền đỏ mặc định */
          background-color: rgba(
            255,
            77,
            79,
            0.05
          ) !important; /* Nền rất nhạt */
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        /* Khi hover */
        .ant-upload-drag:hover {
          border-color: #ff7875 !important; /* Đỏ sáng hơn */
          background-color: rgba(
            255,
            77,
            79,
            0.12
          ) !important; /* Nền đỏ nhạt rõ hơn */
          box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.15); /* Hiệu ứng glow nhẹ */
        }

        /* Khi đang kéo thả file vào (active/drag over) */
        .ant-upload-drag.ant-upload-drag-enter,
        .ant-upload-drag.p-is-dragging {
          border-color: #cf1322 !important; /* Đỏ đậm khi kéo thả */
          background-color: rgba(207, 19, 34, 0.15) !important;
          box-shadow: 0 0 0 4px rgba(207, 19, 34, 0.25);
        }

        /* Icon và text bên trong khi hover */
        .ant-upload-drag:hover .anticon-inbox,
        .ant-upload-drag:hover p {
          color: #ff7875 !important;
        }

        /* Danh sách ảnh đã upload */
        .ant-upload-list-picture-card-container {
          transition: transform 0.2s ease;
        }

        .ant-upload-list-picture-card-container:hover {
          transform: scale(1.04);
        }

        /* Tùy chỉnh nút xóa */
        .ant-upload-list-item-actions .anticon-delete {
          color: #ff4d4f !important;
        }

        .ant-upload-list-item-actions .anticon-delete:hover {
          color: #cf1322 !important;
        }
      `}</style>
    </>
  );
};

export default AddProductForm;
