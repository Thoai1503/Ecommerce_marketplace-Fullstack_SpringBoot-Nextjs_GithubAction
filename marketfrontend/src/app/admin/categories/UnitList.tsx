"use client";

import React, { useState, useMemo } from "react";
import { useUnits } from "@/hooks/admin/useUnits";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Scale,
  Filter,
  Link as LinkIcon,
} from "lucide-react";
import { Unit, UnitStatus } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Skeleton } from "@/components/ui/Skeleton";
import UnitModal from "@/components/admin/categories/UnitModal";
import Pagination from "@/components/ui/Pagination";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const ITEMS_PER_PAGE = 10;

export default function UnitList() {
  const {
    units,
    isLoading,
    createUnit,
    updateUnit,
    deleteUnit,
    isDeleting,
    isSaving,
  } = useUnits();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<"ALL" | UnitStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({ isOpen: false, id: null });

  // ================= FILTER =================
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      const matchStatus = activeStatus === "ALL" || u.status === activeStatus;
      const matchSearch =
        u.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [units, searchQuery, activeStatus]);

  const totalPages = Math.ceil(filteredUnits.length / ITEMS_PER_PAGE);
  const paginatedUnits = filteredUnits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ================= HANDLERS =================
  const handleOpenCreate = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleSaveUnit = async (data: Partial<Unit>) => {
    try {
      if (editingUnit) {
        await updateUnit({ id: editingUnit.id, data });
        toast.success("The unit has been successfully updated!");
      } else {
        await createUnit(data as any);
        toast.success("The new unit has been created successfully!");
      }
    } catch {
      toast.error("The operation failed.");
    }
  };

  const openDeleteModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteUnit(deleteModal.id);
      toast.success("The unit has been successfully deleted!");
      setDeleteModal({ isOpen: false, id: null });
    } catch {
      toast.error("Error occurred while deleting the unit.");
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, unit: Unit) => {
    e.stopPropagation();

    try {
      const newStatus = unit.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      await updateUnit({
        id: unit.id,
        data: {
          label: unit.label,
          symbol: unit.symbol,
          status: newStatus,
        },
      });

      toast.success("Updated status");
    } catch {
      toast.error("Error");
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6">
      <UnitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUnit}
        initialData={editingUnit}
        isSaving={isSaving}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Unit?"
        description="This action will permanently delete the unit and may affect related products."
        confirmLabel="Delete Now"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            ⚖️ Units
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Standardize measurement units for products.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all border-0"
        >
          <Plus size={20} /> Add Unit
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by unit name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>

            {/* Status */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {["ALL", "ACTIVE", "INACTIVE"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveStatus(tab as any)}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border-0 ${
                    activeStatus === tab
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab === "ALL"
                    ? "All"
                    : tab === "ACTIVE"
                      ? "Active"
                      : "Inactive"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Scale size={16} /> Unit List
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
            {filteredUnits.length} units
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 w-12 text-center"></th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">
                  #
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">
                  UNIT NAME
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">
                  SYMBOL
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">
                  USAGE
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">
                  STATUS
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <Skeleton className="h-12 w-full" />
                      </td>
                    </tr>
                  ))
                : paginatedUnits.map((unit, index) => {
                    const stt = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                    const usageCount = Math.floor(Math.random() * 20);
                    const isActive = unit.status === "ACTIVE";

                    return (
                      <tr
                        key={unit.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleOpenEdit(unit)}
                      >
                        <td className="px-6 py-5"></td>

                        <td className="px-6 py-5">{stt}</td>

                        <td className="px-6 py-5">
                          <p className="font-bold">{unit.label}</p>
                        </td>

                        <td className="px-6 py-5 text-center">{unit.symbol}</td>

                        <td className="px-6 py-5 text-center">
                          <div className="flex justify-center gap-1">
                            <LinkIcon size={12} />
                            {usageCount}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <div
                            onClick={(e) => handleToggleStatus(e, unit)}
                            className={`w-10 h-5 rounded-full cursor-pointer ${
                              isActive ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                        </td>

                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* EDIT */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(unit);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit3 size={16} />
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={(e) => openDeleteModal(e, unit.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredUnits.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredUnits.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>
    </div>
  );
}
