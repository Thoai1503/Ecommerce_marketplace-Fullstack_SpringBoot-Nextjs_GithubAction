import http from "@/lib/http";
import { IProduct } from "@/validators/product";
import { IOrder } from "@/validators/order";

const unwrapCollection = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const candidates = [
    record.data,
    record.items,
    record.content,
    record.results,
    record.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[];
  }

  return [];
};

export const getProductByShopId = async (
  shop_id: number,
): Promise<Partial<IProduct>[]> => {
  return await http
    .get(`/seller/product/shop/${shop_id}`)
    .then((res) => unwrapCollection<Partial<IProduct>>(res.data))
    .catch((error) => {
      throw error;
    });
};

export const getOrderByShopId = async (
  shop_id: number,
): Promise<Partial<IOrder>[]> => {
  return await http
    .get(`/seller/order/shop/${shop_id}`)
    .then((res) => unwrapCollection<Partial<IOrder>>(res.data))
    .catch((error) => {
      throw error;
    });
};