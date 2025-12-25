import { getAllCategory } from "@/service/category";
import { queryOptions } from "@tanstack/react-query";

export const categoryQuery = {
  list: queryOptions({
    queryKey: ["category"],
    queryFn: () => getAllCategory(),
    //    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  }),
};
