import { queryOptions } from "@tanstack/react-query";
import { getAllProduct } from "./service";

export const productQuery = {
  list: queryOptions({
    queryKey: ["client-product"],
    queryFn: () => getAllProduct(),
  }),
};
