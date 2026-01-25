// app/page.tsx (hoặc components/HomePage.tsx)
import React from "react";
import Image from "next/image";
import axios from "axios";
import { API_URL, INTERNAL_API } from "@/helper/api";
import { Product } from "@/validators/product";
// import { useHomePage } from "@/feature/client/hook";

export default async function Home() {
  const res = await axios.get(`${INTERNAL_API}/product`);
  const products = res.data as Partial<Product>[];
  console.log("Product: " + JSON.stringify(products));
  // const { products } = useHomePage();
  return (
    <div className="container-fluid px-3 px-md-4">
      {/* Category Icons - Horizontal Scrollable */}
      <div className="my-4">
        <div
          className="d-flex overflow-auto gap-3 pb-2 scrollbar-thin"
          style={{ scrollbarWidth: "thin" }}
        >
          {[
            { icon: "truck", text: "Freeship", color: "primary" },
            { icon: "lightning-fill", text: "Flash Sale", color: "warning" },
            { icon: "shop", text: "Mall", color: "danger" },
            {
              icon: "ticket-perforated",
              text: "Mã Giảm Giá",
              color: "success",
            },
            { icon: "phone", text: "Nạp Thẻ", color: "info" },
            { icon: "coin", text: "Hoàn Xu", color: "warning" },
            { icon: "airplane", text: "Khởi Trang", color: "primary" },
            { icon: "globe", text: "Hàng Quốc Tế", color: "secondary" },
            { icon: "heart", text: "Biết Trend", color: "danger" },
            { icon: "grid-3x3", text: "Tất Cả", color: "dark" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="text-center flex-shrink-0"
              style={{ width: "80px" }}
            >
              <div
                className={`rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm`}
                style={{ width: "60px", height: "60px" }}
              >
                <i className={`bi bi-${item.icon} fs-3 text-${item.color}`}></i>
              </div>
              <small className="d-block text-muted">{item.text}</small>
            </div>
          ))}
        </div>
      </div>
      {/* Danh mục sản phẩm */}
      <h5 className="fw-bold mb-3 mt-5">DANH MỤC</h5>
      <div className="row g-3 g-md-4">
        {[
          { name: "Giày Dép", color: "#ffe4b5", icon: "shoe" },
          { name: "Nhà Cửa & Đời Sống", color: "#e0e0e0" },
          { name: "Điện thoại & Phụ kiện", color: "#a5d8ff" },
          { name: "Thời trang nam", color: "#ffd8a8" },
          { name: "Sắc đẹp", color: "#ffc9c9" },
          { name: "Mẹ & Bé", color: "#ffec99" },
          { name: "Đồng hồ", color: "#d9d9d9" },
          { name: "Máy tính & Laptop", color: "#b2f2bb" },
          { name: "Sức khỏe", color: "#d3f9d8" },
          { name: "Xem thêm", color: "#e9ecef" },
        ].map((cat, idx) => (
          <div key={idx} className="col-4 col-md-3 col-lg-2">
            <div className="text-center category-item shadow-sm rounded p-3 bg-white hover-lift">
              <div
                className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                style={{
                  width: "70px",
                  height: "70px",
                  backgroundColor: cat.color,
                }}
              >
                {cat.icon && (
                  <i className={`bi bi-${cat.icon} fs-3 text-dark`}></i>
                )}
              </div>
              <small className="d-block fw-medium">{cat.name}</small>
            </div>
          </div>
        ))}
      </div>
      {/* Flash Sale Section */}
      <div className="mt-5 pt-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-lightning-fill text-warning fs-4"></i>
            <h5 className="fw-bold mb-0 text-uppercase">FLASH SALE</h5>
            <span className="badge bg-danger ms-2">Hết hàng sau 2h 14p</span>
          </div>
          <a href="#" className="text-decoration-none text-primary fw-medium">
            Xem tất cả <i className="bi bi-arrow-right"></i>
          </a>
        </div>

        <div className="row g-3">
          {[
            {
              discount: 50,
              price: "1.250.000",
              oldPrice: "2.500.000",
              sold: 99,
              badge: "MALL",
              img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
            },
            {
              discount: 35,
              price: "350.000",
              oldPrice: "550.000",
              sold: 95,
              img: "https://images.unsplash.com/photo-1625772299848-361b803ffa25?w=400",
            },
            {
              discount: 20,
              price: "890.000",
              oldPrice: "1.110.000",
              sold: 0,
              img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
            },
            {
              discount: 45,
              price: "450.000",
              oldPrice: "820.000",
              sold: 99,
              img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
            },
            {
              discount: 15,
              price: "2.100.000",
              oldPrice: "2.470.000",
              sold: 0,
              img: "https://images.unsplash.com/photo-1523275335684-04d3bccb4a93?w=400",
            },
            {
              discount: 25,
              price: "1.500.000",
              oldPrice: "2.000.000",
              sold: 0,
              img: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400",
            },
          ].map((product, idx) => (
            <div key={idx} className="col-6 col-md-4 col-lg-3 col-xl-2">
              <div className="card product-card border-0 shadow-sm h-100 position-relative overflow-hidden hover-shadow">
                {product.discount > 0 && (
                  <span className="position-absolute top-0 start-0 badge bg-danger m-2 fs-6 px-2 py-1">
                    -{product.discount}%
                  </span>
                )}
                {product.sold > 0 && product.sold >= 90 && (
                  <span className="position-absolute top-0 end-0 badge bg-warning text-dark m-2">
                    HOT
                  </span>
                )}

                <div className="ratio ratio-1x1 bg-light">
                  <Image
                    src={product.img}
                    alt="Product"
                    fill
                    className="object-fit-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>

                <div className="card-body p-3 d-flex flex-column">
                  <div className="text-danger fw-bold fs-5 mb-1">
                    ₫{product.price}
                  </div>
                  <div className="text-muted text-decoration-line-through small mb-2">
                    ₫{product.oldPrice}
                  </div>

                  {product.sold > 0 ? (
                    <div className="mt-auto">
                      <div className="progress" style={{ height: "6px" }}>
                        <div
                          className="progress-bar bg-danger"
                          role="progressbar"
                          style={{ width: `${Math.min(product.sold, 100)}%` }}
                        ></div>
                      </div>
                      <small className="text-danger d-block mt-1">
                        Đã bán {product.sold}+
                      </small>
                    </div>
                  ) : (
                    <button className="btn btn-sm btn-outline-danger mt-auto">
                      Mua ngay
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0 text-uppercase">GỢI Ý HÔM NAY</h5>
          <a href="#" className="text-decoration-none text-primary fw-medium">
            Xem tất cả <i className="bi bi-arrow-right"></i>
          </a>
        </div>

        <div className="row g-3">
          {[
            {
              name: "Điện thoại thông minh hiện đại",
              price: "8.990.000",
              oldPrice: "12.990.000",
              discount: 31,
              img: "https://thumbs.dreamstime.com/b/new-modern-smartphone-isolated-white-background-new-smartphone-isolated-sleek-new-smartphone-isolated-white-background-361464587.jpg",
            },
            {
              name: "Tai nghe không dây cao cấp",
              price: "1.290.000",
              oldPrice: "1.990.000",
              discount: 35,
              img: "https://img.freepik.com/premium-photo/wireless-earbuds-with-pink-light-blue-background-product-photography_1233553-80955.jpg",
            },
            {
              name: "Giày thể thao nam trắng",
              price: "890.000",
              oldPrice: "1.490.000",
              discount: 40,
              img: "https://img.freepik.com/premium-photo/white-mens-sneakers-white-background_511031-3343.jpg",
            },
            {
              name: "Túi xách thời trang nữ",
              price: "1.450.000",
              oldPrice: "2.200.000",
              discount: 34,
              img: "https://thumbs.dreamstime.com/b/set-fashion-product-photography-women-s-handbags-platinum-bags-spring-set-fashion-product-photography-women-268677968.jpg",
            },
            {
              name: "Đồng hồ thông minh Fitbit",
              price: "4.990.000",
              oldPrice: "6.490.000",
              discount: 23,
              img: "https://content.abt.com/image.php/Fitbit-Versa-4-Graphite-Aluminum-Black-Fitness-Smartwatch-FB523BKBK-US.jpg?image=/images/products/BDP_Images/Fitbit-Versa-4-Graphite-Aluminum-Black-Fitness-Smartwatch-FB523BKBK-US.jpg&canvas=1&width=750&height=550",
            },
            {
              name: "Máy xay sinh tố đa năng",
              price: "790.000",
              oldPrice: "1.290.000",
              discount: 39,
              img: "https://c8.alamy.com/comp/2C4YRPJ/kitchen-appliance-concept-modern-multicolour-electric-blenders-on-a-white-background-3d-rendering-2C4YRPJ.jpg",
            },
            {
              name: "Laptop mỏng nhẹ 2025",
              price: "18.990.000",
              oldPrice: "22.990.000",
              discount: 17,
              img: "https://www.shutterstock.com/image-illustration/modern-computer-laptop-open-white-260nw-1663519288.jpg",
            },
            {
              name: "Kem dưỡng da cao cấp",
              price: "650.000",
              oldPrice: "990.000",
              discount: 34,
              img: "https://thumbs.dreamstime.com/b/hydrating-face-cream-glass-jar-surrounded-water-splashes-promising-radiant-youthful-skin-luxury-skincare-beauty-375987678.jpg",
            },
            {
              name: "Xe đẩy em bé hiện đại",
              price: "3.490.000",
              oldPrice: "4.990.000",
              discount: 30,
              img: "https://thumbs.dreamstime.com/b/high-quality-image-modern-comfortable-baby-stroller-orange-accents-showcasing-its-design-features-isolated-303799418.jpg",
            },
            {
              name: "Chuột gaming không dây",
              price: "990.000",
              oldPrice: "1.490.000",
              discount: 34,
              img: "https://m.media-amazon.com/images/I/71hId-UfEtL._AC_UF894,1000_QL80_.jpg",
            },
            {
              name: "Áo thun unisex oversize",
              price: "290.000",
              oldPrice: "450.000",
              discount: 36,
              img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
            },
            {
              name: "Bình giữ nhiệt 500ml",
              price: "350.000",
              oldPrice: "550.000",
              discount: 36,
              img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
            },
            {
              name: "Máy ảnh mirrorless",
              price: "15.990.000",
              oldPrice: "19.990.000",
              discount: 20,
              img: "https://images.unsplash.com/photo-1502920917128-1ad1d8ab6a07?w=400",
            },
            {
              name: "Son môi matte cao cấp",
              price: "280.000",
              oldPrice: "420.000",
              discount: 33,
              img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400",
            },
            {
              name: "Bộ chăn ga gối cotton",
              price: "1.890.000",
              oldPrice: "2.990.000",
              discount: 37,
              img: "https://images.unsplash.com/photo-1629949008636-0d9b0f0c0c5a?w=400",
            },
          ].map((product, idx) => (
            // <div key={idx} className="col-6 col-md-4 col-lg-3 col-xl-2">
            //   <div className="card product-card border-0 shadow-sm h-100 position-relative overflow-hidden hover-shadow">
            //     {product.discount > 0 && (
            //       <span className="position-absolute top-0 start-0 badge bg-danger m-2 fs-6 px-2 py-1">
            //         -{product.discount}%
            //       </span>
            //     )}

            //     <div className="ratio ratio-1x1 bg-light">
            //       <Image
            //         src={product.img}
            //         alt={product.name}
            //         fill
            //         className="object-fit-cover"
            //         sizes="(max-width: 768px) 50vw, (max-width: 992px) 33vw, 20vw"
            //       />
            //     </div>

            //     <div className="card-body p-3 d-flex flex-column">
            //       <small className="text-muted mb-1">{product.name}</small>
            //       <div className="text-danger fw-bold fs-5 mb-1">
            //         ₫{product.price}
            //       </div>
            //       <div className="text-muted text-decoration-line-through small">
            //         ₫{product.oldPrice}
            //       </div>
            //       {/* Không có nút Mua ngay hoặc Đã bán */}
            //     </div>
            //   </div>
            // </div>
            <></>
          ))}
          {products.map((item, idx) => (
            <div key={idx} className="col-6 col-md-4 col-lg-3 col-xl-2">
              <div className="card product-card border-0 shadow-sm h-100 position-relative overflow-hidden hover-shadow">
                {/* {item.discount > 0 && (
                  <span className="position-absolute top-0 start-0 badge bg-danger m-2 fs-6 px-2 py-1">
                    -{product.discount}%
                  </span>
                )} */}

                <div className="ratio ratio-1x1 bg-light">
                  <Image
                    src={
                      item.image_url ||
                      "https://via.placeholder.com/400?text=No+Image"
                    }
                    alt={item.product_name || "No image"}
                    fill
                    className="object-fit-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 992px) 33vw, 20vw"
                  />
                </div>

                <div className="card-body p-3 d-flex flex-column">
                  <small className="text-muted mb-1 product-name-clamp">
                    {item.product_name}
                  </small>
                  <div className="text-danger fw-bold fs-5 mb-1">
                    ₫{item.price}
                  </div>
                  <div className="text-muted text-decoration-line-through small">
                    ₫{item.original_price}
                  </div>
                  {/* Không có nút Mua ngay hoặc Đã bán */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
