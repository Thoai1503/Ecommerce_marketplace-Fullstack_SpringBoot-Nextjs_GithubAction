"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAttributes } from "@/hooks/admin/useAttributes";
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Settings,
  Link as LinkIcon,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Skeleton } from "@/components/ui/Skeleton";
import Pagination from "@/components/ui/Pagination";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const ITEMS_PER_PAGE = 10;

type TabType = "ALL" | "ACTIVE" | "HIDDEN";

export default function AttributeList() {
  const router = useRouter();
  const {
    attributes,
    isLoading,
    deleteAttribute,
    updateAttribute,
    isDeleting,
  } = useAttributes();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({
    isOpen: false,
    id: null,
  });

  // ✅ Reset page khi filter/search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // ================= FILTER =================
  const filteredAttributes = useMemo(() => {
    return attributes.filter((attr: any) => {
      // FILTER STATUS
      if (activeTab === "ACTIVE" && attr.status !== "ACTIVE") return false;
      if (activeTab === "HIDDEN" && attr.status !== "HIDDEN") return false;

      // FILTER SEARCH
      const keyword = searchQuery.toLowerCase();

      return (
        attr.name?.toLowerCase().includes(keyword) ||
        attr.slug?.toLowerCase().includes(keyword)
      );
    });
  }, [attributes, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredAttributes.length / ITEMS_PER_PAGE);

  const paginatedAttributes = filteredAttributes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ================= DELETE =================
  const openDeleteModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      await deleteAttribute(deleteModal.id);
      toast.success("The attribute has been successfully removed!");
    } catch {
      toast.error("Error occurred while deleting the attribute.");
    }

    setDeleteModal({ isOpen: false, id: null });
  };

  // ================= TOGGLE =================
  const handleToggleStatus = async (
    e: React.MouseEvent,
    id: string,
    isActive: boolean
  ) => {
    e.stopPropagation();

    try {
      await updateAttribute({
        id,
        data: { published: !isActive },
      });

      toast.success(
        `Already ${!isActive ? "activated" : "hidden"} the attribute successfully!`
      );
    } catch {
      toast.error("Error occurred while updating the attribute status.");
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6">
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Attribute?"
        description="This action will permanently delete the attribute. Are you sure?"
        confirmLabel="Delete Now"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            ✨(Attributes)
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage parameters such as Color, Size, and Brand.
          </p>
        </div>

        <button
          onClick={() => router.push("/admin/categories/attributes/new")}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all border-0"
        >
          <Plus size={20} /> Add properties
        </button>
      </div>

      {/* Main */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">

        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-3xl">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>

            {/* TAB */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {["ALL", "ACTIVE", "HIDDEN"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as TabType)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500"
                  }`}
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
        </div>

        {/* Title */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Settings size={16} /> Attribute List
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
            {filteredAttributes.length} attributes
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Atribute Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Slug</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Usage</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <Skeleton className="h-12 w-full" />
                    </td>
                  </tr>
                ))
              ) : (
                paginatedAttributes.map((attr: any) => {
                  const isActive = attr.status === "ACTIVE";

                  return (
                    <tr key={attr.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                      <td className="px-6 py-5">{attr.id}</td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-800">{attr.name}</p>
                      </td>

                      <td className="px-6 py-5 text-center">{attr.slug}</td>

                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-500 text-xs font-medium">
                          <LinkIcon size={12} />
                          <span>0 danh mục</span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div
                          className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer ${
                            isActive ? "bg-green-500" : "bg-slate-300"
                          }`}
                          onClick={(e) => handleToggleStatus(e, attr.id, isActive)}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white ${
                              isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button onClick={() => router.push(`/admin/categories/attributes/${attr.id}/edit`)}>
                          <Edit3 size={16} />
                        </button>
                        <button onClick={(e) => openDeleteModal(e, attr.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredAttributes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAttributes.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>
    </div>
  );
}