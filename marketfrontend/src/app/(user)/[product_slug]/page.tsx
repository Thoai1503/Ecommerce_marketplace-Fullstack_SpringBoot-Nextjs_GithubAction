// app/product/[product_slug]/page.tsx
import ProductDetail from "@/components/client/product_detail/ProductDetail";
import { INTERNAL_API } from "@/helper/api";
import { Metadata } from "next";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{ product_slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Fetch chung (tái sử dụng)
async function getProduct(productId: number) {
  const res = await fetch(`${INTERNAL_API}/product/${productId}`, {
    next: { revalidate: 1800 }, // Cache 30 phút - bạn có thể chỉnh
    // cache: "no-store" // chỉ dùng nếu muốn luôn fresh
  });
  console.log(`Status code from API for product ${productId}:`, res.status);

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { product_slug } = await params;
  const match = product_slug?.match(/\.p(\d+)/);
  const productId = match ? Number(match[1]) : null;

  if (!productId) {
    return {
      title: "Sản phẩm không hợp lệ | NEXAMART",
      description: "Không tìm thấy sản phẩm bạn đang tìm.",
    };
  }

  console.log("Generating metadata for product with ID:", productId);
  const data = await getProduct(productId);
  if (!data) {
    return {
      title: "Sản phẩm không tồn tại | NEXAMART",
      robots: { index: false },
    };
  }

  const productName = data.product_name || "";
  const description = (data.description || "").substring(0, 155);

  return {
    title: `${productName} | NEXAMART`,
    description: description,
    keywords: [
      productName,
      data.category_name || "",
      "nexamart",
      "mua sắm online",
      "thời trang",
    ].filter(Boolean),

    alternates: {
      canonical: `https://nexamart.duckdns.org/product/${product_slug}`, // thay domain của bạn
    },

    openGraph: {
      title: productName,
      description: description,
      type: "website", // hoặc "product"
      images:
        data.images?.map((img: any) => ({
          url: img.image_url,
          width: 1200,
          height: 630,
          alt: productName,
        })) || [],
      siteName: "NEXAMART",
      locale: "vi_VN",
    },

    twitter: {
      card: "summary_large_image",
      title: productName,
      description: description,
      images: data.images?.[0]?.image_url ? [data.images[0].image_url] : [],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { product_slug } = await params;
  const match = product_slug?.match(/\.p(\d+)/);
  const productId = match ? Number(match[1]) : null;

  if (!productId) {
    return <h1>Sản phẩm không hợp lệ</h1>;
  }

  console.log("Fetching product with ID:", productId);
  const data = await getProduct(productId);
  console.log("Fetched product data:", data);
  if (!data) {
    return <h1>Không tìm thấy sản phẩm hoặc có lỗi khi tải dữ liệu.</h1>;
  }

  const role = (await cookies()).get("role")?.value;
  const userId = Number((await cookies()).get("user")?.value);

  console.log("User role:", role, "User ID:", userId);

  return <ProductDetail data={data} productSlug={product_slug} />;
}
