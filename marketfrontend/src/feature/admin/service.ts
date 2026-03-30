import http from "@/lib/http";
import { IProduct } from "@/validators/product";
<<<<<<< HEAD
=======
import { IOrder } from "@/validators/order";
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5

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
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
