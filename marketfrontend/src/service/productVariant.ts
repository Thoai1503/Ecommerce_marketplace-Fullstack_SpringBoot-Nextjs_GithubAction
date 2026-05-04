import http from '../lib/http';
import { ProductVariant } from '@/types/index';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

type VariantBody = Partial<ProductVariant> & Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapVariant = (variant: any): ProductVariant => ({
  id: Number(variant.id ?? variant.variant_id),
  sku: variant.sku ?? undefined,
  variantName: variant.variantName ?? variant.variant_name ?? undefined,
  price: variant.price ?? undefined,
  stockQuantity: variant.stockQuantity ?? variant.stock_quantity ?? undefined,
  attributes: variant.attributes ?? undefined,
});

const toApiBody = (body: Partial<ProductVariant>): Record<string, unknown> => {
  const source = body as VariantBody;

  return {
    variant_name: source.variant_name ?? body.variantName,
    sku: body.sku,
    price: body.price,
    stock_quantity: source.stock_quantity ?? body.stockQuantity,
    image_url: source.image_url ?? source.imageUrl,
    weight: source.weight,
    length: source.length,
    width: source.width,
    height: source.height,
  };
};

export const getVariantsByProduct = async (productId: string | number): Promise<ProductVariant[]> => {
  if (USE_MOCK) return [];

  const res = await http.get(`/admin/products/${productId}/variants`);
  const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  return list.map(mapVariant);
};

export const createVariant = async (
  productId: string | number,
  body: Partial<ProductVariant>,
): Promise<ProductVariant> => {
  const res = await http.post(`/admin/products/${productId}/variants`, toApiBody(body));
  return mapVariant(res.data);
};

export const updateVariant = async (
  productId: string | number,
  variantId: number,
  body: Partial<ProductVariant>,
): Promise<ProductVariant> => {
  const res = await http.put(`/admin/products/${productId}/variants/${variantId}`, toApiBody(body));
  return mapVariant(res.data);
};

export const toggleVariant = async (
  productId: string | number,
  variantId: number,
): Promise<ProductVariant> => {
  const res = await http.patch(`/admin/products/${productId}/variants/${variantId}/toggle`, {});
  return mapVariant(res.data);
};

export const deleteVariant = async (productId: string | number, variantId: number): Promise<void> => {
  await http.delete(`/admin/products/${productId}/variants/${variantId}`);
};
