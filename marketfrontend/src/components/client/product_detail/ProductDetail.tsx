"use client";

import { modelConfig, Product } from "@/data/product/product";
import { API_URL } from "@/helper/api";
import { IProduct } from "@/validators/product";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProductDetail = ({ data }: { data: IProduct }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullUrl = pathname + "?" + searchParams.toString();

  const [selectedVariant, setSelectedVariant] = useState("xanh");
  const [mainImage, setMainImage] = useState(
    data.images[0]?.image_url || "/assets/images/ecommerce/product-1.jpg",
  );
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  // Lấy ảnh hiển thị: ưu tiên ảnh đang hover, sau đó là ảnh chính
  const displayImage = hoveredImage || mainImage;

  console.log("Product Detail Props:", JSON.stringify(data, null, 2));

  return (
    <div className="container my-5">
      <div className="app-content-area">
        <div className="container-fluid">
          <div>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body p-5">
                    <div className="row">
                      {/* Left - Gallery */}
                      <div className="col-xl-6">
                        <div className="product" id="product">
                          <div className="position-relative overflow-hidden rounded border">
                            <Image
                              src={displayImage}
                              alt="Product image"
                              className="img-fluid transition-all"
                              width={600}
                              height={600}
                              priority
                              style={{
                                transition: "all 0.3s ease-in-out",
                              }}
                            />
                          </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="product-tools mt-4">
                          <div
                            className="thumbnails row g-3"
                            id="product-thumbnails"
                          >
                            {data.images.map((pro) => (
                              <div className="col-3" key={pro.id}>
                                <div
                                  className={`thumbnails-img border rounded overflow-hidden cursor-pointer position-relative ${
                                    mainImage === pro.image_url
                                      ? "border-primary border-3"
                                      : ""
                                  }`}
                                  onMouseEnter={() =>
                                    setHoveredImage(pro.image_url)
                                  }
                                  onMouseLeave={() => setHoveredImage(null)}
                                  onClick={() => setMainImage(pro.image_url)}
                                  style={{
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  <Image
                                    src={pro.image_url}
                                    alt={`Thumbnail ${pro.id}`}
                                    className="img-fluid"
                                    width={150}
                                    height={150}
                                    style={{
                                      transition: "transform 0.2s ease",
                                    }}
                                  />
                                  {/* Overlay khi hover */}
                                  <div
                                    className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 opacity-0"
                                    style={{
                                      transition: "opacity 0.2s ease",
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right - Product Info */}
                      <div className="col-xl-6 col-12">
                        <div className="my-5 mx-xl-10">
                          <h3>{data.product_name}</h3>

                          <div className="mb-3">
                            <span className="me-2 text-dark fw-bold">
                              4.4{" "}
                              <i className="bi bi-star-fill text-success"></i>
                            </span>
                            <span>592 Customer Reviews</span>
                          </div>

                          <hr className="my-3" />

                          <div className="mb-5">
                            <h4 className="mb-1">
                              $49.00{" "}
                              <span className="text-muted text-decoration-line-through ms-2">
                                $69.00
                              </span>{" "}
                              <span className="text-warning">(45% OFF)</span>
                            </h4>
                            <small className="text-muted">
                              inclusive of all taxes
                            </small>
                          </div>

                          {/* Color */}
                          <div className="mb-4">
                            <h4 className="mb-3">Phân Loại</h4>

                            <div className="d-flex flex-wrap gap-3">
                              {/* Variant 1 - màu xanh */}
                              <div
                                className={`variant-item text-center position-relative border rounded p-2 ${selectedVariant === "xanh" ? "border-danger border-2" : "border-secondary"}`}
                                onClick={() => setSelectedVariant("xanh")}
                                style={{ width: "110px", cursor: "pointer" }}
                              >
                                <Image
                                  src="/assets/images/ecommerce/product-1.jpg"
                                  alt="Màu xanh"
                                  width={80}
                                  height={80}
                                  className="img-fluid rounded mb-2"
                                />
                                <div className="small fw-medium">màu xanh</div>
                                {selectedVariant === "xanh" && (
                                  <i className="bi bi-check-circle-fill text-danger position-absolute top-0 end-0 m-1"></i>
                                )}
                              </div>

                              {/* Variant 2 - màu xám */}
                              <div
                                className={`variant-item text-center position-relative border rounded p-2 ${selectedVariant === "xam" ? "border-danger border-2" : "border-secondary"}`}
                                onClick={() => setSelectedVariant("xam")}
                                style={{ width: "110px", cursor: "pointer" }}
                              >
                                <Image
                                  src="/assets/images/ecommerce/product-2.jpg"
                                  alt="Màu xám"
                                  width={80}
                                  height={80}
                                  className="img-fluid rounded mb-2"
                                />
                                <div className="small fw-medium">màu xám</div>
                                {selectedVariant === "xam" && (
                                  <i className="bi bi-check-circle-fill text-danger position-absolute top-0 end-0 m-1"></i>
                                )}
                              </div>

                              {data.variants?.map((variant) => (
                                <div
                                  key={variant.id}
                                  className={`variant-item text-center position-relative border rounded p-2 ${selectedVariant === variant.name ? "border-danger border-2" : "border-secondary"}`}
                                  onClick={() =>
                                    setSelectedVariant(
                                      variant.sku
                                        .toString()
                                        .trim()
                                        .toLowerCase(),
                                    )
                                  }
                                  style={{ width: "110px", cursor: "pointer" }}
                                >
                                  <Image
                                    src={
                                      variant.image_url ||
                                      "/assets/images/ecommerce/product-1.jpg"
                                    }
                                    alt={variant.name}
                                    width={80}
                                    height={80}
                                    className="img-fluid rounded mb-2"
                                  />
                                  <div className="small fw-medium">
                                    {variant.sku}
                                  </div>
                                  {selectedVariant ===
                                    variant.sku
                                      .toString()
                                      .trim()
                                      .toLowerCase() && (
                                    <i className="bi bi-check-circle-fill text-danger position-absolute top-0 end-0 m-1"></i>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Buttons */}
                          <div className="row g-3">
                            <div className="col-md-6">
                              <button className="btn btn-danger w-100">
                                <i className="bi bi-cart me-2"></i>Add To Cart
                              </button>
                            </div>
                            <div className="col-md-6">
                              <button className="btn btn-outline-secondary w-100">
                                <i className="bi bi-heart me-2"></i>Wishlist
                              </button>
                            </div>
                          </div>

                          <hr className="mt-4 mb-2" />

                          {/* Accordion */}
                          <div className="accordion" id="ecommerceAccordion">
                            <div className="accordion-item">
                              <h2 className="accordion-header">
                                <button
                                  className="accordion-button"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#productDetails"
                                  aria-expanded="true"
                                >
                                  Product Details
                                </button>
                              </h2>
                              <div
                                id="productDetails"
                                className="accordion-collapse collapse show"
                                data-bs-parent="#ecommerceAccordion"
                              >
                                <div className="accordion-body">
                                  <p>
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit...
                                  </p>
                                  <h5>Features:</h5>
                                  <ul>
                                    <li>Lorem ipsum dolor sit amet...</li>
                                    <li>Integer ut justo quis diam...</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="accordion-item">
                              <h2 className="accordion-header">
                                <button
                                  className="accordion-button collapsed"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#specifications"
                                >
                                  Specifications
                                </button>
                              </h2>
                              <div
                                id="specifications"
                                className="accordion-collapse collapse"
                                data-bs-parent="#ecommerceAccordion"
                              >
                                <div className="accordion-body">
                                  <table className="table table-striped">
                                    <tbody>
                                      <tr>
                                        <th className="w-25">Sport</th>
                                        <td>Running</td>
                                      </tr>
                                      <tr>
                                        <th>Material</th>
                                        <td>Mesh</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Ratings & Reviews */}
                          <div className="mt-5">
                            <h3 className="mb-4">Ratings & Reviews</h3>

                            <div className="row align-items-center mb-4">
                              <div className="col-md-4 text-center mb-4 mb-md-0">
                                <h2 className="display-3 fw-bold">4.5</h2>
                                <div className="text-success">
                                  <i className="bi bi-star-fill"></i>
                                  <i className="bi bi-star-fill"></i>
                                  <i className="bi bi-star-fill"></i>
                                  <i className="bi bi-star-fill"></i>
                                  <i className="bi bi-star-fill"></i>
                                </div>
                                <p className="mb-0">595 Verified Buyers</p>
                              </div>

                              <div className="col-md-8">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="text-nowrap me-3 text-muted">
                                    5 <i className="bi bi-star-fill ms-1"></i>
                                  </div>
                                  <div
                                    className="progress w-100"
                                    style={{ height: "6px" }}
                                  >
                                    <div
                                      className="progress-bar bg-success"
                                      role="progressbar"
                                      style={{ width: "60%" }}
                                      aria-valuenow={60}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                    ></div>
                                  </div>
                                  <span className="text-muted ms-3">420</span>
                                </div>
                              </div>
                            </div>

                            {/* Sample Reviews */}
                            <div className="border-top py-4">
                              <span className="badge bg-light text-dark border px-3 py-2 rounded-pill mb-2">
                                4.4{" "}
                                <i className="bi bi-star-fill text-success"></i>
                              </span>
                              <p>
                                It's awesome, I never thought about Dash UI that
                                awesome shoes...
                              </p>
                              <div className="text-muted small">
                                James Ennis{" "}
                                <span className="ms-3">28 Nov 2023</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .thumbnails-img:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .thumbnails-img:hover .bg-dark {
          opacity: 1 !important;
        }

        .thumbnails-img img:hover {
          transform: scale(1.1);
        }

        .variant-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
