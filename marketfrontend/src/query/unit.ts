import { getAllUnit } from "@/service/unit";
import { queryOptions } from "@tanstack/react-query";

export const unitsQuery = {
  list: queryOptions({
    queryKey: ["unit"],
    queryFn: () => getAllUnit(),
    //    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  }),
};
