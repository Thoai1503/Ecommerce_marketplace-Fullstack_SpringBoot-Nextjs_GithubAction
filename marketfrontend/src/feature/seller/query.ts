import { queryOptions } from "@tanstack/react-query";
import { getAllCategory, getProductImageByProductId } from "./service";

export const categoryQuery = {
  list: queryOptions({
    queryKey: ["category"],
    queryFn: () => getAllCategory(),
  }),
};

export const productImageQuery = {
  by_product_id: (product_id: number) =>
    queryOptions({
      queryKey: ["product_image", "product_id", product_id],
      queryFn: () => getProductImageByProductId(product_id),
    }),
};
