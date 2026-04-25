
import http from "@/lib/http";
import { Product, ProductStatus } from "@/types/index";

// Map is_active number → ProductStatus string
const mapStatus = (is_active: number): ProductStatus => {
  switch (is_active) {
    case 1: return "APPROVED";
    case 2: return "PENDING";
    case 3: return "REJECTED";
    case 0: return "HIDDEN";
    default: return "PENDING";
  }
};

// Backend accepts one of: APPROVED | PENDING | REJECTED | HIDDEN

// Map backend product object → frontend Product shape
// Keeps all existing frontend fields intact so no component needs to change
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProduct = (p: any): Product => ({
  id: String(p.id),
  productCode: p.product_slug ?? `PRD-${p.id}`,
  name: p.product_name ?? p.name ?? "",
  description: p.description ?? "",
  sku: p.sku ?? "",
  images: Array.isArray(p.images)
    ? p.images.map((img: { image_url: string }) => img.image_url)
    : p.image_url
    ? [p.image_url]
    : [],
  category: String(p.category_id ?? p.category ?? ""),
  price: p.price ?? 0,
  originalPrice: p.original_price ?? undefined,
  stock: p.stock_quantity ?? p.stock ?? 0,
  status: mapStatus(p.is_active),
  sellerId: String(p.shop_id ?? p.sellerId ?? ""),
  sellerName: p.sellerName ?? p.shop_name ?? "",
  sellerAvatar: p.sellerAvatar ?? undefined,
  attributes: p.attributes ?? undefined,
  createdAt: p.created_at ?? p.createdAt ?? new Date().toISOString(),
  rejectReason: p.reject_reason ?? p.rejectReason ?? undefined,
  viewCount: p.viewCount ?? 0,
});

export const getProducts = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}): Promise<Product[]> => {
  return await http
    .get("/admin/products", { params })
    .then((res) => {
      const body = res.data;
      const list = Array.isArray(body) ? body : (body.data ?? []);
      return list.map(mapProduct);
    })
    .catch((error) => {
      throw error;
    });
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  return await http
    .get(`/admin/products/${id}`)
    .then((res) => mapProduct(res.data))
    .catch((error) => {
      throw error;
    });
};

export const deleteProducts = async (ids: string[]): Promise<boolean> => {
  for (const id of ids) {
    await http.delete(`/admin/products/${id}`);
  }
  return true;
};

export const approveProduct = async (id: string): Promise<boolean> => {
  return await http
    .patch(`/admin/products/${id}/approve`)
    .then(() => true)
    .catch((error) => {
      throw error;
    });
};

export const rejectProduct = async (id: string, reason: string): Promise<boolean> => {
  return await http
    .patch(`/admin/products/${id}/reject`, { reason })
    .then(() => true)
    .catch((error) => {
      throw error;
    });
};

export const duplicateProduct = async (product: Product): Promise<Product> => {
  // Backend chưa có endpoint duplicate → fallback tạo mới từ dữ liệu cũ
  return await http
    .post("/admin/products", {
      product_name: `${product.name} (Copy)`,
      description: product.description,
      price: product.price,
      original_price: product.originalPrice,
      stock_quantity: product.stock,
      category_id: Number(product.category),
      shop_id: Number(product.sellerId),
    })
    .then((res) => mapProduct(res.data))
    .catch((error) => {
      throw error;
    });
};

export const updateProductStatus = async (id: string, status: ProductStatus): Promise<boolean> => {
  return await http
    .patch(`/admin/products/${id}/status`, { status })
    .then(() => true)
    .catch((error) => {
      throw error;
    });
};

// --- Create / Update payload shape (matches AdminProductCreateRequest / Product fields) ---
export interface ProductPayload {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  category: string | number;
  sellerId?: string | number;
  status?: ProductStatus;
  images?: string[];
}

const toBackendCreate = (data: ProductPayload) => ({
  product_name: data.name,
  description: data.description,
  price: data.price,
  original_price: data.originalPrice,
  stock_quantity: data.stock,
  category_id: Number(data.category),
  shop_id: data.sellerId !== undefined ? Number(data.sellerId) : undefined,
  status: data.status,
  images: data.images,
});

const toBackendUpdate = (data: Partial<ProductPayload>) => ({
  product_name: data.name,
  description: data.description,
  price: data.price,
  original_price: data.originalPrice,
  stock_quantity: data.stock,
  category_id: data.category !== undefined ? Number(data.category) : undefined,
  is_active: data.status
    ? (data.status === "APPROVED" ? 1 : data.status === "HIDDEN" ? 0 : data.status === "REJECTED" ? 3 : 2)
    : undefined,
  images: data.images,
});

export const createProduct = async (payload: ProductPayload): Promise<Product> => {
  return await http
    .post("/admin/products", toBackendCreate(payload))
    .then((res) => mapProduct(res.data))
    .catch((error) => {
      throw error;
    });
};

export const updateProduct = async (id: string, payload: Partial<ProductPayload>): Promise<Product> => {
  return await http
    .put(`/admin/products/${id}`, toBackendUpdate(payload))
    .then((res) => mapProduct(res.data))
    .catch((error) => {
      throw error;
    });
};
