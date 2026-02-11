// app/products/[slug]/page.tsx
"use client";
import React from "react";
import Image from "next/image";

export default function ProductDetailPage() {
  const [selectedVariant, setSelectedVariant] = React.useState("xanh");
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
                          <div>
                            <Image
                              src="/assets/images/ecommerce/product-1.jpg"
                              alt="Product image 1"
                              className="img-fluid"
                              width={600}
                              height={600}
                              priority
                            />
                          </div>
                          {/* Bạn có thể thêm các div khác cho carousel nếu muốn */}
                        </div>

                        {/* Thumbnails */}
                        <div className="product-tools mt-4">
                          <div
                            className="thumbnails row g-3"
                            id="product-thumbnails"
                          >
                            {[1, 2, 3, 4].map((num) => (
                              <div className="col-3" key={num}>
                                <div className="thumbnails-img border rounded overflow-hidden">
                                  <Image
                                    src={`/assets/images/ecommerce/product-${num}.jpg`}
                                    alt={`Thumbnail ${num}`}
                                    className="img-fluid"
                                    width={150}
                                    height={150}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right - Product Info */}
                      <div className="col-xl-6 col-12">
                        <div className="my-5 mx-xl-10">
                          <h3>Product Title Name</h3>

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
                                className={`variant-item text-center cursor-pointer border rounded p-2 ${selectedVariant === "xanh" ? "border-danger border-2" : "border-secondary"}`}
                                onClick={() => setSelectedVariant("xanh")}
                                style={{ width: "110px" }}
                              >
                                <Image
                                  src="/assets/images/ecommerce/product-1.jpg" // thay bằng ảnh thực của màu xanh
                                  alt="Màu xanh"
                                  width={80}
                                  height={80}
                                  className="img-fluid rounded mb-2"
                                />
                                <div className="small fw-medium">màu xanh</div>
                                {/* Nếu muốn thêm icon check khi chọn */}
                                {selectedVariant === "xanh" && (
                                  <i className="bi bi-check-circle-fill text-danger position-absolute top-0 end-0 m-1"></i>
                                )}
                              </div>

                              {/* Variant 2 - màu xám */}
                              <div
                                className={`variant-item text-center cursor-pointer border rounded p-2 ${selectedVariant === "xam" ? "border-danger border-2" : "border-secondary"}`}
                                onClick={() => setSelectedVariant("xam")}
                                style={{ width: "110px" }}
                              >
                                <Image
                                  src="/assets/images/ecommerce/product-2.jpg" // thay bằng ảnh thực của màu xám
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

                              {/* Thêm variant khác nếu có */}
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
                                    {/* Thêm các mục khác */}
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
                                      {/* Thêm các spec khác */}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>

                            {/* Thêm Free Shipping Policy, Refund Policy tương tự */}
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
                                {/* Progress bars giữ nguyên class Bootstrap */}
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
                                {/* Copy các progress bar khác tương tự */}
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

                            {/* Thêm review khác tương tự */}
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
  );
}
