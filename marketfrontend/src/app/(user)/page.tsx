import Image from "next/image";
import { INTERNAL_API } from "@/helper/api";
import { cookies } from "next/headers";
import Link from "next/link";
import ProductFetcher from "@/components/client/home_page/ProductFetcher";
import CategoryFetcher from "@/components/client/home_page/CategoryFetcher";
import HomeHeroBanner from "@/components/client/home_page/HomeHeroBanner";
import styles from "./page.module.css";
// import { useHomePage } from "@/feature/client/hook";

const unwrapCollection = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const getOwnShopId = async (): Promise<number | null> => {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get("user")?.value ?? 0);

  if (!userId) return null;

  try {
    const res = await fetch(`${INTERNAL_API}/seller/shop/user/${userId}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const shop = await res.json();
    const shopId = Number(shop?.id ?? shop?.shop_id ?? 0);
    return shopId > 0 ? shopId : null;
  } catch {
    return null;
  }
};

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

  // Category is now loaded on client side
  const ownShopId = await getOwnShopId();

  return (
    <div className={styles.homePage}>
      <HomeHeroBanner />

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
                text: "Voucher",
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

        {/* Category Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>☰</span>
              Category
            </h2>
          </div>
          {/* Load categories on client side */}
          <CategoryFetcher />
        </section>

        {/* Flash Sale Section */}
        <section id="flash-sale" className={styles.section}>
          <div className={styles.flashSaleHeader}>
            <div className={styles.flashSaleTitleWrap}>
              <span className={styles.flashIcon}>⚡</span>
              <h2 className={styles.flashSaleTitle}>FLASH SALE</h2>
              <div className={styles.flashTimer}>
                <span className={styles.timerLabel}>Ends in</span>
                <span className={styles.timerValue}>02:14:59</span>
              </div>
            </div>
            <Link href="#" className={styles.viewAllLink}>
              View All <span className={styles.arrowIcon}>→</span>
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
                img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
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
                img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
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
                  <span className={styles.discountBadge}>
                    -{product.discount}%
                  </span>
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
                    <span className={styles.currentPrice}>
                      {product.price}₫
                    </span>
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
                      <span className={styles.soldText}>
                        Đã bán {product.sold}+
                      </span>
                    </div>
                  ) : (
                    <button className={styles.buyButton}>Mua ngay</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Suggested for You */}
        <section id="suggested-products" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>✦</span>
              Suggested for You
            </h2>
            <Link href="#" className={styles.viewAllLink}>
              View All <span className={styles.arrowIcon}>→</span>
            </Link>
          </div>

          <div className={styles.suggestedGrid}>
            {/* Fetch products on client side */}
            <ProductFetcher ownShopId={ownShopId} />
          </div>
        </section>
      </div>
    </div>
  );
}
