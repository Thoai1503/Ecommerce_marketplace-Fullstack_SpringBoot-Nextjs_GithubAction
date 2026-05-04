"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Edit3,
  Eye,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
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
import { useToast } from "@/context/ToastContext";
import {
  useDeleteSellerProduct,
  useResubmitProduct,
  useSellerProducts,
} from "@/hooks/seller/useSellerProducts";
import {
  extractSellerProductError,
  SellerProduct,
  SellerProductStatus,
} from "@/service/sellerProducts";

const statusConfig: Record<SellerProductStatus, { label: string; className: string; icon: ReactNode }> = {
  PENDING: {
    label: "Cho duyet",
    className: "text-bg-warning",
    icon: <AlertCircle size={14} />,
  },
  APPROVED: {
    label: "Dang ban",
    className: "text-bg-success",
    icon: <CheckCircle size={14} />,
  },
  REJECTED: {
    label: "Tu choi",
    className: "text-bg-danger",
    icon: <XCircle size={14} />,
  },
  HIDDEN: {
    label: "Da an",
    className: "text-bg-secondary",
    icon: <Package size={14} />,
  },
};

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function SellerProductsPage() {
  const toast = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SellerProductStatus | "ALL">("ALL");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const filters = useMemo(
    () => ({
      status,
      search: search.trim() || undefined,
      categoryId: categoryId.trim() || undefined,
      page,
      size,
    }),
    [categoryId, page, search, size, status],
  );

  const { data, isLoading, isError, refetch } = useSellerProducts(filters);
  const deleteMutation = useDeleteSellerProduct();
  const resubmitMutation = useResubmitProduct();
  const products = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = async (product: SellerProduct) => {
    if (product.status === "APPROVED") return;
    if (!window.confirm(`An san pham "${product.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(product.id);
      toast.success("Da an san pham");
    } catch (error) {
      toast.error(extractSellerProductError(error));
    }
  };

  const handleResubmit = async (product: SellerProduct) => {
    if (product.status !== "REJECTED") return;
    try {
      await resubmitMutation.mutateAsync(product.id);
      toast.success("Da gui duyet lai, cho admin xem xet");
    } catch (error) {
      toast.error(extractSellerProductError(error));
    }
  };

  const columnHelper = createColumnHelper<SellerProduct>();
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="form-check-input"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="form-check-input"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      }),
      columnHelper.accessor("name", {
        header: "San pham",
        cell: ({ row }) => {
          const product = row.original;
          const image = product.images[0];
          return (
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 bg-light border overflow-hidden d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
                {image ? (
                  <img src={image} alt="" className="w-100 h-100 object-fit-cover" />
                ) : (
                  <Package size={22} className="text-muted" />
                )}
              </div>
              <div className="min-w-0">
                <div className="fw-semibold text-truncate" style={{ maxWidth: 280 }}>
                  {product.name}
                </div>
                <div className="small text-muted text-truncate" style={{ maxWidth: 280 }}>
                  #{product.sku || product.slug || product.id}
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("categoryId", {
        header: "Danh muc",
        cell: ({ row }) => row.original.categoryName || `#${row.original.categoryId}`,
      }),
      columnHelper.accessor("price", {
        header: "Gia",
        cell: ({ getValue }) => <span className="fw-bold">{money(getValue())}</span>,
      }),
      columnHelper.accessor("stock", {
        header: "Kho",
        cell: ({ getValue }) => <span className={getValue() === 0 ? "text-danger fw-bold" : "fw-semibold"}>{getValue()}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Trang thai",
        cell: ({ getValue }) => {
          const config = statusConfig[getValue()];
          return (
            <span className={`badge d-inline-flex align-items-center gap-1 ${config.className}`}>
              {config.icon}
              {config.label}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Hanh dong",
        cell: ({ row }) => {
          const product = row.original;
          const canEdit = product.status === "PENDING" || product.status === "REJECTED";
          const canDelete = product.status !== "APPROVED";
          return (
            <div className="d-flex justify-content-end gap-2" onClick={(event) => event.stopPropagation()}>
              <Link className="btn btn-sm btn-light" href={`/seller/products/${product.id}`} title="Xem">
                <Eye size={15} />
              </Link>
              <Link
                className={`btn btn-sm ${canEdit ? "btn-outline-primary" : "btn-light disabled"}`}
                href={canEdit ? `/seller/products/${product.id}/edit` : "#"}
                title={canEdit ? "Sua" : "San pham da duoc duyet, khong the sua"}
              >
                <Edit3 size={15} />
              </Link>
              {product.status === "REJECTED" && (
                <button className="btn btn-sm btn-outline-warning" onClick={() => handleResubmit(product)} title="Gui duyet lai">
                  <RefreshCw size={15} />
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-danger"
                disabled={!canDelete || deleteMutation.isPending}
                onClick={() => handleDelete(product)}
                title={canDelete ? "An san pham" : "San pham da duoc duyet, khong the xoa"}
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        },
      }),
    ],
    [columnHelper, deleteMutation.isPending],
  );

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, rowSelection },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const deletableSelected = selectedRows.filter((product) => product.status !== "APPROVED");

  const handleBulkDelete = async () => {
    if (deletableSelected.length === 0) return;
    if (!window.confirm(`An ${deletableSelected.length} san pham da chon?`)) return;
    try {
      await Promise.all(deletableSelected.map((product) => deleteMutation.mutateAsync(product.id)));
      setRowSelection({});
      toast.success(`Da an ${deletableSelected.length} san pham`);
    } catch (error) {
      toast.error(extractSellerProductError(error));
    }
  };

  const changeFilter = (fn: () => void) => {
    fn();
    setPage(0);
    setRowSelection({});
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Quan ly san pham</h1>
          <p className="text-muted mb-0">San pham cua shop: tao, sua khi cho duyet hoac bi tu choi.</p>
        </div>
        <Link href="/seller/products/new" className="btn btn-danger fw-semibold">
          <Plus size={18} className="me-2" />
          Them san pham
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4 border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <Search size={16} />
                </span>
                <input
                  className="form-control"
                  value={search}
                  onChange={(event) => changeFilter(() => setSearch(event.target.value))}
                  placeholder="Tim ten san pham hoac SKU"
                />
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <Filter size={16} />
                </span>
                <select
                  className="form-select"
                  value={status}
                  onChange={(event) => changeFilter(() => setStatus(event.target.value as SellerProductStatus | "ALL"))}
                >
                  <option value="ALL">Tat ca trang thai</option>
                  <option value="PENDING">Cho duyet</option>
                  <option value="APPROVED">Dang ban</option>
                  <option value="REJECTED">Tu choi</option>
                  <option value="HIDDEN">Da an</option>
                </select>
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <input
                className="form-control"
                value={categoryId}
                onChange={(event) => changeFilter(() => setCategoryId(event.target.value))}
                placeholder="Category ID"
              />
            </div>
            <div className="col-12 col-lg-2 text-lg-end">
              <button className="btn btn-outline-secondary w-100" onClick={() => refetch()}>
                <RefreshCw size={16} className="me-2" />
                Tai lai
              </button>
            </div>
          </div>
        </div>

        {selectedRows.length > 0 && (
          <div className="px-4 py-3 bg-danger-subtle d-flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="fw-semibold">Da chon {selectedRows.length} san pham</span>
            <button className="btn btn-sm btn-danger" onClick={handleBulkDelete} disabled={deletableSelected.length === 0}>
              <Trash2 size={14} className="me-1" />
              An san pham co the an
            </button>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="text-nowrap px-4 py-3">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-5 text-muted">
                    Dang tai san pham...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-5">
                    <div className="mb-2 text-danger fw-semibold">Khong tai duoc san pham</div>
                    <button className="btn btn-outline-secondary" onClick={() => refetch()}>
                      Thu lai
                    </button>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-5 text-muted">
                    Chua co san pham nao phu hop.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="small text-muted">
            Tong {meta?.total ?? products.length} san pham, trang {(meta?.page ?? page) + 1}/{Math.max(meta?.totalPages ?? 1, 1)}
          </div>
          <div className="btn-group">
            <button className="btn btn-outline-secondary" disabled={page === 0} onClick={() => setPage((p) => Math.max(p - 1, 0))}>
              Truoc
            </button>
            <button
              className="btn btn-outline-secondary"
              disabled={meta ? page + 1 >= meta.totalPages : products.length < size}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
