
import http from '@/lib/http';
import { Product, ProductStatus } from '@/types/index';

const FALLBACK_PRODUCT_IMAGE = '/image/no-image.png';
const FALLBACK_SELLER_AVATAR = '/image/user/avatar_default.jpg';
const unwrapCollection = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;
  const collection = record.data || record.items || record.content || record.results;
  return Array.isArray(collection) ? collection as Record<string, unknown>[] : [];
};

const toNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return undefined;
  return toNumber(value);
};

const toText = (value: unknown, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const getImageUrls = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((image) => {
        if (typeof image === 'string') return image;
        if (image && typeof image === 'object') {
          return toText((image as Record<string, unknown>).image_url);
        }
        return '';
      })
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      return getImageUrls(JSON.parse(value));
    } catch {
      return [value];
    }
  }

  return [];
};

const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return toText(value).trim() === '1' || toText(value).trim().toLowerCase() === 'true';
};

const getApprovalStatus = (isActive: boolean, rejectReason: string): ProductStatus => {
  if (isActive) return 'APPROVED';
  return rejectReason ? 'REJECTED' : 'PENDING';
};

const buildProductCode = (id: string) => `PRD-${id.padStart(4, '0')}`;

const mapAdminProduct = (raw: Record<string, unknown>): Product => {
  const id = toText(raw.id);
  const images = getImageUrls(raw.images);
  const thumbnail = toText(raw.image_url);
  const isActive = toBoolean(raw.is_active);
  const rejectReason = toText(raw.reject_reason);

  return {
    id,
    productCode: buildProductCode(id),
    name: toText(raw.product_name, 'Sản phẩm chưa đặt tên'),
    description: toText(raw.description),
    sku: toText(raw.sku, toText(raw.product_slug, buildProductCode(id))),
    images: images.length > 0 ? images : [thumbnail || FALLBACK_PRODUCT_IMAGE],
    category: toText(raw.category_name, 'Chưa phân loại'),
    price: toNumber(raw.price),
    originalPrice: toOptionalNumber(raw.original_price),
    stock: toNumber(raw.stock_quantity),
    status: getApprovalStatus(isActive, rejectReason),
    isActive,
    sellerId: toText(raw.shop_id),
    sellerName: toText(raw.shop_name, 'Shop chưa đặt tên'),
    sellerAvatar: toText(raw.shop_logo, FALLBACK_SELLER_AVATAR),
    sellerEmail: toText(raw.shop_email) || undefined,
    sellerPhone: toText(raw.shop_phone) || undefined,
    createdAt: toText(raw.created_at, new Date(0).toISOString()),
    rejectReason: rejectReason || undefined,
    soldCount: toNumber(raw.sold_count),
  };
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await http.get('/api/admin/products');
  return unwrapCollection(response.data).map(mapAdminProduct);
};

export const getProductsBySellerId = async (sellerId: string): Promise<Product[]> => {
  const response = await http.get('/api/admin/products', {
    params: { shopId: sellerId },
  });
  return unwrapCollection(response.data).map(mapAdminProduct);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const response = await http.get(`/api/admin/products/${id}`);
  return response.data ? mapAdminProduct(response.data as Record<string, unknown>) : undefined;
};

export const deleteProducts = async (ids: string[]): Promise<boolean> => {
  await Promise.all(ids.map((id) => http.delete(`/api/admin/products/${id}`)));
  return true;
};

export const approveProduct = async (id: string): Promise<boolean> => {
  await http.put(`/api/admin/products/${id}/approve`);
  return true;
};

export const rejectProduct = async (id: string, reason: string): Promise<boolean> => {
  await http.put(`/api/admin/products/${id}/reject`, { reason });
  return true;
};

export const updateProductActive = async (id: string, isActive: boolean): Promise<boolean> => {
  await http.patch(`/api/admin/products/${id}/active`, { is_active: isActive ? 1 : 0 });
  return true;
};
