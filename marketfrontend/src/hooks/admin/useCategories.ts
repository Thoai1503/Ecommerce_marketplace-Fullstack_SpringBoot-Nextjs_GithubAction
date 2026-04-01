import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesQuery } from "@/query/categories";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/service/categories";
import { Category } from "@/types/index";

export const useCategories = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery(categoriesQuery.all());

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      updateCategory(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });

  return {
    categories: data || [],
    isLoading,
    isError,
    refetch,
    deleteCategory: deleteMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};

export const useCategoryDetail = (id: string) => {
  const queryClient = useQueryClient();

  const query = useQuery(categoriesQuery.detail(id));

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories", id] });
    },
  });

  return {
    category: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
};
