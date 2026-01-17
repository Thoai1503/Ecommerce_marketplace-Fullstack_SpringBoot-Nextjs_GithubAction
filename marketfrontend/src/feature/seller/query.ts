import { queryOptions } from "@tanstack/react-query";
import { getAllCategory } from "./service";

export const categoryQuery = {
  list: queryOptions({
    queryKey: ["category"],
    queryFn: () => getAllCategory(),
  }),
};
