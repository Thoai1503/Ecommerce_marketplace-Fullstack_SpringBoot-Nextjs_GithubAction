import http from "@/lib/http";
import { IProduct } from "@/validators/product";

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
