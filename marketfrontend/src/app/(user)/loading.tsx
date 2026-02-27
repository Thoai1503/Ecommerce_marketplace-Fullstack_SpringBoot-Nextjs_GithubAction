"use client";

export default function Loading() {
  return (
    <div className="container-fluid px-lg-5 py-4">
      {/* Hero Banner Skeleton */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className="skeleton rounded"
            style={{ height: "400px", width: "100%" }}
          />
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="row mb-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="col-6 col-md-3 col-lg-1-5 mb-3">
            <div className="text-center">
              <div
                className="skeleton rounded-circle mx-auto mb-2"
                style={{ width: "60px", height: "60px" }}
              />
              <div
                className="skeleton rounded mx-auto"
                style={{ height: "16px", width: "80px" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Flash Sale Skeleton */}
      <div className="mb-4">
        <div
          className="skeleton rounded mb-3"
          style={{ height: "40px", width: "200px" }}
        />
        <div className="row">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="col-6 col-md-4 col-lg-2 mb-3">
              <div className="card">
                <div className="skeleton" style={{ height: "180px" }} />
                <div className="card-body">
                  <div
                    className="skeleton rounded mb-2"
                    style={{ height: "20px" }}
                  />
                  <div
                    className="skeleton rounded mb-2"
                    style={{ height: "16px", width: "60%" }}
                  />
                  <div
                    className="skeleton rounded"
                    style={{ height: "16px", width: "40%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="mb-4">
        <div
          className="skeleton rounded mb-3"
          style={{ height: "32px", width: "150px" }}
        />
        <div className="row">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="col-6 col-md-4 col-lg-2 mb-3">
              <div className="card">
                <div className="skeleton" style={{ height: "180px" }} />
                <div className="card-body">
                  <div
                    className="skeleton rounded mb-2"
                    style={{ height: "18px" }}
                  />
                  <div
                    className="skeleton rounded mb-2"
                    style={{ height: "16px", width: "70%" }}
                  />
                  <div className="d-flex justify-content-between">
                    <div
                      className="skeleton rounded"
                      style={{ height: "20px", width: "45%" }}
                    />
                    <div
                      className="skeleton rounded"
                      style={{ height: "16px", width: "30%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
