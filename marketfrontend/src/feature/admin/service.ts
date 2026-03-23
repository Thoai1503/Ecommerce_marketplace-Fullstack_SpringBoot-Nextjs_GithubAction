import http from "@/lib/http";
import { IProduct } from "@/validators/product";
import { IOrder } from "@/validators/order";

export const getProductByShopId = async (
  shop_id: number,
): Promise<Partial<IProduct>[]> => {
  return await http
    .get(`/seller/product/shop/${shop_id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getOrderByShopId = async (
  shop_id: number,
): Promise<Partial<IOrder>[]> => {
  return await http
    .get(`/seller/order/shop/${shop_id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
