"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import ProductForm from "../../ProductForm";
import { useToast } from "@/context/ToastContext";
import {
  useResubmitProduct,
  useSellerProductDetail,
  useUpdateSellerProduct,
} from "@/hooks/seller/useSellerProducts";
import {
  extractSellerProductError,
  SellerProductPayload,
} from "@/service/sellerProducts";

export default function EditSellerProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const id = params.id;
  const { data: product, isLoading, isError, refetch } = useSellerProductDetail(id);
  const updateMutation = useUpdateSellerProduct(id);
  const resubmitMutation = useResubmitProduct();

  const handleSubmit = async (payload: SellerProductPayload) => {
    try {
      const updated = await updateMutation.mutateAsync(payload);
      if (product?.status === "REJECTED") {
        await resubmitMutation.mutateAsync(updated.id);
        toast.success("Da cap nhat va gui duyet lai");
      } else {
        toast.success("Da cap nhat san pham");
      }
      router.push(`/seller/products/${updated.id}`);
    } catch (error) {
      toast.error(extractSellerProductError(error));
    }
  };

  if (isLoading) {
    return <div className="container-fluid py-5 text-center text-muted">Dang tai san pham...</div>;
  }

  if (isError || !product) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="fw-semibold text-danger mb-3">Khong tai duoc san pham</div>
        <button className="btn btn-outline-secondary" onClick={() => refetch()}>
          Thu lai
        </button>
      </div>
    );
  }

  if (product.status === "APPROVED" || product.status === "HIDDEN") {
    return (
      <div className="container-fluid py-4">
        <Link href={`/seller/products/${product.id}`} className="btn btn-link px-0 text-decoration-none mb-3">
          <ArrowLeft size={16} className="me-1" />
          Quay lai chi tiet
        </Link>
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-5 text-center">
            <Lock size={36} className="text-muted mb-3" />
            <h1 className="h4 fw-bold">Khong the sua san pham nay</h1>
            <p className="text-muted mb-4">
              Seller chi duoc sua san pham dang cho duyet hoac bi tu choi.
            </p>
            <Link href={`/seller/products/${product.id}`} className="btn btn-outline-secondary">
              Xem chi tiet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProductForm
      title={product.status === "REJECTED" ? "Sua va gui duyet lai" : "Sua san pham"}
      submitLabel={product.status === "REJECTED" ? "Luu & gui duyet lai" : "Luu thay doi"}
      draftKey={`seller-products-${id}-edit-draft`}
      initialProduct={product}
      isSubmitting={updateMutation.isPending || resubmitMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
