"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Check, Plus } from "lucide-react";

interface CategoryAttributeModalProps {
  category: any;
  attributes: any[];
  units: any[];
  onSave: (attributeIds: string[]) => void;
  onClose: () => void;
}

export default function CategoryAttributeModal({
  category,
  attributes,
  units,
  onSave,
  onClose,
}: CategoryAttributeModalProps) {
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>(
    category.attributeIds || [],
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Filter attributes based on search
  const filteredAttributes = useMemo(() => {
    return attributes.filter(
      (attr) =>
        attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attr.attributeCode.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [attributes, searchTerm]);

  const toggleAttribute = (attrId: string) => {
    setSelectedAttributeIds((prev) =>
      prev.includes(attrId)
        ? prev.filter((id) => id !== attrId)
        : [...prev, attrId],
    );
  };

  const handleSave = () => {
    onSave(selectedAttributeIds);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Manage Attributes for {category.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search attributes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Attributes List */}
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAttributes.map((attr) => {
                const unit = units?.find((u) => u.id === attr.unitId);
                const isSelected = selectedAttributeIds.includes(attr.id);

                return (
                  <div
                    key={attr.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleAttribute(attr.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">
                            {attr.name}
                          </h3>
                          {isSelected && (
                            <Check size={16} className="ml-2 text-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {attr.attributeCode}
                        </p>
                        {unit && (
                          <p className="text-xs text-gray-600 mt-1">
                            Unit: {unit.label} ({unit.symbol})
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Values: {attr.valuesCount}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {filteredAttributes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attributes found matching your search.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
