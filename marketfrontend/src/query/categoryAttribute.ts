import { getAllCategory } from "@/service/category";
import { getByCategoryId } from "@/service/categoryAttribute";
import { queryOptions } from "@tanstack/react-query";

export const categoryAttributeQuery = {
  by_category: (category_id: number) =>
    queryOptions({
      queryKey: ["category-attribute", "category", category_id],
      queryFn: () => getByCategoryId(category_id),
      //    staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }),
};
