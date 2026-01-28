// app/products/[slug]/page.tsx
import React from "react";
import Image from "next/image";

export default function ProductDetailPage() {
  return (
    <div className="app-content-area">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 col-md-12 col-12">
            {/* Page header */}
            <div className="mb-5">
              <h3 className="mb-0">Products Details</h3>
            </div>
          </div>
        </div>

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
                        <div className="thumbnails row g-3" id="product-thumbnails">
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
                        <h1>Product Title Name</h1>

                        <div className="mb-3">
                          <span className="me-2 text-dark fw-bold">
                            4.4 <i className="bi bi-star-fill text-success"></i>
                          </span>
                          <span>592 Customer Reviews</span>
                        </div>

                        <hr className="my-3" />

                        <div className="mb-5">
                          <h4 className="mb-1">
                            $49.00{" "}
                            <span className="text-muted text-decoration-line-through ms-2">$69.00</span>{" "}
                            <span className="text-warning">(45% OFF)</span>
                          </h4>
                          <small className="text-muted">inclusive of all taxes</small>
                        </div>

                        {/* Color */}
                        <div className="mb-4 d-md-flex justify-content-between align-items-center">
                          <h4 className="mb-2 mb-md-0">Color</h4>
                          <div className="btn-group" role="group" aria-label="Color selection">
                            <input type="radio" className="btn-check" name="color" id="color1" defaultChecked />
                            <label
                              className="btn btn-primary rounded-circle me-2 btn-icon btn-sm border border-2 border-white shadow"
                              htmlFor="color1"
                            >
                              <i className="bi bi-check icon-xs"></i>
                            </label>

                            <input type="radio" className="btn-check" name="color" id="color2" />
                            <label
                              className="btn btn-success rounded-circle me-2 btn-icon btn-sm border border-2 border-white shadow"
                              htmlFor="color2"
                            >
                              <i className="bi bi-check icon-xs"></i>
                            </label>

                            {/* Thêm danger, info, warning, dark tương tự nếu cần */}
                          </div>
                        </div>

                        {/* Size */}
                        <div className="mb-5 d-md-flex justify-content-between align-items-center">
                          <h4 className="mb-2 mb-md-0">Select Size</h4>
                          <div className="btn-group" role="group" aria-label="Size selection">
                            {[6, 7, 8, 9, 10, 11].map((size) => (
                              <React.Fragment key={size}>
                                <input
                                  type="radio"
                                  className="btn-check"
                                  name="size"
                                  id={`size${size}`}
                                  defaultChecked={size === 6}
                                />
                                <label
                                  className="btn btn-outline-secondary border rounded-circle me-2 text-muted btn-icon btn-md"
                                  htmlFor={`size${size}`}
                                >
                                  {size}
                                </label>
                              </React.Fragment>
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
                            <div id="productDetails" className="accordion-collapse collapse show" data-bs-parent="#ecommerceAccordion">
                              <div className="accordion-body">
                                <p>
                                  Lorem ipsum dolor sit amet, consectetur adipiscing elit...
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
                            <div id="specifications" className="accordion-collapse collapse" data-bs-parent="#ecommerceAccordion">
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
                                <div className="progress w-100" style={{ height: "6px" }}>
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
                              4.4 <i className="bi bi-star-fill text-success"></i>
                            </span>
                            <p>It's awesome, I never thought about Dash UI that awesome shoes...</p>
                            <div className="text-muted small">
                              James Ennis <span className="ms-3">28 Nov 2023</span>
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
  );
}