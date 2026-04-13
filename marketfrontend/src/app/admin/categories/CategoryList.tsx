"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/admin/useCategories";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Layers,
  Package,
  LayoutGrid,
  List,
  Folder,
} from "lucide-react";
import { CategoryStatus, Category } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Skeleton } from "@/components/ui/Skeleton";
import Pagination from "@/components/ui/Pagination";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const ITEMS_PER_PAGE = 8;

export default function CategoryList() {
  const router = useRouter();
  const { categories, isLoading, deleteCategory, updateCategory, isDeleting } =
    useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | CategoryStatus>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({ isOpen: false, id: null });

  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.status === "ACTIVE").length;
    const totalProducts = categories.reduce(
      (sum, c) => sum + c.productStock,
      0,
    );
    return { total, active, totalProducts };
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchTab = activeTab === "ALL" || c.status === activeTab;
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.categoryCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [categories, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const openDeleteModal = (
    e: React.MouseEvent,
    id: string,
    hasProducts: boolean,
  ) => {
    e.stopPropagation();
    if (hasProducts) {
      toast.error("Không thể xóa danh mục đang có sản phẩm.");
      return;
    }
    setDeleteModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteCategory(deleteModal.id);
      toast.success("Đã xóa danh mục thành công!");
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      toast.error("Lỗi khi xóa danh mục.");
    }
  };

  const handleToggleStatus = async (
    e: React.MouseEvent,
    category: Category,
  ) => {
    e.stopPropagation();
    try {
      const newStatus = category.status === "ACTIVE" ? "HIDDEN" : "ACTIVE";
      await updateCategory({ id: category.id, data: { status: newStatus } });
      toast.success(
        `Danh mục đã chuyển sang trạng thái: ${newStatus === "ACTIVE" ? "Hoạt động" : "Ẩn"}`,
      );
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái.");
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6 pb-24">
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete category?"
        description="This action will permanently delete the category and cannot be undone."
        confirmLabel="Delete now"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Header & Stats Row */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              📁 Categories
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Organize and manage the product category structure.
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/categories/industries/new")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all border-0"
          >
            <Plus size={20} /> Add Category
          </button>
        </div>

        {/* Mini Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {stats.total}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase">
                Total categories
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {stats.active}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase">
                Active
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {stats.totalProducts.toLocaleString()}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase">
                Linked Products
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 w-full">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Find the category name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              {["ALL", "ACTIVE", "HIDDEN"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border-0 ${activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {tab === "ALL"
                    ? "All"
                    : tab === "ACTIVE"
                      ? "Active"
                      : "Hidden"}
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-50/50 p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-3xl" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Folder size={40} />
              </div>
              <h3 className="text-slate-500 font-bold mb-1">
                No category found.
              </h3>
              <p className="text-slate-400 text-sm">
                Try adjusting the search term or filters.
              </p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
                  {paginatedCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() =>
                        router.push(
                          `/admin/categories/industries/${category.id}`,
                        )
                      }
                      className={`bg-white border border-slate-200 rounded-[24px] p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full ${category.status === "HIDDEN" ? "opacity-80" : ""}`}
                    >
                      {/* Image Header */}
                      <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden relative mb-4">
                        <img
                          src={category.thumbnailUrl}
                          alt={category.name}
                          className={`w-full h-full object-cover transition-transform duration-500 ${category.status === "HIDDEN" ? "grayscale" : "group-hover:scale-105"}`}
                        />

                        <div
                          className="absolute top-3 right-3 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${category.status === "ACTIVE" ? "bg-green-500" : "bg-slate-300"}`}
                            onClick={(e) => handleToggleStatus(e, category)}
                          >
                            <div
                              className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${category.status === "ACTIVE" ? "translate-x-5" : "translate-x-0"}`}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-base font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[2.5em]">
                          {category.description || "No description available."}
                        </p>

                        {/* Stats Bar */}
                        <div className="mt-auto pt-4 border-t border-slate-50">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-400 uppercase">
                              Products
                            </span>
                            <span className="font-black text-slate-800">
                              {category.productStock} products
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.min(100, category.productStock > 0 ? (category.productStock / 100) * 10 : 0)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="flex gap-2 mt-4 pt-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/admin/categories/industries/${category.id}/edit`,
                            );
                          }}
                          className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
                        >
                          edit
                        </button>
                        <button
                          onClick={(e) =>
                            openDeleteModal(
                              e,
                              category.id,
                              category.productStock > 0,
                            )
                          }
                          disabled={isDeleting || category.productStock > 0}
                          className={`p-2 rounded-xl transition-colors ${category.productStock > 0 ? "bg-slate-50 text-slate-300 cursor-not-allowed" : "bg-red-50 text-red-500 hover:bg-red-100"}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          #
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Category Name
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                          Product Count
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                          Status
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedCategories.map((category, index) => (
                        <tr
                          key={category.id}
                          className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${category.status === "HIDDEN" ? "opacity-70 bg-slate-50/50" : ""}`}
                          onClick={() =>
                            router.push(
                              `/admin/categories/industries/${category.id}`,
                            )
                          }
                        >
                          {/* STT */}
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-800">
                              {index + 1}
                            </span>
                          </td>

                          {/* Category Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
                                <img
                                  src={category.thumbnailUrl}
                                  alt={category.name}
                                  className={`w-full h-full object-cover ${category.status === "HIDDEN" ? "grayscale" : ""}`}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">
                                  {category.name}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                  {category.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Product Count */}
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-black text-slate-800">
                              {category.productStock}
                            </span>
                          </td>

                          {/* Status */}
                          <td
                            className="px-6 py-4 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer mx-auto ${category.status === "ACTIVE" ? "bg-green-500" : "bg-slate-300"}`}
                              onClick={(e) => handleToggleStatus(e, category)}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${category.status === "ACTIVE" ? "translate-x-6" : "translate-x-1"}`}
                              />
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/admin/categories/industries/${category.id}/edit`,
                                  );
                                }}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={(e) =>
                                  openDeleteModal(
                                    e,
                                    category.id,
                                    category.productStock > 0,
                                  )
                                }
                                disabled={isDeleting}
                                className={`p-2 rounded-lg transition-all ${category.productStock > 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-red-600 hover:bg-red-50"}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredCategories.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
