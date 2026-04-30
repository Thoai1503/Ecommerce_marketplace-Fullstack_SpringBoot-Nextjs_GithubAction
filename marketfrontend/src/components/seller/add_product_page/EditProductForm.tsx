"use client";
import CategorySelectorModal from "@/feature/seller/components/CategorySelectorModal";
import { useAddImageSeller, useAddProductSeller } from "@/feature/seller/hooks";
import { fetchProduct } from "@/feature/seller/reducer/productEditReducer";
import { AppDispatch, RootState } from "@/lib/store";
import { InboxOutlined } from "@ant-design/icons";
import { Editor } from "@tinymce/tinymce-react";
import { message, Upload } from "antd";
import React, { use, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API_URL, UPLOAD_API_URL } from "@/helper/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Product,
  useUpdateProductMutation,
} from "@/types/data/product/Product";
import { IProduct } from "@/validators/product";
import { useUpdateProductVariantMutation } from "@/types/data/product/ProductVariant";
import { IProductVariant } from "@/validators/productVariant";
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

const EditProductForm = ({ id }: { id: number | null }) => {
  Product.setup({ path: "/product", baseUrl: API_URL });
  const { data: productData } = useQuery(Product.getById(id || 0));
  console.log("product data: " + JSON.stringify(productData));

  //const product = useSelector((state: RootState) => state.productForm.product);
  const [product, setProducts] = useState<IProduct | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const editorRef = useRef<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fileList, handleChange, handleSave, handleSaveImageAfterProduct } =
    useAddImageSeller(id || undefined);
  const { mutate: updateProductVariant } = useUpdateProductVariantMutation();
  const [currentTab, setCurrentTab] = useState<number>(0);
  const { mutate: updateProduct } = useUpdateProductMutation();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
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
          },
        );

        observer.observe(section.ref.current);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);
  // useEffect(() => {
  //   if (id !== null && id !== undefined) {
  //     dispatch(fetchProduct(id));
  //   }
  // }, []);
  useEffect(() => {
    if (productData) {
      setProducts(productData);
    }
  }, [productData]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    // setFormData((prev) => ({ ...prev, [name]: value }));
    setProducts((pre: any) => ({ ...pre, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name.startsWith("channel-")) {
      const channel = name.replace(
        "channel-",
        "",
      ) as keyof typeof formData.salesChannels;
      setFormData((prev) => ({
        ...prev,
        salesChannels: { ...prev.salesChannels, [channel]: checked },
      }));
    } else if (name === "hasVariations") {
      setFormData((prev) => ({ ...prev, hasVariations: checked }));
    }
  };

  const isLastTab = currentTab === tabSections.length - 1;

  // Tùy chỉnh trước khi upload (ở đây ta không upload thật → return false)
  const beforeUpload = () => {
    return false; // Ngăn upload tự động lên server (chúng ta chỉ preview)
  };

  // Handle Save

  // Handle Cancel/Discard
  const handleDiscard = () => {
    if (confirm("Bạn có chắc muốn hủy bỏ? Các thay đổi sẽ không được lưu.")) {
      // Reset form hoặc navigate back
      console.log("Discarding changes...");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = () => {
    //  alert("Submit form with data: " + JSON.stringify(product));
    // alert(
    //   "Variant list: " +
    //     JSON.stringify(product?.variants) +
    //     "\n\n" +
    //     "Variant length: " +
    //     product?.variants?.length,
    // );
    updateProduct(
      {
        id: id || 0,
        updatedData: product!,
      },
      {
        onSuccess: (data) => {
          alert("Product updated successfully: " + JSON.stringify(data));
          if (product?.variants && product?.variants?.length < 2) {
            message.success("Product updated successfully!");
            alert(JSON.stringify(product.variants[0]));
            const variantData: IProductVariant = {
              id: product.variants[0].id,
              price: data.price,
              sku: product.variants[0].sku,
              product_id: data.id,
              image_url: product.variants[0].image_url,
              variant_name: data.product_name,
              stock_quantity: data.stock_quantity,
              weight: data.weight,
              length: data.length,
              width: data.width,

              height: data.height,
            };

            updateProductVariant(variantData, {
              onSuccess: (variantData) => {
                alert(
                  "Variant updated successfully: " +
                    JSON.stringify(variantData),
                );
              },
              onError: (error) => {
                message.error(
                  "Failed to update variant: " + JSON.stringify(error.message),
                );
              },
            });
          } else {
            message.success(
              "Product updated successfully! Please proceed to update variant details.",
            );
          }
        },
        onError: (error) => {
          message.error("Failed to update product: " + JSON.stringify(error));
        },
      },
    );
  };

  const {
    //  product,
    handleChangeProduct,
    handleSubmitProduct,
    categories,
    setProduct,
    shop,
  } = useAddProductSeller((id: number) => {
    handleSaveImageAfterProduct(id);
  });

  return (
    <>
      <style jsx>{`
        .scroll-section {
          scroll-margin-top: 140px;
        }

        /* Sticky Action Bar - Desktop */
        .sticky-action-bar {
          position: sticky;
          top: 160px;
          z-index: 10;
          background: white;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .sticky-action-bar:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        /* Mobile Bottom Bar - Updated */
        .mobile-bottom-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 12px 16px;
          backdrop-filter: blur(20px);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 768px) {
          .mobile-bottom-bar,
          .desktop-sticky-bar {
            display: flex;
          }
        }

        @media (max-width: 767.98px) {
          .desktop-sticky-bar {
            display: none;
          }
        }

        /* Action buttons styling */
        .action-save {
          background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
          border: none;
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);
        }

        .action-save:hover:not(:disabled) {
          background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(255, 77, 79, 0.4);
          color: white;
        }

        .action-cancel {
          background: #f8f9fa;
          border: 2px solid #e5e7eb;
          color: #6b7280;
          font-weight: 500;
          padding: 12px 24px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .action-cancel:hover {
          background: #f1f5f9;
          border-color: #d1d5db;
          color: #374151;
          transform: translateY(-1px);
        }

        /* Progress indicator in sticky bar */
        .sticky-progress {
          height: 4px;
          background: #f3f4f6;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .sticky-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #ff4d4f, #ff7875);
          transition: width 0.4s ease;
          border-radius: 2px;
        }

        /* Status badge */
        .status-badge {
          min-width: 120px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
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
                    <h2 className="h4 mb-0 fw-bold">Edit Product ID: {id}</h2>
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
                    Preview
                  </button>
                  <button className="btn btn-outline-secondary d-none d-md-inline">
                    Save Draft
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
                {/* Product Media - Phần upload ảnh */}
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
                      listType="picture-card"
                      fileList={fileList}
                      beforeUpload={beforeUpload}
                      onChange={handleChange}
                      className="product-media-upload w-100"
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

                    {fileList.length > 0 && (
                      <div className="mt-3 text-muted small d-flex align-items-center gap-2">
                        <i className="bi bi-check-circle-fill text-success"></i>
                        {fileList.length} image
                        {fileList.length > 1 ? "s" : ""} selected • First image
                        is cover photo
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
                            {product?.product_name.length}/120
                          </span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="product_name"
                          value={product?.product_name}
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
                            name="category_id"
                            value={product?.product_name}
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
                        {/* <div className="border rounded">
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
                              </div> */}
                        <Editor
                          apiKey="opbl478qvvrtoorhvqc4f7zei61txljv0gkj67k1ogzky57n" // có thể để trống khi test local
                          initialValue="<p>Soạn thảo với upload ảnh...</p>"
                          init={{
                            height: 300,
                            menubar: true,
                            plugins: "image media link code",
                            toolbar:
                              "undo redo | bold italic | alignleft aligncenter alignright | image media link code",

                            // URL API backend để nhận file upload
                            images_upload_url: `${UPLOAD_API_URL}/upload`,

                            // Custom handler nếu muốn tự điều khiển upload
                            images_upload_handler: async (
                              blobInfo: any,
                              success: any,
                              failure: any,
                            ) => {
                              try {
                                const formData = new FormData();
                                formData.append(
                                  "file",
                                  blobInfo.blob(),
                                  blobInfo.filename(),
                                );

                                console.log(
                                  "form data: " + JSON.stringify(formData),
                                );
                                const response = await fetch(
                                  `${UPLOAD_API_URL}/upload`,
                                  {
                                    method: "POST",
                                    body: formData,
                                  },
                                );

                                const json = await response.json();
                                // giả sử backend trả về { url: "https://files.example.com/uploads/abc.png" }
                                const imageUrl = json.url;

                                // TinyMCE yêu cầu success(URL string)
                                success(imageUrl);

                                // Nếu muốn tự động chèn vào content luôn:
                                editorRef.current?.insertContent(
                                  `<img src="${imageUrl}" alt="${blobInfo.filename()}" />`,
                                );
                              } catch (err: any) {
                                failure("Upload thất bại: " + err.message);
                              }
                            },
                          }}
                          onEditorChange={(newContent) => {
                            // setContent(newContent)
                            setProduct((pre: any) => ({
                              ...pre,
                              description: newContent,
                            }));
                            console.log(newContent);
                          }}
                        />
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
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">
                          Base Price
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="text"
                            className="form-control"
                            name="price"
                            value={product?.price}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">
                          Inventory
                        </label>
                        <div className="input-group">
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            name="stock_quantity"
                            value={product?.stock_quantity ?? ""}
                            onChange={handleInputChange}
                            placeholder="0"
                          />
                          <span className="input-group-text">pcs</span>
                        </div>
                      </div>
                      <div className="col-md-3">
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
                      <div className="col-md-3">
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
                  <h2 className="h4 fw-bold mb-1">
                    <i className="bi bi-3-circle-fill me-2 text-primary"></i>
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
                      <div className="col-md-6 col-lg-3">
                        <label className="form-label fw-semibold">Weight</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0.0"
                            value={product?.weight ?? ""}
                            name="weight"
                            onChange={handleInputChange}
                          />

                          <span className="input-group-text">g</span>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <label className="form-label fw-semibold">Length</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0"
                            name="length"
                            value={product?.length ?? ""}
                            onChange={handleInputChange}
                          />
                          <span className="input-group-text">cm</span>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <label className="form-label fw-semibold">Width</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0"
                            name="width"
                            value={product?.width ?? ""}
                            onChange={handleInputChange}
                          />
                          <span className="input-group-text">cm</span>
                        </div>
                      </div>

                      <div className="col-md-6 col-lg-3">
                        <label className="form-label fw-semibold">Height</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0"
                            name="height"
                            value={product?.height ?? ""}
                            onChange={handleInputChange}
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
                  <h2 className="h4 fw-bold mb-1">
                    <i className="bi bi-4-circle-fill me-2 text-success"></i>
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
              <div className="" style={{ top: "180px" }}>
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
                        <div className="input-group input-group-sm">
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
                          className="form-control input-group-sm"
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
                      <div className="form-check form-switch form-switch-sm">
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
                <div className="card shadow-sm mb-4 border-danger">
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

          {/* DESKTOP: Sticky Action Bar */}
          <div className="desktop-sticky-bar sticky-action-bar d-none d-lg-block container-fluid px-4 py-3 sticky-bottom">
            <div className="sticky-progress">
              <div
                className="sticky-progress-bar"
                style={{
                  width: `${((currentTab + 1) / tabSections.length) * 100}%`,
                }}
              ></div>
            </div>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3 flex-grow-1">
                <span className="status-badge bg-light text-danger border border-danger">
                  <i className="bi bi-info-circle"></i>
                  {isLastTab
                    ? "Ready to publish"
                    : `Step ${currentTab + 1}/${tabSections.length}`}
                </span>
                <small className="text-muted d-none d-xl-inline">
                  Auto-save enabled • Last saved 30s ago
                </small>
              </div>
              <div className="d-flex gap-2">
                <button className="action-cancel" onClick={handleDiscard}>
                  <i className="bi bi-x-lg me-1"></i>
                  Cancel
                </button>
                <button className="action-save" onClick={handleSubmit}>
                  <i className="bi bi-check-lg me-1"></i>
                  {isLastTab ? "Publish Product" : "Save & Continue"}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* MOBILE: Enhanced Bottom Action Bar */}
        <div className="mobile-bottom-bar d-lg-none">
          <div className="container-fluid px-3">
            <div className="row align-items-center g-2">
              <div className="col-8">
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <div
                    className="progress flex-grow-1"
                    style={{ height: "3px" }}
                  >
                    <div
                      className="progress-bar bg-danger"
                      style={{
                        width: `${((currentTab + 1) / tabSections.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="badge bg-danger-subtle text-danger px-2 py-1">
                    {currentTab + 1}/{tabSections.length}
                  </span>
                </div>
              </div>
              <div className="col-4 text-end">
                <div className="btn-group w-100" role="group">
                  <button
                    className="btn btn-outline-secondary btn-sm flex-fill action-cancel"
                    onClick={handleDiscard}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                  <button
                    className="btn btn-danger btn-sm flex-fill action-save"
                    onClick={handleSave}
                  >
                    <i
                      className={`bi ${isLastTab ? "bi-check2" : "bi-arrow-right"}`}
                    ></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="text-center mt-2 text-muted small">
              {isLastTab ? "Tap Publish to go live" : "Save to continue"}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        /* Upload Dragger - Red Theme Enhanced */
        .ant-upload.ant-upload-drag {
          border: 2px dashed #ff4d4f !important;
          background: linear-gradient(
            135deg,
            rgba(255, 77, 79, 0.05) 0%,
            rgba(255, 77, 79, 0.02) 100%
          ) !important;
          border-radius: 12px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ant-upload.ant-upload-drag:hover {
          border-color: #ff7875 !important;
          background: linear-gradient(
            135deg,
            rgba(255, 120, 117, 0.12) 0%,
            rgba(255, 77, 79, 0.08) 100%
          ) !important;
          box-shadow:
            0 8px 25px rgba(255, 77, 79, 0.15),
            0 0 0 4px rgba(255, 77, 79, 0.1) !important;
          transform: translateY(-2px);
        }

        .ant-upload.ant-upload-drag.ant-upload-drag-hover,
        .ant-upload.ant-upload-drag.ant-upload-drag-enter-active {
          border-color: #ff4d4f !important;
          background: linear-gradient(
            135deg,
            rgba(255, 77, 79, 0.15) 0%,
            rgba(255, 77, 79, 0.1) 100%
          ) !important;
          box-shadow:
            0 12px 40px rgba(255, 77, 79, 0.25),
            0 0 0 6px rgba(255, 77, 79, 0.2) !important;
          transform: scale(1.02);
        }

        .ant-upload-drag-container:hover .anticon-inbox,
        .ant-upload-drag-container:hover p {
          color: #ff7875 !important;
        }

        /* Thumbnail hover effects */
        .ant-upload-list-picture-card-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border-radius: 10px !important;
        }

        .ant-upload-list-picture-card-container:hover {
          transform: translateY(-4px) scale(1.05) !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
          z-index: 10;
        }

        /* Delete button */
        .ant-upload-list-item-actions .anticon-delete {
          color: #ff4d4f !important;
          font-size: 16px !important;
        }

        .ant-upload-list-item-actions .anticon-delete:hover {
          color: #cf1322 !important;
          background: rgba(255, 77, 79, 0.1) !important;
          border-radius: 50% !important;
        }

        /* Picture card cover */
        .ant-upload-list-item-picture-card:first-child
          .ant-upload-list-item-thumbnail
          img {
          border: 3px solid #ff4d4f !important;
          border-radius: 10px !important;
        }

        /* Custom scrollbar for category modal */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #fca5a5;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #f87171;
        }

        /* Snap scroll effect */
        .snap-x > * {
          scroll-snap-align: start;
        }

        /* Hover effect cho columns */
        .flex-none:hover {
          transform: scale(1.02);
          z-index: 10;
        }
      `}</style>
      <CategorySelectorModal
        categories={categories}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setProduct={setProduct}
      />
    </>
  );
};

export default EditProductForm;
