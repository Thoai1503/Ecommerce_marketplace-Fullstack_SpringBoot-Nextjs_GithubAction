import React from "react";

const loading = () => {
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
                      {/* Left - Gallery Skeleton */}
                      <div className="col-xl-6">
                        <div className="product" id="product">
                          {/* Main Image Skeleton */}
                          <div
                            className="skeleton rounded mb-4"
                            style={{ height: "400px", width: "100%" }}
                          />
                        </div>

                        {/* Thumbnails Skeleton */}
                        <div className="product-tools mt-4">
                          <div
                            className="thumbnails row g-3"
                            id="product-thumbnails"
                          >
                            {[1, 2, 3, 4].map((num) => (
                              <div className="col-3" key={num}>
                                <div className="thumbnails-img border rounded overflow-hidden">
                                  <div
                                    className="skeleton rounded"
                                    style={{ height: "100px", width: "100%" }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right - Product Info Skeleton */}
                      <div className="col-xl-6 col-12">
                        <div className="my-5 mx-xl-10">
                          {/* Product Title Skeleton */}
                          <div className="skeleton-title mb-3" />

                          {/* Rating Skeleton */}
                          <div className="mb-3 d-flex align-items-center">
                            <div
                              className="skeleton rounded me-2"
                              style={{ width: "60px", height: "20px" }}
                            />
                            <div
                              className="skeleton rounded"
                              style={{ width: "120px", height: "16px" }}
                            />
                          </div>

                          <hr className="my-3" />

                          {/* Price Skeleton */}
                          <div className="mb-5">
                            <div
                              className="skeleton rounded mb-2"
                              style={{ width: "150px", height: "28px" }}
                            />
                            <div
                              className="skeleton rounded"
                              style={{ width: "100px", height: "14px" }}
                            />
                          </div>

                          {/* Variants Skeleton */}
                          <div className="mb-4">
                            <div
                              className="skeleton rounded mb-3"
                              style={{ width: "80px", height: "20px" }}
                            />
                            <div className="d-flex flex-wrap gap-3">
                              {[1, 2].map((num) => (
                                <div
                                  key={num}
                                  className="border rounded p-2"
                                  style={{ width: "110px" }}
                                >
                                  <div
                                    className="skeleton rounded mb-2"
                                    style={{ height: "80px", width: "80px" }}
                                  />
                                  <div
                                    className="skeleton rounded mx-auto"
                                    style={{ width: "60px", height: "12px" }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Buttons Skeleton */}
                          <div className="row g-3 mb-4">
                            <div className="col-md-6">
                              <div className="skeleton-button w-100" />
                            </div>
                            <div className="col-md-6">
                              <div className="skeleton-button w-100" />
                            </div>
                          </div>

                          <hr className="mt-4 mb-2" />

                          {/* Accordion Skeleton */}
                          <div className="accordion" id="ecommerceAccordion">
                            <div className="accordion-item">
                              <div
                                className="skeleton rounded mb-2"
                                style={{ width: "150px", height: "20px" }}
                              />
                              <div
                                className="skeleton rounded mb-1"
                                style={{ width: "100%", height: "14px" }}
                              />
                              <div
                                className="skeleton rounded mb-1"
                                style={{ width: "90%", height: "14px" }}
                              />
                              <div
                                className="skeleton rounded"
                                style={{ width: "80%", height: "14px" }}
                              />
                            </div>

                            <div className="accordion-item mt-3">
                              <div
                                className="skeleton rounded mb-2"
                                style={{ width: "120px", height: "20px" }}
                              />
                              <div
                                className="skeleton rounded mb-1"
                                style={{ width: "100%", height: "14px" }}
                              />
                              <div
                                className="skeleton rounded"
                                style={{ width: "85%", height: "14px" }}
                              />
                            </div>
                          </div>

                          {/* Ratings & Reviews Skeleton */}
                          <div className="mt-5">
                            <div
                              className="skeleton rounded mb-4"
                              style={{ width: "180px", height: "24px" }}
                            />

                            <div className="row align-items-center mb-4">
                              <div className="col-md-4 text-center mb-4 mb-md-0">
                                <div
                                  className="skeleton rounded mb-2 mx-auto"
                                  style={{ width: "60px", height: "40px" }}
                                />
                                <div className="d-flex justify-content-center mb-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <div
                                      key={star}
                                      className="skeleton rounded me-1"
                                      style={{ width: "16px", height: "16px" }}
                                    />
                                  ))}
                                </div>
                                <div
                                  className="skeleton rounded mx-auto"
                                  style={{ width: "100px", height: "14px" }}
                                />
                              </div>

                              <div className="col-md-8">
                                {[1, 2, 3, 4, 5].map((bar) => (
                                  <div
                                    key={bar}
                                    className="d-flex align-items-center mb-2"
                                  >
                                    <div
                                      className="skeleton rounded me-3"
                                      style={{ width: "30px", height: "14px" }}
                                    />
                                    <div
                                      className="skeleton rounded flex-grow-1 me-3"
                                      style={{ height: "6px" }}
                                    />
                                    <div
                                      className="skeleton rounded"
                                      style={{ width: "25px", height: "14px" }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Sample Review Skeleton */}
                            <div className="border-top py-4">
                              <div
                                className="skeleton rounded mb-2"
                                style={{ width: "50px", height: "20px" }}
                              />
                              <div
                                className="skeleton rounded mb-1"
                                style={{ width: "100%", height: "14px" }}
                              />
                              <div
                                className="skeleton rounded mb-1"
                                style={{ width: "90%", height: "14px" }}
                              />
                              <div
                                className="skeleton rounded"
                                style={{ width: "70%", height: "14px" }}
                              />
                              <div
                                className="skeleton rounded mt-2"
                                style={{ width: "120px", height: "12px" }}
                              />
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
  );
};

export default loading;
