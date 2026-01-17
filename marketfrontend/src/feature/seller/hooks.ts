// hooks/useAddProductSeller.ts
import { Product } from "@/validators/product";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { categoryQuery } from "./query";
import { slugify, generateUniqueSlug, isValidSlug } from "@/helper/utils";
import { addProduct } from "./service";
import { message, UploadFile, UploadProps } from "antd";

export const useAddProductSeller = () => {
  const { data: categories } = useQuery(categoryQuery.list);

  const [product, setProduct] = useState<Partial<Product>>({
    product_name: "",
    product_slug: "",
    shop_id: 1,
    category_id: 2,
    original_price: 0,
    price: 0,
  });

  const { mutate: add } = useMutation({
    mutationFn: (product: Partial<Product>) => addProduct(product),
    onSuccess: (data) => {
      message.success(`Lưu thành công sản phẩm thành công`);
      console.log(JSON.stringify(data));
    },
    onError: (error) => {
      //  alert(error.message);
      message.error(error.message);
    },
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
        "Slug không hợp lệ. Slug chỉ chứa chữ cái thường, số và dấu gạch ngang",
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
    // return;
    add(product);
    // TODO: Gọi API để tạo sản phẩm
  }, [product, validateProduct]);

  // Hàm tiện ích để generate slug unique (nếu cần check với database)
  const generateUniqueProductSlug = useCallback(
    async (name: string, existingSlugs: string[] = []) => {
      const uniqueSlug = generateUniqueSlug(name, existingSlugs);
      setProduct((prev) => ({ ...prev, product_slug: uniqueSlug }));
      return uniqueSlug;
    },
    [],
  );

  return {
    handleSubmitProduct,
    handleChangeProduct,
    product,
    categories,
    isManualSlug,
    resetSlugMode,
    setProduct,
    validateProduct,
    generateUniqueProductSlug,
  };
};

export const useAddImageSeller = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    // Giới hạn tối đa 8 ảnh như yêu cầu
    const updatedList = newFileList.slice(0, 8);
    setFileList(updatedList);

    // Optional: thông báo khi đạt giới hạn
    if (newFileList.length > 8) {
      message.warning("Chỉ được upload tối đa 8 ảnh!");
    }
  };
  return {};
};
