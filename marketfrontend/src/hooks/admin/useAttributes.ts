// src/hooks/admin/useAttributes.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attributesQuery } from "@/query/attributes";
import {
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute
} from '@/service/attributes';

// ================= LIST =================
export const useAttributes = () => {
  const queryClient = useQueryClient();

  const query = useQuery(attributesQuery.all());

  const deleteMutation = useMutation({
    mutationFn: deleteAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attributes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attributes'] });
    },
  });

  return {
    attributes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,

    deleteAttribute: deleteMutation.mutateAsync,
    updateAttribute: updateMutation.mutateAsync,

    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};

// ================= DETAIL =================
export const useAttributeDetail = (id: string) => {
  const queryClient = useQueryClient();

  // 🔥 GET DETAIL
  const query = useQuery({
    queryKey: ['admin', 'attributes', id],
    queryFn: () => getAttributeById(id),
    enabled: !!id,
  });

  // 🔥 CREATE
  const createMutation = useMutation({
    mutationFn: createAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attributes'] });
    },
  });

  // 🔥 UPDATE
  const updateMutation = useMutation({
    mutationFn: (data: any) => updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attributes'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'attributes', id] });
    },
  });

  return {
    attribute: query.data,
    isLoading: query.isLoading,
    isError: query.isError,

    createAttribute: createMutation.mutateAsync,
    updateAttribute: updateMutation.mutateAsync,

    isSaving: createMutation.isPending || updateMutation.isPending,
  };
};