import { queryOptions } from "@tanstack/react-query";
import {
  getAllCategory,
  getCategoryProductOptions,
  getProductImageByProductId,
} from "./service";

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

export const categoryProductOptionsQuery = {
  by_category_id: (category_id: number) =>
    queryOptions({
      queryKey: ["seller", "category-product-options", category_id],
      queryFn: () => getCategoryProductOptions(category_id),
    }),
};
