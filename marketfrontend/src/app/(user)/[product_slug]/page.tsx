// app/product/[product_slug]/page.tsx
import ProductDetail from "@/components/client/product_detail/ProductDetail";
import { INTERNAL_API } from "@/helper/api";
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

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: PageProps) {
  const { product_slug } = await params;
  const match = product_slug?.match(/\.p(\d+)/);
  const productId = match ? Number(match[1]) : null;

  if (!productId) {
    return {
      title: "Sản phẩm không hợp lệ",
      description: "Không tìm thấy sản phẩm.",
    };
  }

  const data = await getProduct(productId);

  return {
    title: data?.product_name || "Sản phẩm không tồn tại",
    description: data?.description || "Chi tiết sản phẩm",
    openGraph: {
      title: data?.product_name,
      description: data?.description,
      images: data?.images ? data.images.map((img: any) => img.image_url) : [],
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

  const data = await getProduct(productId);

  if (!data) {
    return <h1>Không tìm thấy sản phẩm hoặc có lỗi khi tải dữ liệu.</h1>;
  }

  const role = (await cookies()).get("role")?.value;
  const userId = Number((await cookies()).get("user")?.value);

  return <ProductDetail data={data} />;
}
