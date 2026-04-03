import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attributesQuery } from "@/query/attributes";
import {
  createAttribute,
  updateAttribute,
  deleteAttribute,
  createAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
} from "@/service/attributes";

export const useAttributes = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery(attributesQuery.all());

  const deleteMutation = useMutation({
    mutationFn: deleteAttribute,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateAttribute(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] }),
  });

  return {
    attributes: data || [],
    isLoading,
    isError,
    refetch,
    deleteAttribute: deleteMutation.mutateAsync,
    updateAttribute: updateMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};

export const useAttributeDetail = (id: string) => {
  const queryClient = useQueryClient();

  const query = useQuery(attributesQuery.detail(id));
  const valuesQuery = useQuery(attributesQuery.values(id));

  // --- Attribute Mutations ---
  const createAttrMutation = useMutation({
    mutationFn: createAttribute,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] }),
  });

  const updateAttrMutation = useMutation({
    mutationFn: (data: any) => updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes", id] });
    },
  });

  // --- Value Mutations ---
  const createValueMutation = useMutation({
    mutationFn: createAttributeValue,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "attributes", id, "values"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] }); // Update count
    },
  });

  const updateValueMutation = useMutation({
    mutationFn: ({ valueId, data }: { valueId: string; data: any }) =>
      updateAttributeValue(valueId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "attributes", id, "values"],
      }),
  });

  const deleteValueMutation = useMutation({
    mutationFn: deleteAttributeValue,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "attributes", id, "values"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] }); // Update count
    },
  });

  return {
    attribute: query.data,
    values: valuesQuery.data || [],
    isLoading: query.isLoading,
    isLoadingValues: valuesQuery.isLoading,
    isError: query.isError || valuesQuery.isError,
    refetch: () => {
      query.refetch();
      valuesQuery.refetch();
    },

    createAttribute: createAttrMutation.mutateAsync,
    updateAttribute: updateAttrMutation.mutateAsync,
    isSaving: createAttrMutation.isPending || updateAttrMutation.isPending,

    createValue: createValueMutation.mutateAsync,
    updateValue: updateValueMutation.mutateAsync,
    deleteValue: deleteValueMutation.mutateAsync,
    isUpdatingValues:
      createValueMutation.isPending ||
      updateValueMutation.isPending ||
      deleteValueMutation.isPending,
  };
};
