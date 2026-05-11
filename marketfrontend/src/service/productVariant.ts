import http from "@/lib/http";

const unwrapApiPayload = <T>(payload: any): T => {
  if (!payload || typeof payload !== "object") return payload as T;

  if (payload.data !== undefined) return payload.data as T;
  if (payload.result !== undefined) return payload.result as T;
  if (payload.content !== undefined) return payload.content as T;

  return payload as T;
};

const normalizeVariant = (variant: any) => {
  if (!variant) return null;

  return {
    ...variant,
    id: variant.id ?? variant.variant_id ?? 0,
    productId: variant.productId ?? variant.product_id,
    variantName: variant.variantName ?? variant.variant_name ?? "",
    stockQuantity: variant.stockQuantity ?? variant.stock_quantity ?? 0,
    isActive: variant.isActive ?? variant.is_active ?? variant.active,
    imageUrl: variant.imageUrl ?? variant.image_url ?? "",
  };
};

export const getProductVariantById = async (id: number): Promise<any> => {
  return http
    .get(`/product-variant/${id}`)
    .then((res) => normalizeVariant(unwrapApiPayload(res.data)))
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
