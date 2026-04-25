// hooks/admin/useCategoryBrands.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/helper/api";

const CATEGORY_BRAND_API_URL = `${API_URL}/api/category-brand`;

export const useCategoryBrands = (categoryId: string) => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["category-brands", categoryId],
    queryFn: async () => {
      const res = await fetch(
        `${CATEGORY_BRAND_API_URL}/category/${categoryId}`,
      );
      return res.json();
    },
    enabled: !!categoryId,
  });

  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["category-brands", categoryId] });

  return {
    categoryBrands: query.data || [],
    isLoading: query.isLoading,
    refresh,
  };
};
