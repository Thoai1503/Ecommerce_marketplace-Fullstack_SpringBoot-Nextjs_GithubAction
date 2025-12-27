import {
  Category,
  convertDbCategoriesToComponentFormat,
  DbCategory,
} from "@/helper/utils";
import { categoryQuery } from "@/query/category";
import { createCategory, getAllCategory } from "@/service/category";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type FormMode = "create" | "edit";
export const useCategoryPage = (
  onSuccessCallback?: (message: string) => void
) => {
  const { data, isPending } = useQuery(categoryQuery.list);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    id: null as number | null,
    parent_id: 0,
    name: "",
    slug: "",
    level: 0,
    isVisible: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formMode, setFormMode] = useState<FormMode>("create");
  const { mutate: create } = useMutation({
    mutationFn: (en: DbCategory) => createCategory(en),
    onSuccess: (data) => {
      // alert(JSON.stringify(data));
      onSuccessCallback &&
        onSuccessCallback("Thêm thành công danh mục: " + data.category_name);
    },
    onError: (error) => {
      alert(error.message);
    },
  });
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formMode === "create") {
      console.log("Creating new category:", formData);
      // alert(JSON.stringify(formData));
      // return;
      create({
        id: 0,
        category_name: formData.name,
        category_slug: formData.slug,
        parent_id: formData.parent_id,
        level: formData.level,
        is_active: 1,
      });
    } else {
      console.log("Updating category:", formData);
    }
  };
  const resetToCreateMode = () => {
    setFormMode("create");
    setSelectedCategory(null);
    setFormData({
      id: null,
      parent_id: 0,
      name: "",
      slug: "",
      level: 0,
      isVisible: true,
    });
  };

  const toggleCategory = (id: number) => {
    const updateCategories = (cats: Category[]): Category[] => {
      return cats.map((cat) => {
        if (cat.id === id) {
          return { ...cat, isExpanded: !cat.isExpanded };
        }
        if (cat.children && cat.children.length > 0) {
          return { ...cat, children: updateCategories(cat.children) };
        }
        return cat;
      });
    };
    setCategories(updateCategories(categories));
  };
  useEffect(() => {
    if (data) {
      setCategories([...convertDbCategoriesToComponentFormat(data)]);
    }
  }, [data]);
  const handleSelectCategory = (category: Category) => {
    setFormMode("edit");
    setSelectedCategory(category);
    setFormData({
      id: category.id,
      parent_id: category.parent_id || 0,
      name: category.name,
      slug: category.slug,
      level: category.level,
      isVisible: category.isVisible,
    });
  };

  const handleDelete = (categoryId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      console.log("Deleting category:", categoryId);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    categories,
    isPending,
    toggleCategory,
    selectedCategory,
    handleSelectCategory,
    setSelectedCategory,
    resetToCreateMode,
    handleSubmit,
    handleNameChange,
    handleDelete,
    formData,
    formMode,
    setFormData,
    setFormMode,
    data,
  };
};
