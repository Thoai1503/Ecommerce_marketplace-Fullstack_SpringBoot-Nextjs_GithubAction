import { queryOptions } from "@tanstack/react-query";
import { getAllProduct, getProductByIdWithShop } from "./service";

export const productQuery = {
  list: queryOptions({
    queryKey: ["client-product"],
    queryFn: () => getAllProduct(),
  }),
  detail_with_shop: (productId: number) => ({
    queryKey: ["client-product", productId],
    queryFn: () => getProductByIdWithShop(productId),
  }),
};
