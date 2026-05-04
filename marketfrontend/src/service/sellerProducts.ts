import axios from "axios";
import http from "@/lib/http";

export type SellerProductStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

export interface SellerProductVariant {
  id: string;
  sku?: string;
  name?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
}

export interface SellerProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  originalPrice: number;
  stock: number;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  status: SellerProductStatus;
  rejectReason?: string | null;
  images: string[];
  variants: SellerProductVariant[];
  shopId: string;
  shopName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SellerProductsFilters {
  status?: SellerProductStatus | "ALL";
  search?: string;
  categoryId?: string | number;
  page?: number;
  size?: number;
}

export interface SellerProductsMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface SellerProductsResponse {
  data: SellerProduct[];
  meta: SellerProductsMeta;
  message?: string;
}

export interface SellerProductPayload {
  name: string;
  description?: string;
  categoryId: string | number;
  price: number;
  originalPrice: number;
  stock: number;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  images?: string[];
}

type BackendRecord = Record<string, unknown>;

const normalizeStatus = (value: unknown): SellerProductStatus => {
  if (typeof value === "number") {
    if (value === 1) return "APPROVED";
    if (value === 3) return "REJECTED";
    if (value === 0) return "HIDDEN";
    return "PENDING";
  }

  const status = String(value ?? "PENDING").toUpperCase();
  if (status === "ACTIVE") return "APPROVED";
  if (status === "INACTIVE" || status === "DRAFT") return "HIDDEN";
  if (status === "PENDING_APPROVAL") return "PENDING";
  if (status === "APPROVED" || status === "REJECTED" || status === "HIDDEN") return status;
  return "PENDING";
};

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapImages = (images: any): string[] => {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => {
      if (typeof img === "string") return img;
      return img?.image_url ?? img?.imageUrl ?? img?.url ?? "";
    })
    .filter(Boolean);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProduct = (p: any): SellerProduct => ({
  id: String(p.id),
  name: p.name ?? p.productName ?? p.product_name ?? "",
  slug: p.slug ?? p.product_slug ?? "",
  sku: p.sku ?? p.product_slug ?? p.slug ?? "",
  description: p.description ?? "",
  categoryId: String(p.categoryId ?? p.category_id ?? p.category ?? ""),
  categoryName: p.categoryName ?? p.category_name ?? undefined,
  price: toNumber(p.price),
  originalPrice: toNumber(p.originalPrice ?? p.original_price ?? p.price),
  stock: toNumber(p.stock ?? p.stock_quantity),
  weight: p.weight ?? null,
  length: p.length ?? null,
  width: p.width ?? null,
  height: p.height ?? null,
  status: normalizeStatus(p.status ?? p.isActive ?? p.is_active),
  rejectReason: p.rejectReason ?? p.reject_reason ?? null,
  images: mapImages(p.images),
  variants: Array.isArray(p.variants)
    ? (p.variants as BackendRecord[]).map((v) => ({
        id: String(v.id ?? ""),
        sku: typeof v.sku === "string" ? v.sku : undefined,
        name: typeof v.name === "string" ? v.name : typeof v.variant_name === "string" ? v.variant_name : undefined,
        price: toNumber(v.price),
        stock: toNumber(v.stock ?? v.stock_quantity),
        imageUrl: typeof v.imageUrl === "string" ? v.imageUrl : typeof v.image_url === "string" ? v.image_url : undefined,
      }))
    : [],
  shopId: String(p.shopId ?? p.shop_id ?? p.sellerId ?? ""),
  shopName: p.shopName ?? p.shop_name ?? p.sellerName ?? undefined,
  createdAt: p.createdAt ?? p.created_at,
  updatedAt: p.updatedAt ?? p.updated_at,
});

const toBackendPayload = (payload: SellerProductPayload) => ({
  name: payload.name,
  description: payload.description,
  categoryId: Number(payload.categoryId),
  price: payload.price,
  originalPrice: payload.originalPrice,
  stock: payload.stock,
  weight: payload.weight,
  length: payload.length,
  width: payload.width,
  height: payload.height,
  images: payload.images ?? [],
});

export const extractSellerProductError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string") return data;
    if (typeof data?.message === "string") return data.message;
    if (data?.errors && typeof data.errors === "object") {
      return Object.values(data.errors).join(", ");
    }
  }
  return error instanceof Error ? error.message : "Thao tac san pham that bai";
};

export const getSellerProducts = async (
  filters?: SellerProductsFilters,
): Promise<SellerProductsResponse> => {
  const res = await http.get("/seller/products", { params: filters });
  const body = res.data;
  const list = Array.isArray(body) ? body : body?.data ?? [];

  return {
    data: list.map(mapProduct),
    message: body?.message,
    meta: {
      page: Number(body?.meta?.page ?? filters?.page ?? 0),
      size: Number(body?.meta?.size ?? filters?.size ?? list.length ?? 20),
      total: Number(body?.meta?.total ?? list.length ?? 0),
      totalPages: Number(body?.meta?.totalPages ?? 1),
    },
  };
};

export const getSellerProductById = async (id: string): Promise<SellerProduct> => {
  const res = await http.get(`/seller/products/${id}`);
  return mapProduct(res.data?.data ?? res.data);
};

export const createSellerProduct = async (
  payload: SellerProductPayload,
): Promise<SellerProduct> => {
  const res = await http.post("/seller/products", toBackendPayload(payload));
  return mapProduct(res.data?.data ?? res.data);
};

export const updateSellerProduct = async (
  id: string,
  payload: SellerProductPayload,
): Promise<SellerProduct> => {
  const res = await http.put(`/seller/products/${id}`, toBackendPayload(payload));
  return mapProduct(res.data?.data ?? res.data);
};

export const deleteSellerProduct = async (id: string): Promise<boolean> => {
  await http.delete(`/seller/products/${id}`);
  return true;
};

export const resubmitProductForApproval = async (id: string): Promise<SellerProduct> => {
  const res = await http.post(`/seller/products/${id}/resubmit`);
  return mapProduct(res.data?.data ?? res.data);
};
