import { INTERNAL_API } from "@/helper/api";
import CategoryProductListing from "@/components/client/category_page/CategoryProductListing";
import { filterDistinctAttributes } from "@/helper/utils";
import { Attribute } from "@/validators/attribute";
import { IProduct } from "@/validators/product";
import { cookies } from "next/headers";

interface CategoryItem {
  id: number;
  category_name: string;
  category_slug: string;
  is_active?: number;
}

interface PageProps {
  params: Promise<{
    category_slug: string;
  }>;
}

const normalizeCategoryAttributes = (payload: any): Attribute[] => {
  if (!payload) return [];

  if (Array.isArray(payload) && payload.length > 0 && payload[0]?.attribute) {
    try {
      return filterDistinctAttributes(payload);
    } catch {
      // Continue with generic parser below.
    }
  }

  if (!Array.isArray(payload)) return [];

  return payload
    .map((item: any) => {
      if (item?.name && Array.isArray(item?.values)) {
        return {
          name: String(item.name),
          slug: String(item.slug || item.name)
            .toLowerCase()
            .replace(/\s+/g, "-"),
          data_type: Number(item.data_type || 1),
          values: item.values.map((value: unknown) => String(value)),
        } as Attribute;
      }

      if (item?.attribute?.name && Array.isArray(item?.attribute?.values)) {
        return {
          name: String(item.attribute.name),
          slug: String(item.attribute.slug || item.attribute.name)
            .toLowerCase()
            .replace(/\s+/g, "-"),
          data_type: Number(item.attribute.data_type || 1),
          values: item.attribute.values.map((value: unknown) => String(value)),
        } as Attribute;
      }

      return null;
    })
    .filter((item): item is Attribute => Boolean(item));
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

export default async function CategoryByIndustryPage({ params }: PageProps) {
  const { category_slug } = await params;

  const [categoriesRes, productsRes] = await Promise.all([
    fetch(`${INTERNAL_API}/api/categories`, { cache: "no-store" }),
    fetch(`${INTERNAL_API}/product`, { cache: "no-store" }),
  ]);

  if (!categoriesRes.ok || !productsRes.ok) {
    return (
      <div className="container py-5">
        <h3>Khong the tai du lieu nganh hang.</h3>
      </div>
    );
  }

  const categoriesPayload = await categoriesRes.json();
  const productsPayload = await productsRes.json();

  const categories: CategoryItem[] = Array.isArray(categoriesPayload)
    ? categoriesPayload
    : (categoriesPayload?.data ?? []);

  const products: Partial<IProduct>[] = Array.isArray(productsPayload)
    ? productsPayload
    : (productsPayload?.data ?? []);
  const ownShopId = await getOwnShopId();

  const category = categories.find(
    (item) =>
      item.category_slug === category_slug && Number(item.is_active ?? 1) === 1,
  );

  if (!category) {
    return (
      <div className="container py-5">
        <h3>Nganh hang khong ton tai hoac da an.</h3>
      </div>
    );
  }

  const categoryProducts = products.filter(
    (item) =>
      Number(item.category_id) === Number(category.id) &&
      Number(item.is_active ?? 1) === 1 &&
      (!ownShopId || Number(item.shop_id ?? 0) !== ownShopId),
  );

  let categoryAttributes: Attribute[] = [];
  try {
    const categoryAttrRes = await fetch(
      `${INTERNAL_API}/category-attribute/category/${category.id}`,
      {
        cache: "no-store",
      },
    );

    if (categoryAttrRes.ok) {
      const categoryAttrPayload = await categoryAttrRes.json();
      categoryAttributes = normalizeCategoryAttributes(
        Array.isArray(categoryAttrPayload)
          ? categoryAttrPayload
          : categoryAttrPayload?.data,
      );
    }
  } catch {
    categoryAttributes = [];
  }

  return (
    <CategoryProductListing
      category={category}
      products={categoryProducts}
      categoryAttributes={categoryAttributes}
    />
  );
}
