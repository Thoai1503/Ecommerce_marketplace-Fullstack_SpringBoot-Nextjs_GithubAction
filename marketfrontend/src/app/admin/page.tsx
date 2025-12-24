import React from "react";

const DashBoardPage = () => {
  const statsCards = [
    {
      title: "Tổng doanh thu",
      value: "150.000.000 ₫",
      change: "+12%",
      icon: "💳",
      color: "primary",
      positive: true,
    },
    {
      title: "Tổng đơn hàng",
      value: "1,240",
      change: "+5%",
      icon: "🛒",
      color: "warning",
      positive: true,
    },
    {
      title: "Khách hàng mới",
      value: "350",
      change: "+8%",
      icon: "👤",
      color: "info",
      positive: true,
    },
    {
      title: "Sản phẩm hoạt động",
      value: "420",
      change: "-2%",
      icon: "✓",
      color: "success",
      positive: false,
    },
  ];

  const topProducts = [
    { name: "Tai nghe Wireless Pro", sold: 1204, price: "₫850k" },
    { name: "Đồng hồ thông minh S4", sold: 890, price: "₫1.2tr" },
    { name: "Giày thể thao Hunter", sold: 650, price: "₫650k" },
    { name: "Kính râm thời trang", sold: 432, price: "₫320k" },
  ];

  const recentOrders = [
    {
      id: "#ORD-00123",
      customer: "Trần Văn B",
      date: "24/05/2024",
      total: "2.500.000 ₫",
      status: "Hoàn thành",
      statusColor: "success",
    },
    {
      id: "#ORD-00122",
      customer: "Lê Thị C",
      date: "24/05/2024",
      total: "850.000 ₫",
      status: "Đang giao",
      statusColor: "warning",
    },
    {
      id: "#ORD-00121",
      customer: "Phạm Văn D",
      date: "23/05/2024",
      total: "1.200.000 ₫",
      status: "Mới",
      statusColor: "primary",
    },
    {
      id: "#ORD-00120",
      customer: "Hoàng Thị E",
      date: "23/05/2024",
      total: "450.000 ₫",
      status: "Đã hủy",
      statusColor: "danger",
    },
  ];
  return (
    <main className="p-3 p-md-4">
      <div className="container-fluid" style={{ maxWidth: 1400 }}>
        {/* Date Filter */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <small className="text-muted">Cập nhật lúc: 10:30, 24/05/2024</small>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-primary">Hôm nay</button>
            <button className="btn btn-outline-secondary">7 ngày qua</button>
            <button className="btn btn-outline-secondary">Tháng này</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          {statsCards.map((stat, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-lg-3">
              <div className={`card stat-card border-0 shadow-sm h-100`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className={`p-2 bg-${stat.color} bg-opacity-10 rounded`}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{stat.icon}</span>
                    </div>
                    <span
                      className={`badge bg-${
                        stat.positive ? "success" : "danger"
                      } bg-opacity-10 text-${
                        stat.positive ? "success" : "danger"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-muted small mb-1">{stat.title}</p>
                  <h4 className="fw-bold mb-0">{stat.value}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Widgets */}
        <div className="row g-4 mb-4">
          {/* Revenue Chart */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="fw-bold mb-1">Biểu đồ Doanh thu</h5>
                    <small className="text-muted">So sánh với tuần trước</small>
                  </div>
                  <button className="btn btn-link text-primary p-0">
                    Xem chi tiết
                  </button>
                </div>
                <div className="chart-container" style={{ height: 250 }}>
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 500 200"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#2b8cee", stopOpacity: 0.3 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#2b8cee", stopOpacity: 0 }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,150 Q125,100 250,120 T500,50 V200 H0 Z"
                      fill="url(#gradient)"
                    />
                    <path
                      d="M0,150 Q125,100 250,120 T500,50"
                      fill="none"
                      stroke="#2b8cee"
                      strokeWidth="3"
                    />
                    <circle
                      cx="0"
                      cy="150"
                      r="4"
                      fill="white"
                      stroke="#2b8cee"
                      strokeWidth="2"
                    />
                    <circle
                      cx="250"
                      cy="120"
                      r="4"
                      fill="white"
                      stroke="#2b8cee"
                      strokeWidth="2"
                    />
                    <circle
                      cx="500"
                      cy="50"
                      r="4"
                      fill="white"
                      stroke="#2b8cee"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="d-flex justify-content-between mt-3">
                  {[
                    "Thứ 2",
                    "Thứ 3",
                    "Thứ 4",
                    "Thứ 5",
                    "Thứ 6",
                    "Thứ 7",
                    "CN",
                  ].map((day, idx) => (
                    <small key={idx} className="text-muted">
                      {day}
                    </small>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="fw-bold mb-4">Top Sản phẩm bán chạy</h5>
                <div className="d-flex flex-column gap-3">
                  {topProducts.map((product, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-3">
                      <div
                        className="bg-light rounded"
                        style={{ width: 48, height: 48, flexShrink: 0 }}
                      ></div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-medium small text-truncate">
                          {product.name}
                        </div>
                        <small className="text-muted">
                          Đã bán: {product.sold}
                        </small>
                      </div>
                      <span className="fw-semibold text-primary">
                        {product.price}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-outline-secondary w-100 mt-3">
                  Xem tất cả
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Đơn hàng gần đây</h5>
              <div className="d-flex gap-2">
                <button className="btn btn-light btn-sm">
                  <span className="me-1">🔽</span>
                  Lọc
                </button>
                <button className="btn btn-primary btn-sm">
                  <span className="me-1">⬇️</span>
                  Xuất báo cáo
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th className="text-end">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => (
                    <tr key={idx}>
                      <td className="fw-medium">{order.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="bg-secondary rounded-circle"
                            style={{ width: 32, height: 32 }}
                          ></div>
                          <span>{order.customer}</span>
                        </div>
                      </td>
                      <td>{order.date}</td>
                      <td className="fw-medium">{order.total}</td>
                      <td>
                        <span
                          className={`badge bg-${order.statusColor} bg-opacity-10 text-${order.statusColor}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-link btn-sm text-primary p-0">
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-center mt-3">
              <button className="btn btn-link text-muted">
                Xem tất cả đơn hàng
              </button>
            </div>
          </div>
        </div>

        <footer className="text-center text-muted mt-4 py-3">
          <small>© 2024 Admin Dashboard. All rights reserved.</small>
        </footer>
      </div>
    </main>
  );
};

export default DashBoardPage;
