import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerProductById,
  getSellerProducts,
  resubmitProductForApproval,
  SellerProductPayload,
  SellerProductsFilters,
  updateSellerProduct,
} from "@/service/sellerProducts";

export const sellerProductsKeys = {
  all: ["seller", "products"] as const,
  list: (filters?: SellerProductsFilters) =>
    ["seller", "products", "list", filters] as const,
  detail: (id?: string) => ["seller", "products", "detail", id] as const,
};

export const useSellerProducts = (filters?: SellerProductsFilters) => {
  return useQuery({
    queryKey: sellerProductsKeys.list(filters),
    queryFn: () => getSellerProducts(filters),
  });
};

export const useSellerProductDetail = (id?: string) => {
  return useQuery({
    queryKey: sellerProductsKeys.detail(id),
    queryFn: () => getSellerProductById(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateSellerProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SellerProductPayload) => createSellerProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerProductsKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

export const useUpdateSellerProduct = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SellerProductPayload) => updateSellerProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerProductsKeys.all });
      queryClient.invalidateQueries({ queryKey: sellerProductsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

export const useDeleteSellerProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSellerProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerProductsKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

export const useResubmitProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resubmitProductForApproval(id),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: sellerProductsKeys.all });
      queryClient.invalidateQueries({ queryKey: sellerProductsKeys.detail(product.id) });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};
