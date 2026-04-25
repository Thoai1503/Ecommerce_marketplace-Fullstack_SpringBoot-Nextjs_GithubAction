"use client";
import { IProduct } from "@/validators/product";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./AllProduct.module.css";

interface AllProductProps {
  products: Partial<IProduct>[];
}
const AllProduct = ({ products }: AllProductProps) => {
  const [data, setData] = React.useState<Partial<IProduct>[]>([]);
  React.useEffect(() => {
    setData(products);
  }, [products]);

  if (!products || products.length === 0) {
    return <div className={styles.noProducts}>No products available.</div>;
  }

  return (
    <div className={styles.productGrid}>
      {data.map((item, idx) => (
        <Link
          key={idx}
          href={`/${item.product_slug}-.p${item.id}?id=${item.id}`}
          className={styles.productCard}
        >
          <div className={styles.imageWrap}>
            <Image
              src={
                item.image_url ||
                "https://via.placeholder.com/400?text=No+Image"
              }
              alt={item.product_name || "No image"}
              fill
              className={styles.productImage}
              sizes="(max-width: 768px) 50vw, (max-width: 992px) 33vw, 20vw"
            />
          </div>
          <div className={styles.productInfo}>
            <span className={styles.productName}>
              {item.product_name}
            </span>
            <div className={styles.priceWrap}>
              <span className={styles.currentPrice}>{item.price}₫</span>
              <span className={styles.oldPrice}>{item.original_price}₫</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AllProduct;
