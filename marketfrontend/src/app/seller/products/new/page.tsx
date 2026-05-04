"use client";

import { useRouter } from "next/navigation";
import ProductForm from "../ProductForm";
import { useToast } from "@/context/ToastContext";
import { useCreateSellerProduct } from "@/hooks/seller/useSellerProducts";
import {
  extractSellerProductError,
  SellerProductPayload,
} from "@/service/sellerProducts";

export default function NewSellerProductPage() {
  const router = useRouter();
  const toast = useToast();
  const createMutation = useCreateSellerProduct();

  const handleSubmit = async (payload: SellerProductPayload) => {
    try {
      const product = await createMutation.mutateAsync(payload);
      toast.success("Da gui san pham cho admin duyet");
      router.push(`/seller/products/${product.id}`);
    } catch (error) {
      toast.error(extractSellerProductError(error));
    }
  };

  return (
    <ProductForm
      title="Them san pham"
      submitLabel="Gui duyet"
      draftKey="seller-products-new-draft"
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
