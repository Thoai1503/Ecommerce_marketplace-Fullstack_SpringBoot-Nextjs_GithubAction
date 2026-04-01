import http from "@/lib/http";
import { IProduct } from "@/validators/product";
<<<<<<< HEAD
=======
import { IOrder } from "@/validators/order";
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e

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
<<<<<<< HEAD
=======

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
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
