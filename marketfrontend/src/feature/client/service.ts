import { API_URL } from "@/helper/api";
import http from "@/lib/http";
import { IOrder } from "@/validators/order";
import { IProduct } from "@/validators/product";
import axios from "axios";

const unwrapApiPayload = <T>(payload: any): T => {
  if (!payload || typeof payload !== "object") return payload as T;

  if (payload.data !== undefined) return payload.data as T;
  if (payload.result !== undefined) return payload.result as T;
  if (payload.content !== undefined) return payload.content as T;

  return payload as T;
};

const normalizeShop = (shop: any) => {
  if (!shop) return null;

  return {
    id: shop.id ?? shop.shop_id ?? 0,
    userId: shop.userId ?? shop.user_id ?? 0,
    shopName: shop.shopName ?? shop.shop_name ?? "",
  };
};

const normalizeProduct = (product: any) => {
  if (!product) return null;

  const normalizedShop = normalizeShop(product.shop);

  return {
    ...product,
    id: product.id ?? product.product_id ?? 0,
    name: product.name ?? product.product_name ?? "",
    stockQuantity: product.stockQuantity ?? product.stock_quantity,
    isActive: product.isActive ?? product.is_active,
    shop: normalizedShop,
  };
};

export const getAllProduct = async (): Promise<Partial<IProduct>> => {
  return http
    .get("/product")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const createOrder = async (orderData: IOrder): Promise<any> => {
  return axios
    .post(`${API_URL}/api/orders`, orderData)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getProductByIdWithShop = async (
  productId: number,
): Promise<any> => {
  return http
    .get(`/product/with-shop/${productId}`)
    .then((res) => normalizeProduct(unwrapApiPayload(res.data)))
    .catch((error) => {
      throw error;
    });
};

export const addBatchCartItems = async (
  cartItems: {
    user_id: number;
    product_id: number;
    variant_id: number;
    quantity: number;
  }[],
): Promise<any> => {
  return http
    .post("/api/cart/batch", cartItems)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const findUserById = async (userId: number): Promise<any> => {
  return http
    .get(`/users/${userId}`)
    .then((res) => {
      // alert("User data: " + JSON.stringify(res.data));
      console.log("User data:", res.data);
      return res.data;
    })
    .catch((error) => {
      throw error;
    });
};
