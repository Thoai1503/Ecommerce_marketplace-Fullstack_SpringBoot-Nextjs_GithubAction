"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Edit3,
  Package,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import {
  useDeleteSellerProduct,
  useResubmitProduct,
  useSellerProductDetail,
} from "@/hooks/seller/useSellerProducts";
import {
  extractSellerProductError,
  SellerProductStatus,
} from "@/service/sellerProducts";

const statusConfig: Record<SellerProductStatus, { label: string; className: string; icon: ReactNode; note: string }> = {
  PENDING: {
    label: "Cho duyet",
    className: "text-bg-warning",
    icon: <AlertCircle size={14} />,
    note: "San pham dang cho admin duyet. Ban van co the sua khi dang cho duyet.",
  },
  APPROVED: {
    label: "Dang ban",
    className: "text-bg-success",
    icon: <CheckCircle size={14} />,
    note: "San pham da duoc duyet va dang hien thi. Seller khong the sua/xoa truc tiep.",
  },
  REJECTED: {
    label: "Tu choi",
    className: "text-bg-danger",
    icon: <XCircle size={14} />,
    note: "San pham bi tu choi. Hay sua theo ly do va gui duyet lai.",
  },
  HIDDEN: {
    label: "Da an",
    className: "text-bg-secondary",
    icon: <Package size={14} />,
    note: "San pham dang bi an.",
  },
};

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function SellerProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const id = params.id;
  const { data: product, isLoading, isError, refetch } = useSellerProductDetail(id);
  const deleteMutation = useDeleteSellerProduct();
  const resubmitMutation = useResubmitProduct();

  const handleDelete = async () => {
    if (!product || product.status === "APPROVED") return;
    if (!window.confirm(`An san pham "${product.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(product.id);
      toast.success("Da an san pham");
      router.push("/seller/products");
    } catch (error) {
      toast.error(extractSellerProductError(error));
    }
  };

  const handleResubmit = async () => {
    if (!product || product.status !== "REJECTED") return;
    try {
      await resubmitMutation.mutateAsync(product.id);
      toast.success("Da gui duyet lai, cho admin xem xet");
      refetch();
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
        <div className="fw-semibold text-danger mb-3">Khong tai duoc chi tiet san pham</div>
        <button className="btn btn-outline-secondary" onClick={() => refetch()}>
          Thu lai
        </button>
      </div>
    );
  }

  const status = statusConfig[product.status];
  const canEdit = product.status === "PENDING" || product.status === "REJECTED";
  const canDelete = product.status !== "APPROVED";

  return (
    <div className="container-fluid py-4">
      <Link href="/seller/products" className="btn btn-link px-0 text-decoration-none mb-3">
        <ArrowLeft size={16} className="me-1" />
        Quay lai danh sach
      </Link>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
                <div>
                  <h1 className="h3 fw-bold mb-2">{product.name}</h1>
                  <div className="text-muted">#{product.sku || product.slug || product.id}</div>
                </div>
                <span className={`badge d-inline-flex align-items-center gap-1 ${status.className}`}>
                  {status.icon}
                  {status.label}
                </span>
              </div>

              <p className="text-muted mb-4">{status.note}</p>

              {product.status === "REJECTED" && (
                <div className="alert alert-danger">
                  <div className="fw-bold">Ly do tu choi</div>
                  <div>{product.rejectReason || "Admin chua nhap ly do."}</div>
                </div>
              )}

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="small text-muted">Gia ban</div>
                    <div className="h5 mb-0 fw-bold">{money(product.price)}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="small text-muted">Gia goc</div>
                    <div className="h5 mb-0 fw-bold">{money(product.originalPrice)}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="small text-muted">Ton kho</div>
                    <div className="h5 mb-0 fw-bold">{product.stock}</div>
                  </div>
                </div>
              </div>

              <h2 className="h6 fw-bold">Mo ta</h2>
              <p className="text-muted whitespace-pre-wrap">{product.description || "Chua co mo ta."}</p>

              <h2 className="h6 fw-bold mt-4">Logistics</h2>
              <div className="row g-2">
                {[
                  ["Weight", product.weight],
                  ["Length", product.length],
                  ["Width", product.width],
                  ["Height", product.height],
                ].map(([label, value]) => (
                  <div className="col-6 col-md-3" key={label}>
                    <div className="border rounded-3 p-3">
                      <div className="small text-muted">{label}</div>
                      <div className="fw-semibold">{value ?? "-"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-3 mt-4">
            <div className="card-body p-4">
              <h2 className="h6 fw-bold mb-3">Variants</h2>
              {product.variants.length === 0 ? (
                <div className="text-muted">Chua co bien the.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Ten</th>
                        <th>Gia</th>
                        <th>Kho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant) => (
                        <tr key={variant.id}>
                          <td>{variant.sku || "-"}</td>
                          <td>{variant.name || "-"}</td>
                          <td>{money(variant.price ?? 0)}</td>
                          <td>{variant.stock ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="row g-2">
                {product.images.length === 0 ? (
                  <div className="col-12">
                    <div className="border rounded-3 bg-light d-flex align-items-center justify-content-center py-5 text-muted">
                      <Package size={24} className="me-2" />
                      Chua co anh
                    </div>
                  </div>
                ) : (
                  product.images.map((url) => (
                    <div className="col-6" key={url}>
                      <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
                        <img src={url} alt="" className="w-100 h-100 object-fit-cover" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-3 mt-4">
            <div className="card-body p-4 d-grid gap-2">
              <Link
                className={`btn ${canEdit ? "btn-primary" : "btn-outline-secondary disabled"}`}
                href={canEdit ? `/seller/products/${product.id}/edit` : "#"}
                title={canEdit ? "Sua san pham" : "Khong the sua san pham da duoc duyet"}
              >
                <Edit3 size={16} className="me-2" />
                {product.status === "REJECTED" ? "Sua & gui duyet lai" : "Sua san pham"}
              </Link>
              {product.status === "REJECTED" && (
                <button className="btn btn-warning" onClick={handleResubmit} disabled={resubmitMutation.isPending}>
                  <RefreshCw size={16} className="me-2" />
                  Gui duyet lai
                </button>
              )}
              <button
                className="btn btn-outline-danger"
                onClick={handleDelete}
                disabled={!canDelete || deleteMutation.isPending}
                title={canDelete ? "An san pham" : "Khong the xoa san pham da duoc duyet"}
              >
                <Trash2 size={16} className="me-2" />
                An san pham
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
