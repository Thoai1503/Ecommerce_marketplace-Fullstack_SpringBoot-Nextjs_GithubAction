import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/service/brands";

export const useBrands = () => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const create = useMutation({
    mutationFn: createBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: any) => updateBrand(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  const remove = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  return {
    brands: query.data || [],
    isLoading: query.isLoading,

    createBrand: create.mutateAsync,
    updateBrand: update.mutateAsync,
    deleteBrand: remove.mutateAsync,
  };
};