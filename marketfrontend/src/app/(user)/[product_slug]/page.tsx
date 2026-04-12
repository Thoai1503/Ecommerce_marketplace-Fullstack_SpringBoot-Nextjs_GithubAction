import ProductDetail from "@/components/client/product_detail/ProductDetail";
import { UserAuthProvider } from "@/context/UserAuthContext";
import { INTERNAL_API } from "@/helper/api";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{
    product_slug: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  console.log("Product Slug:", resolvedParams.product_slug);
  console.log("Product ID:", resolvedSearchParams?.id);

  const match = resolvedParams.product_slug?.match(/\.p(\d+)/);
  const productId = match ? Number(match[1]) : null;

  console.log("Extracted ID:", productId);

  const res = await fetch(`${INTERNAL_API}/product/${productId}`);

  const data = await res.json();
  console.log("API Response Data:", data);
  // const productData = data?.data;
  const role = (await cookies()).get("role")?.value;
  const id = Number((await cookies()).get("user")?.value.toString());
  console.log("User role: " + role);
  console.log("User id: " + id);
  // alert("Product data: " + JSON.stringify(productData));
  if (!res.ok) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return <ProductDetail data={data} />;
}
