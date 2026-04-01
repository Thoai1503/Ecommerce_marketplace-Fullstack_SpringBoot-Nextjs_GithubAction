"use client";
import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useUserAuth } from "@/context/UserAuthContext";
import { Cart } from "@/types/data/Cart";
import { API_URL } from "@/helper/api";
import { useQuery } from "@tanstack/react-query";
import { CartItem, GroupedCartByShop } from "@/validators/cart";

const ShoppingCart: React.FC = () => {
  Cart.setup({ path: "/api/cart", baseUrl: API_URL });
  const { userId } = useUserAuth();
  const { data, isError, status } = useQuery(Cart.getByUserId(userId || 0));

  // State lưu danh sách cartItems từ API + selected flag
  const [cartItems, setCartItems] = useState<
    (CartItem & { selected: boolean })[]
  >([]);

  // Sync dữ liệu từ API vào state khi data thay đổi
  useEffect(() => {
    if (data) {
      setCartItems(data.map((item) => ({ ...item, selected: false })));
    }
    console.log("Fetched cart data:", data);
  }, [data]);

  // Lưu các item được chọn vào localStorage
  useEffect(() => {
    const selectedItems = cartItems.filter((item) => item.selected);
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
  }, [cartItems]);

  useEffect(() => {
    if (isError) {
      alert(
        "Đã xảy ra lỗi khi tải dữ liệu giỏ hàng. Vui lòng thử lại sau. " +
          status,
      );
      console.error("Error fetching cart data");
    }
  }, [isError]);

  const [voucher, setVoucher] = useState("");
  const discount = 50000;
  const shippingFee = 35000;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Group items theo shop
  const groupedByShop: Record<number, GroupedCartByShop> = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => {
        const shopId = item?.product?.shop?.id;
        if (!acc[shopId]) {
          acc[shopId] = { shop: item?.product?.shop, items: [] };
        }
        acc[shopId].items.push(item);
        return acc;
      },
      {} as Record<
        number,
        GroupedCartByShop & { items: (CartItem & { selected: boolean })[] }
      >,
    );
  }, [cartItems]);

  // ===== Tính toán =====
  const calculateSubtotal = () => {
    return cartItems
      .filter((item) => item.selected)
      .reduce(
        (sum, item) => sum + (item.productVariant?.price ?? 0) * item.quantity,
        0,
      );
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount + shippingFee;
  };

  const selectedCount = cartItems.filter((item) => item.selected).length;

  // ===== Checkbox logic =====
  const isAllSelected =
    cartItems.length > 0 && cartItems.every((item) => item.selected);
  const isIndeterminate = cartItems.some((i) => i.selected) && !isAllSelected;

  const toggleSelectAll = () => {
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, selected: !isAllSelected })),
    );
  };

  const toggleItemSelection = (itemId: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const isShopAllSelected = (shopId: number) => {
    const shopItems = groupedByShop[shopId]?.items as (CartItem & {
      selected: boolean;
    })[];
    return shopItems?.length > 0 && shopItems.every((item) => item.selected);
  };

  const isShopIndeterminate = (shopId: number) => {
    const shopItems = groupedByShop[shopId]?.items as (CartItem & {
      selected: boolean;
    })[];
    const selectedCount = shopItems?.filter((i) => i.selected).length ?? 0;
    return selectedCount > 0 && selectedCount < (shopItems?.length ?? 0);
  };

  const toggleShopSelection = (shopId: number) => {
    const allSelected = isShopAllSelected(shopId);
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.shop.id === shopId
          ? { ...item, selected: !allSelected }
          : item,
      ),
    );
  };

  // ===== CRUD =====
  const updateQuantity = (itemId: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const removeItem = (itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // ===== Suggestions (giữ mock data) =====
  const suggestions = [
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
  ];

  if (!data && !isError) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Left Column: Cart Items */}
        <div className="col-lg-8">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="h3 fw-bold d-flex align-items-center gap-3 mb-0">
              Giỏ Hàng
              <span className="badge bg-light text-dark fs-6 fw-normal">
                ({cartItems.length} sản phẩm)
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
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={toggleSelectAll}
                  />
                </div>
                <div className="col">
                  <span className="fw-semibold">
                    Chọn tất cả ({cartItems.length})
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

          {/* Empty cart */}
          {cartItems.length === 0 && (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-cart-x fs-1 text-muted"></i>
                <p className="mt-3 text-muted">Giỏ hàng của bạn đang trống.</p>
              </div>
            </div>
          )}

          {/* Shop Groups */}
          {Object.entries(groupedByShop)?.map(([shopIdStr, group]) => {
            const shopId = Number(shopIdStr);
            const typedItems = group.items as (CartItem & {
              selected: boolean;
            })[];

            return (
              <div key={shopId} className="card shadow-sm mb-3">
                {/* Shop Header */}
                <div className="card-header bg-light d-flex align-items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    style={{ width: "20px", height: "20px" }}
                    checked={isShopAllSelected(shopId)}
                    ref={(el) => {
                      if (el) el.indeterminate = isShopIndeterminate(shopId);
                    }}
                    onChange={() => toggleShopSelection(shopId)}
                  />
                  <i className="bi bi-shop text-primary"></i>
                  <span className="fw-bold text-uppercase small">
                    {group?.shop?.shopName}
                  </span>
                  <i className="bi bi-chevron-right text-muted"></i>
                </div>

                {/* Products */}
                {typedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`card-body ${index < typedItems.length - 1 ? "border-bottom" : ""}`}
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
                              src={
                                item.productVariant?.imageUrl ??
                                "/placeholder.png"
                              }
                              alt={item?.product?.name}
                              className="w-100 h-100 object-fit-cover"
                            />
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <h6 className="fw-bold mb-1 text-truncate">
                              {item?.product?.name}
                            </h6>
                            {item?.productVariant && (
                              <div className="small text-muted d-flex align-items-center gap-1">
                                Phân loại:{" "}
                                <span className="text-dark fw-medium">
                                  {item?.productVariant?.variantName}
                                </span>
                                <i className="bi bi-chevron-down"></i>
                              </div>
                            )}
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
                              {formatCurrency(item.productVariant?.price ?? 0)}
                            </div>
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
                              {formatCurrency(
                                (item.productVariant?.price ?? 0) *
                                  item.quantity,
                              )}
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
            );
          })}
        </div>

        {/* Right Column: Summary */}
        <div className="col-lg-4">
          <div style={{ top: "88px" }}>
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
                    Tạm tính ({selectedCount} sản phẩm đã chọn)
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
                <button
                  className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                  disabled={selectedCount === 0}
                  onClick={() => (window.location.href = "/checkout")}
                >
                  MUA HÀNG ({selectedCount})
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
          {suggestions.map((product) => (
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
                    className="card-title small fw-medium"
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
