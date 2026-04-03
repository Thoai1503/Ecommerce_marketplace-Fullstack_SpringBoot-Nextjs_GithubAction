"use client";

import React, { useState, useMemo } from "react";
import { useCategories } from "@/hooks/admin/useCategories";
import { useAttributes } from "@/hooks/admin/useAttributes";
import { useUnits } from "@/hooks/admin/useUnits";
import {
  ChevronLeft,
  Edit3,
  Settings,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { CategoryStatus } from "@/types";
import { useToast } from "@/context/ToastContext";
import CategoryAttributeModal from "../../../components/admin/categories/CategoryAttributeModal";

const StatusConfig: Record<
  CategoryStatus,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  ACTIVE: {
    label: "Active",
    color: "text-green-700",
    bgColor: "bg-green-50",
    icon: <CheckCircle size={14} />,
  },
  HIDDEN: {
    label: "Hidden",
    color: "text-slate-500",
    bgColor: "bg-slate-100",
    icon: <XCircle size={14} />,
  },
};

export default function CategoryAttributeManagement() {
  const {
    categories,
    isLoading: isLoadingCategories,
    updateCategory,
  } = useCategories();
  const { attributes, isLoading: isLoadingAttributes } = useAttributes();
  const { units } = useUnits();
  const { success, error } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [categories, searchTerm]);

  // Get linked attributes for a category
  const getLinkedAttributes = (category: any) => {
    if (!attributes || !category.attributeIds) return [];
    return attributes
      .filter((attr) => category.attributeIds.includes(attr.id))
      .map((attr) => {
        const unit = units?.find((u) => u.id === attr.unitId);
        return {
          ...attr,
          unitSymbol: unit ? unit.symbol : null,
          unitLabel: unit ? unit.label : null,
        };
      });
  };

  const handleEditAttributes = (category: any) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleSaveAttributes = async (attributeIds: string[]) => {
    if (!selectedCategory) return;

    try {
      await updateCategory({
        id: selectedCategory.id,
        data: { attributeIds },
      });
      success("Attributes updated successfully");
      setIsModalOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      error("Failed to update attributes");
    }
  };

  if (isLoadingCategories || isLoadingAttributes) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Category-Attribute Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage attributes assigned to each category
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Linked Attributes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => {
                const linkedAttrs = getLinkedAttributes(category);
                return (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                          src={category.thumbnailUrl}
                          alt={category.name}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.categoryCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${StatusConfig[category.status].bgColor} ${StatusConfig[category.status].color}`}
                      >
                        {StatusConfig[category.status].icon}
                        <span className="ml-1">
                          {StatusConfig[category.status].label}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {linkedAttrs.length > 0 ? (
                          linkedAttrs.map((attr) => (
                            <span
                              key={attr.id}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {attr.name}
                              {attr.unitSymbol && (
                                <span className="ml-1 text-blue-600">
                                  ({attr.unitSymbol})
                                </span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            No attributes linked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditAttributes(category)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Settings size={16} className="mr-1" />
                        Manage Attributes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedCategory && (
        <CategoryAttributeModal
          category={selectedCategory}
          attributes={attributes}
          units={units}
          onSave={handleSaveAttributes}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
}
