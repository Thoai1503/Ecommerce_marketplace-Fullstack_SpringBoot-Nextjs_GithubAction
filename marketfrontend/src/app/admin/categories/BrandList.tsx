"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/admin/useBrands";
import { Search, Plus, Edit3, Trash2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Skeleton } from "@/components/ui/Skeleton";
import Pagination from "@/components/ui/Pagination";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const ITEMS_PER_PAGE = 10;

type TabType = "ALL" | "ACTIVE" | "HIDDEN";

export default function BrandList() {
  const router = useRouter();
  const { brands, isLoading, deleteBrand, updateBrand } = useBrands();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null as string | null,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // ================= FILTER =================
  const filteredBrands = useMemo(() => {
    return brands.filter((b: any) => {
      if (activeTab === "ACTIVE" && b.status !== "ACTIVE") return false;
      if (activeTab === "HIDDEN" && b.status !== "HIDDEN") return false;

      const keyword = searchQuery.toLowerCase();

      return (
        b.name?.toLowerCase().includes(keyword) ||
        b.slug?.toLowerCase().includes(keyword)
      );
    });
  }, [brands, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);

  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ================= DELETE =================
  const openDeleteModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      await deleteBrand(deleteModal.id);
      toast.success("Deleted successfully!");
    } catch {
      toast.error("Delete failed!");
    }

    setDeleteModal({ isOpen: false, id: null });
  };

  // ================= TOGGLE =================
  const handleToggleStatus = async (
    e: React.MouseEvent,
    id: string,
    isActive: boolean,
  ) => {
    e.stopPropagation();

    try {
      await updateBrand({
        id,
        data: {
          status: isActive ? 0 : 1, // ✅ FIX Ở ĐÂY
        },
      });

      toast.success("Status updated!");
    } catch {
      toast.error("Update failed!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 lg:p-8 space-y-6">
      {/* MODAL */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Brand?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Brands</h1>
          <p className="text-sm text-slate-500">Manage your product brands</p>
        </div>

        <button
          onClick={() => router.push("/admin/categories/brands/new")}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl
          shadow-[0_6px_20px_rgba(59,130,246,0.35)]
          hover:shadow-[0_10px_30px_rgba(59,130,246,0.45)]
          transition"
        >
          <Plus size={16} />
          Add Brand
        </button>
      </div>

      {/* CARD */}
      <div
        className="bg-white rounded-[24px] border border-slate-200 
      shadow-[0_8px_24px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        {/* TOOLBAR */}
        <div className="p-6 flex gap-4 border-b bg-white">
          {/* SEARCH */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or slug..."
              className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl 
              bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* TAB */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {["ALL", "ACTIVE", "HIDDEN"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as TabType)}
                className={`px-4 py-2 text-sm rounded-lg transition ${
                  activeTab === tab
                    ? "bg-white shadow-sm font-semibold"
                    : "text-slate-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Logo</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Slug</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6}>
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              ))
            ) : paginatedBrands.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  No brands found
                </td>
              </tr>
            ) : (
              paginatedBrands.map((b: any, index: number) => {
                const isActive = b.status === "ACTIVE";

                return (
                  <tr
                    key={b.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="p-4">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>

                    <td className="p-4">
                      {b.logo ? (
                        <img src={b.logo} className="w-12 h-8 object-contain" />
                      ) : (
                        <ImageIcon size={16} />
                      )}
                    </td>

                    <td className="p-4 font-medium">{b.name}</td>

                    <td className="p-4 text-slate-500">{b.slug}</td>

                    {/* STATUS SWITCH */}
                    <td className="p-4">
                      <div
                        onClick={(e) => handleToggleStatus(e, b.id, isActive)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                          isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                            isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() =>
                          router.push(`/admin/categories/brands/${b.id}/edit`)
                        }
                        className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={(e) => openDeleteModal(e, b.id)}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {!isLoading && filteredBrands.length > 0 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredBrands.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        )}
      </div>
    </div>
  );
}
