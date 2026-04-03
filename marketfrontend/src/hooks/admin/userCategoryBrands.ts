// hooks/admin/useCategoryBrands.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useCategoryBrands = (categoryId: string) => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["category-brands", categoryId],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:8000/api/category-brand/category/${categoryId}`
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