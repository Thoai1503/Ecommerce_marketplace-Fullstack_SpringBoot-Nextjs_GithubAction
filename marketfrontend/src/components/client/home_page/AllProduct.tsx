"use client";
import { Product } from "@/validators/product";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface AllProductProps {
  products: Partial<Product>[];
}
const AllProduct = ({ products }: AllProductProps) => {
  const [data, setData] = React.useState<Partial<Product>[]>([]);
  React.useEffect(() => {
    setData(products);
  }, [products]);

  if (!products || products.length === 0) {
    return <div>No products available.</div>;
  }

  return (
    <>
      {data.map((item, idx) => (
        <Link
          href={`/${item.product_slug}-.p${item.id}?id=${item.id}`}
          className="col-6 col-md-4 col-lg-3 col-xl-2"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div key={idx}>
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
        </Link>
      ))}
    </>
  );
};

export default AllProduct;
