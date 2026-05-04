"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle,
  Eye,
  EyeOff,
  Filter,
  Lock,
  Package,
  RotateCcw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import RejectProductModal from "@/components/admin/products/RejectProductModal";
import HideProductModal from "@/components/admin/products/HideProductModal";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import { useProducts } from "@/hooks/admin/useProducts";
import { Product, ProductStatus } from "@/types";

const statusConfig: Record<ProductStatus, { label: string; className: string; icon: ReactNode }> = {
  DRAFT: { label: "Nháp", className: "bg-gray-500 text-white border-gray-600 shadow-sm", icon: <Package size={14} /> },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-500 text-white border-amber-600 shadow-sm", icon: <AlertCircle size={14} /> },
  APPROVED: { label: "Đang bán", className: "bg-emerald-500 text-white border-emerald-600 shadow-sm", icon: <CheckCircle size={14} /> },
  REJECTED: { label: "Từ chối", className: "bg-red-500 text-white border-red-600 shadow-sm", icon: <XCircle size={14} /> },
  HIDDEN: { label: "Đang ẩn", className: "bg-slate-600 text-white border-slate-700 shadow-sm", icon: <Package size={14} /> },
};

const columnHeaders = {
  product: "Sản phẩm",
  seller: "Nhà bán hàng",
  price: "Giá bán",
  stock: "Kho",
  status: "Trạng thái",
  createdAt: "Ngày tạo",
  actions: "Duyệt",
};

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
};

export default function ProductsPage() {
  const router = useRouter();
  const toast = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "ALL">("ALL");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [productToReject, setProductToReject] = useState<{ id: string; name: string } | null>(null);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [productToHide, setProductToHide] = useState<Product | null>(null);
  const [isHideSubmitting, setIsHideSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    type: "success" | "warning" | "danger";
    confirmLabel: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  const params = useMemo(
    () => ({
      status: status === "ALL" ? undefined : status,
      search: search.trim() || undefined,
      page: 0,
      size: 100,
    }),
    [search, status],
  );

  const { products, isLoading, isError, refetch, approveProduct, rejectProduct, updateProductStatus, deleteProducts } = useProducts(params);

  // ESC closes any open modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isHideModalOpen) { setIsHideModalOpen(false); return; }
      if (bulkRejectOpen) { setBulkRejectOpen(false); return; }
      if (confirmAction) { setConfirmAction(null); return; }
      if (isRejectModalOpen) { setIsRejectModalOpen(false); return; }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [confirmAction, bulkRejectOpen, isRejectModalOpen, isHideModalOpen]);

  const handleApprove = async (product: Product) => {
    try {
      await approveProduct(product.id);
      toast.success("Đã duyệt sản phẩm");
    } catch {
      toast.error("Lỗi khi duyệt sản phẩm");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await rejectProduct({ id, reason });
      toast.success("Đã từ chối sản phẩm");
    } catch {
      toast.error("Lỗi khi từ chối sản phẩm");
    }
  };

  const handleHide = (product: Product) => {
    setProductToHide(product);
    setIsHideModalOpen(true);
    if (confirmAction) setConfirmAction({
      title: "Tạm ẩn sản phẩm?",
      message: `Sản phẩm "${product.name}" sẽ không còn hiển thị trên store. Bạn có thể hiện lại bất cứ lúc nào.`,
      type: "warning",
      confirmLabel: "Tạm ẩn",
      onConfirm: async () => {
        try {
          await updateProductStatus({ id: product.id, status: "HIDDEN" });
          toast.success("Đã tạm ẩn sản phẩm");
        } catch {
          toast.error("Lỗi khi ẩn sản phẩm");
        }
        setConfirmAction(null);
      },
    });
  };

  const confirmHide = async (reason: string) => {
    if (!productToHide) return;
    setIsHideSubmitting(true);
    try {
      await updateProductStatus({ id: productToHide.id, status: "HIDDEN", reason });
      toast.success("Đã tạm ẩn sản phẩm");
      setIsHideModalOpen(false);
      setProductToHide(null);
    } catch {
      toast.error("Lỗi khi ẩn sản phẩm");
    } finally {
      setIsHideSubmitting(false);
    }
  };

  const handleUnhide = (product: Product) => {
    setConfirmAction({
      title: "Hiện lại sản phẩm?",
      message: `Sản phẩm "${product.name}" sẽ trở lại trạng thái "Đang bán" và hiển thị trên store.`,
      type: "success",
      confirmLabel: "Hiện lại",
      onConfirm: async () => {
        try {
          await updateProductStatus({ id: product.id, status: "APPROVED" });
          toast.success("Đã hiện lại sản phẩm");
        } catch {
          toast.error("Lỗi khi hiện lại sản phẩm");
        }
        setConfirmAction(null);
      },
    });
  };

  const handleRestore = (product: Product) => {
    setConfirmAction({
      title: "Phục hồi sản phẩm?",
      message: `Sản phẩm "${product.name}" sẽ chuyển về trạng thái "Chờ duyệt" để seller có thể sửa và gửi lại.`,
      type: "success",
      confirmLabel: "Phục hồi",
      onConfirm: async () => {
        try {
          await updateProductStatus({ id: product.id, status: "PENDING" });
          toast.success("Đã phục hồi sản phẩm");
        } catch {
          toast.error("Lỗi khi phục hồi sản phẩm");
        }
        setConfirmAction(null);
      },
    });
  };

  const handleDelete = (product: Product) => {
    setConfirmAction({
      title: "Xóa vĩnh viễn?",
      message: `Sản phẩm "${product.name}" sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác!`,
      type: "danger",
      confirmLabel: "Xóa vĩnh viễn",
      onConfirm: async () => {
        try {
          await deleteProducts([product.id]);
          toast.success("Đã xóa sản phẩm");
        } catch {
          toast.error("Lỗi khi xóa sản phẩm");
        }
        setConfirmAction(null);
      },
    });
  };

  const columnHelper = createColumnHelper<Product>();
  const columns = [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(event) => event.stopPropagation()}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
    }),
    columnHelper.accessor("name", {
      header: "Sản phẩm",
      cell: ({ row }) => {
        const product = row.original;
        const firstImage = product.images?.[0];
        const slugTooltip = `Mã: ${product.sku || product.productCode}`;
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center">
              {firstImage ? (
                <img src={firstImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <Package size={22} className="text-slate-300" />
              )}
            </div>
            <div className="min-w-0" title={slugTooltip}>
              <p className="text-sm font-bold text-slate-800 truncate max-w-[280px]">{product.name}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">#{product.id}</p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("sellerName", {
      header: "Nhà bán hàng",
      cell: ({ row, getValue }) => {
        const product = row.original;
        const name = getValue();
        if (!name) return <span className="text-sm text-slate-400">-</span>;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (product.sellerId) router.push(`/admin/sellers/${product.sellerId}`);
            }}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors text-left"
          >
            {name}
          </button>
        );
      },
    }),
    columnHelper.accessor("category", {
      header: "Danh mục",
      cell: ({ getValue }) => {
        const cat = getValue();
        if (!cat) return <span className="text-sm text-slate-400">-</span>;
        return (
          <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold border border-slate-200">
            {cat}
          </span>
        );
      },
    }),
    columnHelper.accessor("price", {
      header: "Giá bán",
      cell: ({ getValue }) => <span className="font-black text-slate-800 text-sm">{money(getValue())}</span>,
    }),
    columnHelper.accessor("stock", {
      header: "Kho",
      cell: ({ getValue }) => {
        const stock = getValue();
        if (stock === 0) {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
              <AlertCircle size={12} /> Hết hàng
            </span>
          );
        }
        if (stock > 0 && stock <= 5) {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200" title="Sắp hết hàng">
              <AlertCircle size={12} /> {stock}
            </span>
          );
        }
        return <span className="text-sm font-bold text-slate-700">{stock}</span>;
      },
    }),
    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: ({ getValue }) => {
        const config = statusConfig[getValue()];
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase border whitespace-nowrap ${config.className}`}>
            {config.icon}
            {config.label}
          </span>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Ngày tạo",
      cell: ({ getValue }) => {
        const iso = getValue();
        return (
          <div className="text-xs">
            <p className="font-bold text-slate-700">{formatDate(iso)}</p>
            {iso && <p className="text-slate-400 text-[10px] mt-0.5">{new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-end gap-1.5" onClick={(event) => event.stopPropagation()}>
            {/* PENDING actions */}
            {product.status === "PENDING" && (
              <>
                <button
                  title="Duyệt sản phẩm"
                  onClick={() => handleApprove(product)}
                  className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-sm rounded-lg transition-all"
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  title="Từ chối (nhập lý do)"
                  onClick={() => {
                    setProductToReject({ id: product.id, name: product.name });
                    setIsRejectModalOpen(true);
                  }}
                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm rounded-lg transition-all"
                >
                  <XCircle size={16} />
                </button>
              </>
            )}

            {/* APPROVED actions */}
            {product.status === "APPROVED" && (
              <button
                title="Tạm ẩn sản phẩm"
                onClick={() => handleHide(product)}
                className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:shadow-sm rounded-lg transition-all"
              >
                <EyeOff size={16} />
              </button>
            )}

            {/* REJECTED actions */}
            {product.status === "REJECTED" && (
              <>
                <button
                  title="Phục hồi → Chờ duyệt"
                  onClick={() => handleRestore(product)}
                  className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:shadow-sm rounded-lg transition-all"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  title="Xóa vĩnh viễn"
                  onClick={() => handleDelete(product)}
                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}

            {/* HIDDEN actions */}
            {product.status === "HIDDEN" && (
              <>
                <button
                  title="Hiện lại → Đang bán"
                  onClick={() => handleUnhide(product)}
                  className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-sm rounded-lg transition-all"
                >
                  <Eye size={16} />
                </button>
                <button
                  title="Xóa vĩnh viễn"
                  onClick={() => handleDelete(product)}
                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}

            {/* View detail — always show */}
            <button
              title="Xem chi tiết sản phẩm"
              onClick={() => router.push(`/admin/products/${product.id}`)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-sm rounded-lg transition-all"
            >
              <Eye size={16} />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    autoResetExpanded: false,
  });

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const selectedPending = selectedRows.filter((product) => product.status === "PENDING");

  const bulkApprove = () => {
    setConfirmAction({
      title: `Duyệt ${selectedPending.length} sản phẩm?`,
      message: `Tất cả ${selectedPending.length} sản phẩm đã chọn sẽ được đăng bán công khai trên store.`,
      type: "success",
      confirmLabel: `Duyệt ${selectedPending.length} sản phẩm`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedPending.map((product) => approveProduct(product.id)));
          toast.success(`Đã duyệt ${selectedPending.length} sản phẩm`);
        } catch {
          toast.error("Thao tác hàng loạt thất bại");
        }
        setConfirmAction(null);
      },
    });
  };

  const bulkReject = () => {
    setBulkRejectReason("");
    setBulkRejectOpen(true);
  };

  const confirmBulkReject = async () => {
    if (!bulkRejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      await Promise.all(selectedPending.map((product) => rejectProduct({ id: product.id, reason: bulkRejectReason })));
      toast.success(`Đã từ chối ${selectedPending.length} sản phẩm`);
      setBulkRejectOpen(false);
      setBulkRejectReason("");
    } catch {
      toast.error("Thao tác hàng loạt thất bại");
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6">
      <RejectProductModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={async (reason) => {
          if (productToReject) await handleReject(productToReject.id, reason);
          setIsRejectModalOpen(false);
        }}
        productName={productToReject?.name || ""}
      />

      <HideProductModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        onConfirm={confirmHide}
        productName={productToHide?.name || ""}
        isSubmitting={isHideSubmitting}
      />

      {/* Custom Confirmation Modal */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setConfirmAction(null)}
          onKeyDown={(e) => e.key === "Escape" && setConfirmAction(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`p-3 rounded-full shrink-0 ${
                  confirmAction.type === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : confirmAction.type === "danger"
                    ? "bg-red-100 text-red-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {confirmAction.type === "success" ? (
                  <CheckCircle size={24} />
                ) : confirmAction.type === "danger" ? (
                  <Trash2 size={24} />
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-800 mb-2">{confirmAction.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{confirmAction.message}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                Hủy <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-200 rounded">Esc</kbd>
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className={`flex-1 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg transition-all ${
                  confirmAction.type === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    : confirmAction.type === "danger"
                    ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                    : "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
                }`}
              >
                {confirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {bulkRejectOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setBulkRejectOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-full bg-red-100 text-red-600 shrink-0">
                <XCircle size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-800 mb-2">
                  Từ chối {selectedPending.length} sản phẩm?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Vui lòng nhập lý do từ chối. Lý do này sẽ áp dụng cho tất cả sản phẩm đã chọn.
                </p>
                <textarea
                  value={bulkRejectReason}
                  onChange={(e) => setBulkRejectReason(e.target.value)}
                  placeholder="Ví dụ: Hình ảnh không rõ ràng, mô tả thiếu thông tin..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-300 text-sm font-medium resize-none transition-all"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setBulkRejectOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                Hủy <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-200 rounded">Esc</kbd>
              </button>
              <button
                onClick={confirmBulkReject}
                disabled={!bulkRejectReason.trim()}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all"
              >
                Từ chối {selectedPending.length} sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      <Breadcrumbs items={[{ label: "Sản phẩm" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">Kiểm duyệt sản phẩm</h1>
          <p className="text-sm text-slate-500 font-medium">
            Admin chỉ duyệt hoặc từ chối sản phẩm do nhà bán hàng gửi lên.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Status Tabs với underline indicator */}
        <div className="border-b border-slate-100">
          <div className="flex items-center gap-1 px-6 pt-4 overflow-x-auto no-scrollbar">
            {[
              { value: "ALL", label: "Tất cả", icon: <Package size={15} />, color: "slate" },
              { value: "PENDING", label: "Chờ duyệt", icon: <AlertCircle size={15} />, color: "amber" },
              { value: "APPROVED", label: "Đang bán", icon: <CheckCircle size={15} />, color: "emerald" },
              { value: "REJECTED", label: "Từ chối", icon: <XCircle size={15} />, color: "red" },
              { value: "HIDDEN", label: "Đang ẩn", icon: <Package size={15} />, color: "slate" },
            ].map((tab) => {
              const isActive = status === tab.value;
              const colorMap: Record<string, { active: string; inactive: string; underline: string }> = {
                slate: {
                  active: "text-slate-800",
                  inactive: "text-slate-500 hover:text-slate-700",
                  underline: "bg-slate-800",
                },
                amber: {
                  active: "text-amber-600",
                  inactive: "text-slate-500 hover:text-amber-600",
                  underline: "bg-amber-500",
                },
                emerald: {
                  active: "text-emerald-600",
                  inactive: "text-slate-500 hover:text-emerald-600",
                  underline: "bg-emerald-500",
                },
                red: {
                  active: "text-red-600",
                  inactive: "text-slate-500 hover:text-red-600",
                  underline: "bg-red-500",
                },
              };
              const colors = colorMap[tab.color];
              return (
                <button
                  key={tab.value}
                  onClick={() => { setStatus(tab.value as ProductStatus | "ALL"); setRowSelection({}); }}
                  className={`relative px-5 py-3 text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive ? colors.active : colors.inactive
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {isActive && (
                    <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t ${colors.underline}`}></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search bar */}
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm tên sản phẩm, SKU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-300 text-sm font-medium transition-all"
            />
          </div>
        </div>

        {selectedRows.length > 0 && (
          <div className="sticky top-0 z-20 bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold">Đã chọn {selectedRows.length}</span>
              <span className="text-xs text-blue-100">sản phẩm</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={bulkApprove}
                disabled={selectedPending.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                <CheckCircle size={14} /> Duyệt tất cả
              </button>
              <button
                onClick={bulkReject}
                disabled={selectedPending.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                <XCircle size={14} /> Từ chối tất cả
              </button>
              <button
                onClick={() => setRowSelection({})}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all"
              >
                <X size={14} /> Bỏ chọn
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar flex-1 relative">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-100">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-transparent cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={12} className="opacity-50" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <TableRowSkeleton rows={5} cells={columns.length} />
              ) : isError ? (
                <tr>
                  <td colSpan={columns.length} className="py-20">
                    <ErrorState type="error" actionLabel="Thử lại" onAction={() => refetch()} />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      title="Không có sản phẩm nào"
                      description="Khi nhà bán hàng tạo sản phẩm mới, sản phẩm sẽ xuất hiện tại đây."
                      type="data"
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                    onClick={() => router.push(`/admin/products/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-sm text-slate-600">
            Hiển thị <span className="font-bold text-slate-800">{table.getRowModel().rows.length}</span> trong <span className="font-bold text-slate-800">{products.length}</span> sản phẩm
          </div>

          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all"
              title="Trang trước"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => table.setPageIndex(pageNum - 1)}
                  className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${
                    table.getState().pagination.pageIndex + 1 === pageNum
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all"
              title="Trang tiếp"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Page Info */}
          <div className="text-sm text-slate-600">
            Trang <span className="font-semibold">{table.getState().pagination.pageIndex + 1}</span> / <span className="font-semibold">{table.getPageCount()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
