import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesQuery } from "@/query/categories";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/service/categories";

import { Category } from "@/types";

export const useCategories = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery(categoriesQuery.all());

  /* DELETE */

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });
    },
  });

  /* UPDATE */

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      updateCategory(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });
    },
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

/* ============================= */
/* CATEGORY DETAIL               */
/* ============================= */

export const useCategoryDetail = (id: string) => {
  const queryClient = useQueryClient();

  const query = useQuery(categoriesQuery.detail(id));

  /* CREATE */

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });
    },
  });

  /* UPDATE */

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateCategory(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", id],
      });
    },
  });

  /* DELETE */

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });
    },
  });

  return {
    category: query.data,

    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,

    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,

    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
