// useCategoryPage.ts
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Category,
  convertDbCategoriesToComponentFormat,
  DbCategory,
} from "@/helper/utils";
import { categoryQuery } from "@/query/category";
import { createCategory } from "@/service/category";

type FormMode = "create" | "edit";


interface FormErrors {
  name?: string;
  slug?: string;
}

export const useCategoryPage = (
  onSuccessCallback?: (message: string) => void,
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

  // Thêm state cho lỗi
  const [errors, setErrors] = useState<FormErrors>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [formMode, setFormMode] = useState<FormMode>("create");

  const { mutate: create } = useMutation({
    mutationFn: (en: DbCategory) => createCategory(en),
    onSuccess: (data) => {
      onSuccessCallback &&
        onSuccessCallback("Thêm thành công danh mục: " + data.category_name);
      resetToCreateMode();
    },
    onError: (error: any) => {
      alert(error.message || "Có lỗi xảy ra khi tạo danh mục");
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

  //   const sortedData = useMemo(() => {
  //   return sortCategoriesByTree(data);
  // }, [data]);

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setFormData({ ...formData, name, slug });

    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors.name || errors.slug) {
      setErrors({ ...errors, name: undefined, slug: undefined });
    }
  };

  // Hàm validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên danh mục không được để trống";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Đường dẫn (slug) không được để trống";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (formMode === "create") {
      create({
        id: 0,
        category_name: formData.name.trim(),
        category_slug: formData.slug,
        parent_id: formData.parent_id,
        level: formData.level,
        is_active: formData.isVisible ? 1 : 0,
      });
    } else {
      console.log("Updating category:", formData);
      // TODO: Gọi API update ở đây
      onSuccessCallback && onSuccessCallback("Cập nhật thành công!");
      resetToCreateMode();
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
    setErrors({}); // Xóa lỗi khi reset
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
    setErrors({}); // Xóa lỗi khi chuyển sang edit
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
    setFormData,
    formMode,
    setFormMode,
    data,
    errors, // Trả về errors
  };
};
