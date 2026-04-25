// app/page.tsx (hoặc components/HomePage.tsx)
import React from "react";
import Image from "next/image";
import axios from "axios";
import { API_URL, INTERNAL_API } from "@/helper/api";
import { IProduct } from "@/validators/product";
import { cookies } from "next/headers";
import Link from "next/link";
import AllProduct from "@/components/client/home_page/AllProduct";
import styles from "./page.module.css";
// import { useHomePage } from "@/feature/client/hook";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  console.log("Role: " + role);

  // const { products } = useHomePage();

  // if (products.length === 0 || !products) {
  //   return (
  //     <div>
  //       <h1>Loading...</h1>
  //     </div>
  //   );
  // }

  const res = await fetch(`${INTERNAL_API}/api/categories`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("API error");
  }

  const data = await res.json();

  const categories = Array.isArray(data) ? data : data.data;

  const parentCategories = categories
    .filter((c: any) => Number(c.level) === 0 && Number(c.is_active) === 1)
    .sort(
      (a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

  console.log("Parent Categories:", parentCategories);
  const res1 = await fetch(`${INTERNAL_API}/product`);
  const products = ((await res1.json()) as Partial<IProduct>[]) || [];
  // const { products } = useHomePage();

  if (products.length === 0 || !products) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Khám phá</h1>
          <p className={styles.heroSubtitle}>Sản phẩm chất lượng - Giá tốt nhất</p>
        </div>
        <div className={styles.heroOverlay}></div>
      </div>

      <div className={styles.mainContent}>
        {/* Shortcut Icons - Horizontal Scrollable */}
        <div className={styles.shortcutSection}>
          <div className={styles.shortcutRow}>
            {[
              { image: "/image/freeship.jpg", text: "Freeship" },
              { image: "/image/flashsale.png", text: "Flash Sale" },
              { image: "/image/mal.png", text: "Mall" },
              {
                image: "/image/voucher.png",
                text: "Mã giảm giá",
                href: "/voucher",
              },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.href ?? "#"}
                className={styles.shortcutItem}
              >
                <div className={styles.shortcutIconWrap}>
                  <img
                    src={item.image}
                    alt={item.text}
                    className={styles.shortcutIcon}
                  />
                </div>
                <span className={styles.shortcutLabel}>{item.text}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Danh mục sản phẩm */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>☰</span>
              Danh mục
            </h2>
          </div>
          <div className={styles.categoryGrid}>
            {parentCategories.map((cat: any, idx: number) => (
              <Link
                key={idx}
                href={`/category/${cat.id}`}
                className={styles.categoryCard}
              >
                <div
                  className={styles.categoryIconWrap}
                  style={{ backgroundColor: cat.color || "#f8f9fa" }}
                >
                  {cat.category_icon && (
                    <img
                      src={cat.category_icon}
                      alt={cat.category_name}
                      className={styles.categoryIcon}
                    />
                  )}
                </div>
                <span className={styles.categoryName}>
                  {cat.category_name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Flash Sale Section */}
        <section className={styles.section}>
          <div className={styles.flashSaleHeader}>
            <div className={styles.flashSaleTitleWrap}>
              <span className={styles.flashIcon}>⚡</span>
              <h2 className={styles.flashSaleTitle}>FLASH SALE</h2>
              <div className={styles.flashTimer}>
                <span className={styles.timerLabel}>Kết thúc sau</span>
                <span className={styles.timerValue}>02:14:59</span>
              </div>
            </div>
            <Link href="#" className={styles.viewAllLink}>
              Xem tất cả <span className={styles.arrowIcon}>→</span>
            </Link>
          </div>

          <div className={styles.productGrid}>
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
              <div key={idx} className={styles.productCard}>
                <div className={styles.cardBadge}>
                  <span className={styles.discountBadge}>-{product.discount}%</span>
                  {product.sold > 0 && product.sold >= 90 && (
                    <span className={styles.hotBadge}>HOT</span>
                  )}
                </div>
                <div className={styles.productImageWrap}>
                  <Image
                    src={product.img}
                    alt="Product"
                    fill
                    className={styles.productImage}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.priceWrap}>
                    <span className={styles.currentPrice}>{product.price}₫</span>
                    <span className={styles.oldPrice}>{product.oldPrice}₫</span>
                  </div>
                  {product.sold > 0 ? (
                    <div className={styles.soldInfo}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${Math.min(product.sold, 100)}%` }}
                        ></div>
                      </div>
                      <span className={styles.soldText}>Đã bán {product.sold}+</span>
                    </div>
                  ) : (
                    <button className={styles.buyButton}>Mua ngay</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gợi ý hôm nay */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>✦</span>
              Gợi ý hôm nay
            </h2>
            <Link href="#" className={styles.viewAllLink}>
              Xem tất cả <span className={styles.arrowIcon}>→</span>
            </Link>
          </div>

          <div className={styles.suggestedGrid}>
            <AllProduct products={products} />
          </div>
        </section>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
