"use client";
import React, { useState, useRef } from "react";
import { Modal, Input } from "antd";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react";

interface DbCategory {
  id: number;
  parent_id: number;
  category_name: string;
  category_slug: string;
  level: number;
  is_active: number;
}

const mockCategories: DbCategory[] = [
  {
    id: 2,
    parent_id: 0,
    category_name: "Đồ gia dụng",
    category_slug: "do-gia-dung",
    level: 0,
    is_active: 1,
  },
  {
    id: 3,
    parent_id: 0,
    category_name: "Thời trang nữ",
    category_slug: "thoi-trang-nu",
    level: 0,
    is_active: 1,
  },
  {
    id: 4,
    parent_id: 0,
    category_name: "Máy tính & Laptop",
    category_slug: "may-tinh-laptop",
    level: 0,
    is_active: 1,
  },
  {
    id: 5,
    parent_id: 4,
    category_name: "Máy tính bàn",
    category_slug: "may-tinh-ban",
    level: 1,
    is_active: 1,
  },
  {
    id: 6,
    parent_id: 4,
    category_name: "Màn hình",
    category_slug: "man-hinh",
    level: 1,
    is_active: 1,
  },
  {
    id: 7,
    parent_id: 5,
    category_name: "Máy chủ",
    category_slug: "may-chu",
    level: 2,
    is_active: 1,
  },
  {
    id: 8,
    parent_id: 5,
    category_name: "Máy tính mini",
    category_slug: "may-tinh-mini",
    level: 2,
    is_active: 1,
  },
  {
    id: 10,
    parent_id: 0,
    category_name: "Điện thoại & phụ kiện",
    category_slug: "dien-thoai-phu-kien",
    level: 0,
    is_active: 1,
  },
  {
    id: 11,
    parent_id: 10,
    category_name: "Thẻ sim",
    category_slug: "the-sim",
    level: 1,
    is_active: 1,
  },
  {
    id: 12,
    parent_id: 10,
    category_name: "Điện thoại",
    category_slug: "dien-thoai",
    level: 1,
    is_active: 1,
  },
  {
    id: 16,
    parent_id: 0,
    category_name: "Thời trang nam",
    category_slug: "thoi-trang-nam",
    level: 0,
    is_active: 1,
  },
  {
    id: 23,
    parent_id: 16,
    category_name: "Áo",
    category_slug: "ao",
    level: 1,
    is_active: 1,
  },
  {
    id: 33,
    parent_id: 23,
    category_name: "Áo hoodies",
    category_slug: "ao-hoodies",
    level: 2,
    is_active: 1,
  },
];

interface Props {
  categories?: DbCategory[];
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setProduct: React.Dispatch<React.SetStateAction<Partial<any>>>;
  onConfirm?: (category: DbCategory, path: DbCategory[]) => void;
}

const CategorySelectorModal = ({
  categories = mockCategories,
  isModalOpen,
  setIsModalOpen,
  setProduct,
  onConfirm,
}: Props) => {
  const [searchText, setSearchText] = useState("");
  const [selectedPath, setSelectedPath] = useState<DbCategory[]>([]);
  const [activePath, setActivePath] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Lọc categories theo parent_id
  const getCategoriesByParent = (parentId: number) => {
    return categories.filter(
      (cat) => cat.parent_id === parentId && cat.is_active === 1,
    );
  };

  // Kiểm tra category có con không
  const hasChildren = (categoryId: number) => {
    return categories.some(
      (cat) => cat.parent_id === categoryId && cat.is_active === 1,
    );
  };

  // Tìm category theo ID
  const getCategoryById = (id: number) => {
    return categories.find((cat) => cat.id === id);
  };

  // Build full path từ category ID
  const buildPathFromCategory = (categoryId: number) => {
    const path: DbCategory[] = [];
    let currentId: number | null = categoryId;

    while (currentId) {
      const category = getCategoryById(currentId);
      if (category) {
        path.unshift(category);
        currentId = category.parent_id || null;
      } else {
        break;
      }
    }

    return path;
  };

  // Handle click category
  const handleCategoryClick = (
    category: DbCategory,
    levelIndex: number,
    isOtherOption: boolean = false,
  ) => {
    // Cập nhật active path

    const newActivePath = [...activePath];

    // Reset các level sau level hiện tại
    for (let i = levelIndex + 1; i < newActivePath.length; i++) {
      newActivePath[i] = null;
    }

    // Set active cho level hiện tại
    newActivePath[levelIndex] = category.id;
    setActivePath(newActivePath);

    // Nếu là option "Khác" hoặc không có con, cập nhật selected path
    if (isOtherOption || !hasChildren(category.id)) {
      const fullPath = buildPathFromCategory(category.id);
      setSelectedPath(fullPath);
    }

    // Auto scroll sang cột tiếp theo nếu có children
    setTimeout(() => {
      if (
        scrollContainerRef.current &&
        hasChildren(category.id) &&
        !isOtherOption
      ) {
        const columnWidth = 280;
        scrollContainerRef.current.scrollTo({
          left: (levelIndex + 1) * columnWidth,
          behavior: "smooth",
        });
      }
    }, 1000);
  };

  // Render một cột categories
  const renderCategoryColumn = (parentId: number, levelIndex: number) => {
    const categoryList = getCategoriesByParent(parentId);

    if (categoryList.length === 0) return null;

    // Lấy parent category để hiển thị option "Khác"
    const parentCategory = parentId !== 0 ? getCategoryById(parentId) : null;
    const shouldShowOther = parentCategory && parentCategory.level >= 0;

    return (
      <div
        key={`level-${levelIndex}`}
        className="flex-none w-[280px] border-r border-gray-200 overflow-y-auto"
      >
        <div className="p-3 space-y-1">
          {categoryList.map((category) => {
            const isActive = activePath[levelIndex] === category.id;
            const isSelected =
              selectedPath[selectedPath.length - 1]?.id === category.id;
            const hasChild = hasChildren(category.id);

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category, levelIndex, false)}
                className={`
                  w-full text-left px-3 py-2.5 text-sm rounded-lg 
                  flex justify-between items-center group transition-all
                  ${
                    isSelected
                      ? "bg-red-100 border-2 border-red-400 text-red-800 font-semibold shadow-md"
                      : isActive
                        ? "bg-red-50 text-red-700 font-medium shadow-sm"
                        : "hover:bg-gray-100 text-gray-700"
                  }
                `}
              >
                <span className="truncate">{category.category_name}</span>
                {isSelected ? (
                  <Check size={14} className="text-red-500 flex-shrink-0" />
                ) : hasChild ? (
                  <ChevronRight
                    size={14}
                    className={`flex-shrink-0 ${isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                ) : null}
              </button>
            );
          })}

          {/* Thêm option "Khác" cho level >= 2 */}
          {shouldShowOther && parentCategory && (
            <button
              onClick={() =>
                handleCategoryClick(parentCategory, levelIndex, true)
              }
              className={`
                w-full text-left px-3 py-2.5 text-sm rounded-lg 
                flex justify-between items-center group transition-all
                border-t mt-2 pt-2
                ${
                  selectedPath[selectedPath.length - 1]?.id ===
                    parentCategory.id && selectedPath.length === levelIndex
                    ? "bg-red-100 border-2 border-red-400 text-red-800 font-semibold shadow-md"
                    : "hover:bg-gray-100 text-gray-600 italic"
                }
              `}
            >
              <span className="truncate">Khác</span>
              {selectedPath[selectedPath.length - 1]?.id ===
                parentCategory.id &&
                selectedPath.length === levelIndex && (
                  <Check size={14} className="text-red-500 flex-shrink-0" />
                )}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render tất cả các cột dựa trên active path
  const renderAllColumns = () => {
    const columns = [] as React.ReactNode[];

    // Cột đầu tiên - Level 0
    columns.push(renderCategoryColumn(0, 0));

    // Các cột tiếp theo dựa trên active path
    for (let i = 0; i < activePath.length; i++) {
      if (activePath[i] !== null) {
        const nextColumn = renderCategoryColumn(activePath[i]!, i + 1);
        if (nextColumn) {
          columns.push(nextColumn);
        }
      }
    }

    return columns;
  };

  // Search categories
  const filteredCategories = searchText
    ? categories.filter(
        (cat) =>
          cat.category_name.toLowerCase().includes(searchText.toLowerCase()) ||
          cat.category_slug.toLowerCase().includes(searchText.toLowerCase()),
      )
    : null;

  // Handle scroll buttons
  const handleScroll = (direction: string) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.scrollTo({
        left:
          direction === "left"
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleOk = () => {
    if (selectedPath.length > 0) {
      const selectedCategory = selectedPath[selectedPath.length - 1];
      console.log("Selected category:", selectedCategory);
      setProduct((prev: any) => ({
        ...prev,
        category_id: selectedCategory.id,
      }));
      onConfirm?.(selectedCategory, selectedPath);
      console.log("Full path:", selectedPath);
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      {/* <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Chọn Danh Mục Sản Phẩm
      </button> */}

      <Modal
        title={
          <div className="text-lg font-semibold">Chọn Danh Mục Sản Phẩm</div>
        }
        width={1000}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          disabled: selectedPath.length === 0,
          className: "bg-red-500 hover:bg-red-600",
        }}
      >
        <div className="bg-gray-50 rounded-lg border p-4">
          <div className="flex flex-col gap-3">
            {/* Search bar */}
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
                <Search size={16} />
              </span>
              <Input
                className="pl-10"
                placeholder="Tìm kiếm danh mục..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </div>

            {/* Search Results */}
            {filteredCategories && (
              <div className="bg-white rounded-md border p-3 max-h-80 overflow-y-auto">
                <div className="text-sm text-gray-500 mb-2">
                  Tìm thấy {filteredCategories.length} kết quả
                </div>
                <div className="space-y-1">
                  {filteredCategories.map((category) => {
                    const path = buildPathFromCategory(category.id);
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          const newActivePath: (number | null)[] = [
                            null,
                            null,
                            null,
                            null,
                            null,
                          ];
                          path.forEach((cat, idx) => {
                            newActivePath[idx] = cat.id;
                          });
                          setActivePath(newActivePath);
                          setSelectedPath(path);
                          setSearchText("");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg"
                      >
                        <div className="font-medium">
                          {category.category_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {path.map((p) => p.category_name).join(" → ")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category Tree Navigation */}
            {!filteredCategories && (
              <div className="relative">
                {/* Scroll buttons */}
                <button
                  onClick={() => handleScroll("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border rounded-l-md p-2 shadow-lg"
                >
                  <ChevronLeft
                    size={16}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  />
                </button>
                <button
                  onClick={() => handleScroll("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border rounded-r-md p-2 shadow-lg"
                >
                  <ChevronRight
                    size={16}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  />
                </button>

                {/* Scrollable container */}
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto h-80 border border-gray-200 bg-white rounded-md pb-2 pt-2"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#fca5a5 #f1f5f9",
                  }}
                >
                  {renderAllColumns()}
                  <div className="flex-none w-4" />
                </div>
              </div>
            )}

            {/* Selected path */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="font-semibold text-red-700 flex-shrink-0">
                Đã chọn:
              </span>
              {selectedPath.length > 0 ? (
                <>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium border border-red-200 truncate">
                    {selectedPath.map((cat) => cat.category_name).join(" → ")}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                    (ID: {selectedPath[selectedPath.length - 1].id} -{" "}
                    {selectedPath.length} cấp)
                  </span>
                </>
              ) : (
                <span className="text-gray-400 text-sm">
                  Chưa chọn danh mục
                </span>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .flex-none::-webkit-scrollbar {
          width: 6px;
        }
        .flex-none::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .flex-none::-webkit-scrollbar-thumb {
          background: #fca5a5;
          border-radius: 3px;
        }
        .flex-none::-webkit-scrollbar-thumb:hover {
          background: #f87171;
        }
      `}</style>
    </div>
  );
};

export default CategorySelectorModal;
