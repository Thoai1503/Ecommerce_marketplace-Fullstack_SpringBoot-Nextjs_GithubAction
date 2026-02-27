"use client";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ShoppingCart: React.FC = () => {
  const [cart, setCart] = useState({
    items: [
      {
        id: 1,
        shopId: 1,
        shopName: "Thời Trang Công Sở Sài Gòn",
        name: "Áo sơ mi nam Oxford Premium",
        variant: "Trắng, Size L",
        price: 350000,
        originalPrice: 420000,
        quantity: 1,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBvDW-4D1ptKEQhh1gdLq2Xx_gTNTbbxMv0paPA5TEj6xDSElF_AGFgp4XJ-TvSX3i9hNXIs7nxOHtdvQoLYytSyx3xurrm-EU3xIJjyMeHJsuRVJlKy_I73u5IsRaOK6ZJ0Vsy9WuPzYPnA8EztPcCtMoWfDTRXaT_7vnSveFq6SoCdCinxnEqc36tPD8xSkuu6oFd89EN_6kP3aNSUoLtYW08quk9WZzydZkTo3bt45_il9reySmnYGJzX66kA7sp_SnDpKqy3w",
        selected: true,
      },
      {
        id: 2,
        shopId: 1,
        shopName: "Thời Trang Công Sở Sài Gòn",
        name: "Quần Tây Slim Fit Co Giãn",
        variant: "Đen, Size 32",
        price: 450000,
        originalPrice: null,
        quantity: 2,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDgllPca-IKMr_ZcdBbuR343tq0eZIbLFiTBGBQ3fzLf96C4NhQ_aFkWpJNc2EGRocEIuIhMHzn0rATR48tcmOUm5LVS8E4itmLl3RI9yP_ROhX72ISX4GGP9CPmtTUZdn-Xdc9qyptasBXI-WjcKuwkAWBgvNrfLx9eu_0Txg7sOJRHlB0K0xO2HNak64rSMqsFoiATPqIW7iQG3TEdgTomYJPwLeIHQYeKb7aLKnVifVVwFiP8JValOwJ5G2-aPYQNxEDVhltwQ",
        selected: false,
      },
      {
        id: 3,
        shopId: 2,
        shopName: "Phụ Kiện Da Cao Cấp",
        name: "Ví Da Nam Bifold Handmade",
        variant: "Nâu Bò",
        price: 290000,
        originalPrice: null,
        quantity: 1,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC0KBthXTtfrWdF3i1ljm1o0gGo9ucvYubwiBifgzrgmPZ67GdSPEwfEg8c_YWqO7OoMQnbvfa7noheLvkhYb4UMBSHgsoufqfvKMIVu3ZCTpdlJFxfokasHvdnGA2_Enxc4IiiJ4moh3Jk8DZh5n8xkaR8-WpAwQ5GvLSdw7rfn_XIFDQFq3IwyCIN4ALgUBFKDGqlC02uL4W8Xv3J1ZXSws9TCVVpgjDIytsTMNqknpaGDyQA73aXnViQw8XrcMIkjGtE0tyJGA",
        selected: false,
      },
    ],
    suggestions: [
      {
        id: 101,
        name: "Áo Polo Nam Co Giãn 4 Chiều Cao Cấp",
        price: 245000,
        rating: 4.8,
        reviews: 2100,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBpMaGu9gHiFHmr9-NOfCd9FnMrt0pYAzai3yu65hCmzluBbjQyBMfQrAVjuj6uq92htzu79j-mhFncmCyAm96Txi4aqzpDnlibFxHiIiVkoujOe0Aaoa0Otmky3u1lcMn8IhHmixJnUQ83BGzdLnJlq9AoN2jTJqJTZNYzKFdyuWzuvF6FL0gg3ZO3Pk5gPKhjaIc4VDBZ0DcoWqZqMFauCBXYiIsNoPSOhvjHoXVEnVIxueP4p-JoqGPYUq7i8JJgO0gJirEf9A",
        badge: "-15%",
      },
      {
        id: 102,
        name: "Thắt Lưng Da Bò Thật 100% Khóa Kim",
        price: 180000,
        rating: 5.0,
        reviews: 854,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC2X60uGq7bsaRW74jmyatTEpVDBPPC8a4TAogRQskZBugRu-Zi1-jaskPsHfkvgCj7tn5MqLAFJMU_9pQ1qAx1uzvaqcGTpwfJ64civHc0trx-wjHE3VGVGnpWdf1OISqsMBlpDO2D_EsyTNBYRQayifrHMS761Ze0nE61gQaj6YMvULSfCDh50lbE-f4r-6pM8woISYwDwnXU9vY8pFLie99tsweH-ZtUReKaAOyfVXWJgFb3-QpGlCpRjvAzsCZ9N3PDC3o18A",
        badge: null,
      },
      {
        id: 103,
        name: "Combo 5 Đôi Tất Cotton Kháng Khuẩn",
        price: 95000,
        rating: 4.9,
        reviews: 1200,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDMVuA2flTpTePO86znx6IA3yTutXLktCt19K4Q1z4tW59cNVx1455tDVkrwyZ6heZtrvLdCnCWPX1GNllsfyMoG1EQxJ6yE6H7LhhQOrdG-YVlIQdkEdoY3v1ab06C2xoK3ZUzk9y3mt8rx__9sHsPpDaMb0ANUSBVTSXLvEm3ummY0DCJzIThHHwn5HGTG7-PlrWyhM1HSHXIuuKBc3XhrmW5H3_Vx1j-nyUudz2xRKhOOrCIhMlD5lcnz8ocLLS7c5GSAgWpyQ",
        badge: null,
      },
      {
        id: 104,
        name: "Giày Sneaker Trắng Phối Đồ Basic",
        price: 550000,
        rating: 4.7,
        reviews: 542,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDI5ZRjInT8fyGgk9srpjJeYpDCMgCKxzTa1LgRWdmuEu5CuXW6sR_M4Ct1lqkJvyYNgH6fWIH6zp_1dEyg40QY4vnFUaZy6XUztS27FAwHACzKX9vtvwVTgZXI1bNGiOFJuQGxY-r-s0ombAAPV40VI70XepkV1fsmu67OiohAZS-HQlY33Z_7C3XRenLFF3vAyiGwOiDn_pObouDNDe44X3mIpyb3c_tc5wZurceCCtR0W-01SI7b8T_uF8HenRMHejhLYms_EQ",
        badge: "HOT",
      },
      {
        id: 105,
        name: "Kính Mát Chống Tia UV Thời Trang",
        price: 320000,
        rating: 4.5,
        reviews: 211,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAFocVa1Pl0QCnNtkFOIrTyLY05FEqM6atPDE7uoP-ue2VCcE5orGVpv3lQYq2s1vqRrPdedEiq3JYOoPwWAXShJrudVNZ6pysFjCIk9df8WEdrFpdt2qSstd7vsbO8CL55Sl6RJTgFyQ-XsDBuYnykG6E5JRQpGblvf_W9_q8rvNvO3ygK4DWIgxTIcVC8J1u7uP9DtfLm-ZqONTHpfYSo4yJIMwvF688h2fxJkXSflH-7-I2Zudz4XNSR_ANQWjCa6xKg4mvDIA",
        badge: null,
      },
      {
        id: 106,
        name: "Balo Laptop Chống Nước Oxford",
        price: 450000,
        rating: 4.9,
        reviews: 78,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBWvK4ciy91oPscNpspJGkgI4p6InH_P3UBTcejW5f3dPa9OociE55T0LCYbAHl5ORPbjjX_5PmGt2___Mg-T9Xf-2fW2rEmhAnqeD2jLGGcYKjajttRj9_hz6xzl9wz4TuZcDI9AJ1BsGBsPj-u6l5f8I64Q0FPXTtEs_zbdMJykgYunqHbji5bhW6ZTgoBYiR93tr4RVH4_MTR5CLXQZubnb9Z4DwuVRnn5qcw245yP3J0cSb3mTFXm4wH1qUiKWu-1mrptMQYQ",
        badge: null,
      },
    ],
  });

  const [voucher, setVoucher] = useState("");
  const discount = 50000;
  const shippingFee = 35000;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "₫");
  };

  const calculateSubtotal = () => {
    return cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount + shippingFee;
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    }));
  };

  const removeItem = (itemId: number) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const toggleItemSelection = (itemId: number) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item,
      ),
    }));
  };

  const groupedItems = cart.items.reduce(
    (groups, item) => {
      if (!groups[item.shopId]) {
        groups[item.shopId] = {
          shopName: item.shopName,
          items: [],
        };
      }
      groups[item.shopId].items.push(item);
      return groups;
    },
    {} as Record<number, { shopName: string; items: typeof cart.items }>,
  );

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Left Column: Cart Items */}
        <div className="col-lg-8">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="h3 fw-bold d-flex align-items-center gap-3 mb-0">
              Giỏ Hàng
              <span className="badge bg-light text-dark fs-6 fw-normal">
                ({cart.items.length} sản phẩm)
              </span>
            </h2>
          </div>

          {/* Select All Header */}
          <div
            className="card shadow-sm mb-3 sticky-top"
            style={{ top: "72px", zIndex: 40 }}
          >
            <div className="card-body py-3">
              <div className="row align-items-center">
                <div className="col-auto">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    style={{ width: "20px", height: "20px" }}
                  />
                </div>
                <div className="col">
                  <span className="fw-semibold">
                    Chọn tất cả ({cart.items.length})
                  </span>
                </div>
                <div className="col-md-7 d-none d-md-block">
                  <div className="row text-center text-muted small fw-medium">
                    <div className="col-3">Đơn giá</div>
                    <div className="col-3">Số lượng</div>
                    <div className="col-3">Thành tiền</div>
                    <div className="col-3">Thao tác</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Groups */}
          {Object.entries(groupedItems).map(([shopId, group]) => (
            <div key={shopId} className="card shadow-sm mb-3">
              {/* Shop Header */}
              <div className="card-header bg-light d-flex align-items-center gap-3 py-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  style={{ width: "20px", height: "20px" }}
                />
                <i className="bi bi-shop text-primary"></i>
                <span className="fw-bold text-uppercase small">
                  {group.shopName}
                </span>
                <i className="bi bi-chevron-right text-muted"></i>
              </div>

              {/* Shipping Promo */}
              {shopId === "1" && (
                <div className="alert alert-primary mb-0 rounded-0 d-flex align-items-center gap-2 py-2 small">
                  <i className="bi bi-truck"></i>
                  <span>
                    Miễn phí vận chuyển cho đơn hàng từ 300k. Mua thêm 150k để
                    nhận ưu đãi!
                  </span>
                </div>
              )}

              {/* Products */}
              {group.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`card-body ${index < group.items.length - 1 ? "border-bottom" : ""}`}
                >
                  <div className="row align-items-center g-3">
                    {/* Product Info */}
                    <div className="col-md-5">
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={item.selected}
                          onChange={() => toggleItemSelection(item.id)}
                          style={{ width: "20px", height: "20px" }}
                        />
                        <div
                          className="bg-light rounded overflow-hidden border flex-shrink-0"
                          style={{ width: "96px", height: "96px" }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-100 h-100 object-fit-cover"
                          />
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <h6 className="fw-bold mb-1 text-truncate">
                            {item.name}
                          </h6>
                          <div className="small text-muted d-flex align-items-center gap-1">
                            Phân loại:{" "}
                            <span className="text-dark fw-medium">
                              {item.variant}
                            </span>
                            <i className="bi bi-chevron-down"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="col-md-7">
                      <div className="row align-items-center g-3 text-center">
                        {/* Price */}
                        <div className="col-6 col-md-3">
                          <div className="d-md-none small text-muted mb-1">
                            Đơn giá
                          </div>
                          <div className="fw-bold">
                            {formatCurrency(item.price)}
                          </div>
                          {item.originalPrice && (
                            <div className="small text-muted text-decoration-line-through">
                              {formatCurrency(item.originalPrice)}
                            </div>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="col-6 col-md-3">
                          <div className="d-md-none small text-muted mb-1">
                            Số lượng
                          </div>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <input
                              type="text"
                              className="form-control form-control-sm text-center"
                              value={item.quantity}
                              readOnly
                              style={{ width: "50px" }}
                            />
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="col-6 col-md-3">
                          <div className="d-md-none small text-muted mb-1">
                            Thành tiền
                          </div>
                          <div className="fw-bold text-primary">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>

                        {/* Delete */}
                        <div className="col-6 col-md-3">
                          <button
                            className="btn btn-link text-muted p-2"
                            onClick={() => removeItem(item.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right Column: Summary */}
        <div className="col-lg-4">
          <div className="" style={{ top: "88px" }}>
            {/* Address Card */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-uppercase text-muted small fw-bold mb-0">
                    Địa chỉ nhận hàng
                  </h6>
                  <button className="btn btn-link btn-sm text-primary p-0">
                    Thay đổi
                  </button>
                </div>
                <div className="d-flex gap-2">
                  <i className="bi bi-geo-alt-fill text-primary"></i>
                  <div className="small">
                    <p className="fw-bold mb-1">Nguyễn Văn A | 090 123 4567</p>
                    <p className="text-muted mb-0">
                      123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí
                      Minh
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Card */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h6 className="text-uppercase text-muted small fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-tag"></i>
                  Voucher khuyến mãi
                </h6>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập mã giảm giá..."
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                  />
                  <button className="btn btn-primary">Áp dụng</button>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted small">
                    Tạm tính ({cart.items.length} sản phẩm)
                  </span>
                  <span className="fw-semibold">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted small">Giảm giá voucher</span>
                  <span className="fw-semibold text-success">
                    - {formatCurrency(discount)}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted small">Phí vận chuyển</span>
                  <div className="text-end">
                    <div className="fw-semibold">
                      {formatCurrency(shippingFee)}
                    </div>
                    <span
                      className="badge bg-success"
                      style={{ fontSize: "9px" }}
                    >
                      MIỄN PHÍ VẬN CHUYỂN
                    </span>
                  </div>
                </div>
                <hr className="border-dashed" />
                <div className="d-flex justify-content-between align-items-end mb-4">
                  <span className="fw-bold">Tổng cộng</span>
                  <div className="text-end">
                    <div className="h4 fw-bold text-primary mb-0">
                      {formatCurrency(calculateTotal())}
                    </div>
                    <small className="text-muted" style={{ fontSize: "10px" }}>
                      (Đã bao gồm VAT nếu có)
                    </small>
                  </div>
                </div>
                <button className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2">
                  MUA HÀNG ({cart.items.length})
                  <i className="bi bi-arrow-right"></i>
                </button>
                <div className="d-flex justify-content-center gap-4 mt-3 opacity-50">
                  <i className="bi bi-credit-card fs-4"></i>
                  <i className="bi bi-wallet2 fs-4"></i>
                  <i className="bi bi-cash-coin fs-4"></i>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="alert alert-light text-center small">
              Bằng việc nhấn "Mua Hàng", bạn đồng ý với{" "}
              <a href="#" className="text-primary">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a href="#" className="text-primary">
                Chính sách bảo mật
              </a>{" "}
              của E-Shop.
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      <section className="mt-5">
        <h3 className="h4 fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-stars text-primary"></i>
          Có thể bạn cũng thích
        </h3>
        <div className="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
          {cart.suggestions.map((product) => (
            <div key={product.id} className="col">
              <div className="card h-100 border shadow-sm">
                <div className="position-relative">
                  <div className="ratio ratio-1x1 bg-light">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="card-img-top object-fit-cover"
                    />
                  </div>
                  {product.badge && (
                    <span
                      className={`position-absolute top-0 start-0 m-2 badge ${
                        product.badge === "HOT" ? "bg-warning" : "bg-danger"
                      }`}
                      style={{ fontSize: "10px" }}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="card-body p-3">
                  <h6
                    className="card-title small fw-medium text-truncate"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {product.name}
                  </h6>
                  <p className="text-primary fw-bold mb-1">
                    {formatCurrency(product.price)}
                  </p>
                  <div className="d-flex align-items-center gap-1">
                    <i
                      className="bi bi-star-fill text-warning"
                      style={{ fontSize: "12px" }}
                    ></i>
                    <span className="text-muted" style={{ fontSize: "10px" }}>
                      {product.rating} (
                      {product.reviews > 999
                        ? `${(product.reviews / 1000).toFixed(1)}k`
                        : product.reviews}
                      )
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ShoppingCart;
