// hooks/useAddProductSeller.ts
import { Product } from "@/validators/product";
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { categoryQuery } from "./query";
import { slugify, generateUniqueSlug, isValidSlug } from "@/helper/utils";

export const useAddProductSeller = () => {
  const { data: categories } = useQuery(categoryQuery.list);

  const [product, setProduct] = useState<Partial<Product>>({
    product_name: "",
    product_slug: "",
    category_id: 2,
    original_price: 0,
    price: 0,
  });

  const [isManualSlug, setIsManualSlug] = useState(false);

  // Auto generate slug khi product_name thay đổi
  useEffect(() => {
    if (product.product_name && !isManualSlug) {
      const newSlug = slugify(product.product_name);
      setProduct((prev) => ({ ...prev, product_slug: newSlug }));
    }
  }, [product.product_name, isManualSlug]);

  const handleChangeProduct = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Nếu user thay đổi slug manually, đánh dấu để không auto-generate nữa
    if (name === "product_slug") {
      setIsManualSlug(true);
      // Tự động slugify khi user nhập slug
      const slugValue = slugify(value);
      setProduct((prev) => ({ ...prev, [name]: slugValue }));
      return;
    }

    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Hàm để reset auto-generate slug
  const resetSlugMode = useCallback(() => {
    setIsManualSlug(false);
    if (product.product_name) {
      const newSlug = slugify(product.product_name);
      setProduct((prev) => ({ ...prev, product_slug: newSlug }));
    }
  }, [product.product_name]);

  // Validate slug trước khi submit
  const validateProduct = useCallback(() => {
    const errors: string[] = [];

    if (!product.product_name?.trim()) {
      errors.push("Tên sản phẩm không được để trống");
    }

    if (!product.product_slug?.trim()) {
      errors.push("Slug không được để trống");
    } else if (!isValidSlug(product.product_slug)) {
      errors.push(
        "Slug không hợp lệ. Slug chỉ chứa chữ cái thường, số và dấu gạch ngang"
      );
    }

    if (!product.category_id) {
      errors.push("Vui lòng chọn danh mục");
    }

    if (product.price && product.price <= 0) {
      errors.push("Giá sản phẩm phải lớn hơn 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [product]);

  const handleSubmitProduct = useCallback(() => {
    const validation = validateProduct();

    if (!validation.isValid) {
      alert("Lỗi:\n" + validation.errors.join("\n"));
      return;
    }

    alert(JSON.stringify(product, null, 2));
    // TODO: Gọi API để tạo sản phẩm
  }, [product, validateProduct]);

  // Hàm tiện ích để generate slug unique (nếu cần check với database)
  const generateUniqueProductSlug = useCallback(
    async (name: string, existingSlugs: string[] = []) => {
      const uniqueSlug = generateUniqueSlug(name, existingSlugs);
      setProduct((prev) => ({ ...prev, product_slug: uniqueSlug }));
      return uniqueSlug;
    },
    []
  );

  return {
    handleSubmitProduct,
    handleChangeProduct,
    product,
    categories,
    isManualSlug,
    resetSlugMode,
    validateProduct,
    generateUniqueProductSlug,
  };
};

export const useAddImageSeller = () => {
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleAddImages = useCallback((files: File[]) => {
    setImages((prev) => [...prev, ...files]);

    // Tạo preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  }, []);

  const handleRemoveImage = useCallback(
    (index: number) => {
      setImages((prev) => prev.filter((_, i) => i !== index));

      // Revoke object URL để tránh memory leak
      URL.revokeObjectURL(previewUrls[index]);
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    },
    [previewUrls]
  );

  const clearImages = useCallback(() => {
    // Revoke tất cả object URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setPreviewUrls([]);
  }, [previewUrls]);

  return {
    images,
    previewUrls,
    handleAddImages,
    handleRemoveImage,
    clearImages,
  };
};
