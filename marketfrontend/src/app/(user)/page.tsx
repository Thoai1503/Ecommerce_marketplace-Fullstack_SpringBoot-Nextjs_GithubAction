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
              //{ image: "/image/mal.png", text: "Mall" },
              {
                image: "/image/voucher.png",
                text: "Voucher",
                href: "/voucher",
              },
              {
                image:
                  "https://salt.tikicdn.com/ts/tikimsp/33/a6/c9/a07fa646abd6b4a591df15852eb248f2.png",
                text: "Deal nhãn hàng",
                href: "/voucher?scope=BRAND",
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
