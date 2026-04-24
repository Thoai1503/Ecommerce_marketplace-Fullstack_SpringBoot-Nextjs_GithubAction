import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { unitsQuery } from "@/query/units";
import { createUnit, updateUnit, deleteUnit } from "@/service/units";
import { Unit } from "@/types/index";

export const useUnits = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery(unitsQuery.all());

  const createMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "units"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Unit> }) =>
      updateUnit(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "units"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "units"] }),
  });

  return {
    units: data || [],
    isLoading,
    isError,
    refetch,
    createUnit: createMutation.mutateAsync,
    updateUnit: updateMutation.mutateAsync,
    deleteUnit: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
};

export const useUnitDetail = (id: string) => {
  const queryClient = useQueryClient();

  const query = useQuery(unitsQuery.detail(id));

  const createMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "units"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "units"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "units", id] });
    },
  });

  return {
    unit: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createUnit: createMutation.mutateAsync,
    updateUnit: updateMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
};
