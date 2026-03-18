// hooks/useAddProductSeller.ts
import { IProduct } from "@/validators/product";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { categoryQuery, productImageQuery } from "./query";
import { slugify, generateUniqueSlug, isValidSlug } from "@/helper/utils";
import { addProduct, createProductVariant, uploadToProduct } from "./service";
import { message, UploadFile, UploadProps } from "antd";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { ProductVariant } from "@/validators/productVariant";

export const useAddProductSeller = (
  onSuccessCallback: (id: number) => void,
  id?: number,
) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { roles, userId, shop } = useSellerAuth();
  const { data: categories } = useQuery(categoryQuery.list);

  //  alert(roles);

  const [product, setProduct] = useState<Partial<IProduct>>({
    product_name: "",
    product_slug: "",
    shop_id: 0,
    description: "",
    category_id: 2,
    original_price: 0,
    price: 0,
  });
  useEffect(() => {
    if (shop) setProduct((pre) => ({ ...pre, shop_id: shop.id }));
  }, [shop]);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    // Giới hạn tối đa 8 ảnh như yêu cầu
    const updatedList = newFileList.slice(0, 8);
    setFileList(updatedList);

    // Optional: thông báo khi đạt giới hạn
    if (newFileList.length > 8) {
      message.warning("Chỉ được upload tối đa 8 ảnh!");
    }
  };

  const handleSave = () => {
    //  console.log("Saving product:", formData);
    console.log("Images:", fileList);
    message.success("Sản phẩm đã được lưu thành công!");
  };

  const { mutate: createVariant } = useMutation({
    mutationFn: (en: ProductVariant) => createProductVariant(en),
    onSuccess: (data) => {
      console.log("Variant created:", data);
      message.success(`Tạo biến thể sản phẩm thành công`);
    },
    onError: (error) => {
      console.error("Error creating variant:", error);
      message.error(`Lỗi khi tạo biến thể sản phẩm: ${error.message}`);
    },
  });

  const { mutate: add } = useMutation({
    mutationFn: (product: Partial<IProduct>) => addProduct(product),
    onSuccess: (data) => {
      //    message.success(`Lưu thành công sản phẩm thành công`);
      console.log("Added: " + JSON.stringify(data));
      onSuccessCallback(data.id);
      // Reset form sau khi thêm thành công
      setProduct({
        product_name: "",
        product_slug: "",
        shop_id: shop?.id || 0,
        description: "",
        category_id: 2,
        original_price: 0,
        price: 0,
      });
      createProductVariant({
        id: 0,
        product_id: data.id,
        variant_name: data.product_name,
        sku: `SKU-${data.id}`,
        price: data.original_price || 0,
        stock_quantity: data.stock_quantity || 0,
        image_url: "",
      });
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
    fileList,
    handleChange,
    shop,
  };
};
// hooks/useAddProductSeller.ts - useAddImageSeller section
export const useAddImageSeller = (id?: number) => {
  console.log("🔧 useAddImageSeller hook called with id:", id);

  const { data, isLoading, isError, error } = useQuery(
    productImageQuery.by_product_id(id || 0),
  );
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  console.log("Query status:", { isLoading, isError, hasData: !!data });
  if (isError) {
    console.error("❌ Query error details:", error);
    // Expand the error to see what's inside
    if (Array.isArray(error)) {
      error.forEach((err, index) => {
        console.error(`Error ${index}:`, err);
        console.error(
          `Error ${index} stringified:`,
          JSON.stringify(err, null, 2),
        );
      });
    }
  }

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    // Giới hạn tối đa 8 ảnh như yêu cầu
    const updatedList = newFileList.slice(0, 8);
    setFileList(updatedList);

    // Optional: thông báo khi đạt giới hạn
    if (newFileList.length > 8) {
      message.warning("Chỉ được upload tối đa 8 ảnh!");
    }
    console.log("Image list:" + JSON.stringify(fileList));
    const uploadImage = updatedList.filter((item) =>
      item.thumbUrl?.startsWith("data:image"),
    );
    console.log("uploadImage: " + uploadImage.length);
  };

  const { mutate: upload } = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      uploadToProduct(id, formData),
    onSuccess: (data) => {
      console.log(data);
      message.success(`Lưu thành công sản phẩm thành công`);
    },
    onError: (error) => alert(error),
  });

  const handleSave = () => {
    console.log("Images:", fileList);
    const formData = new FormData();
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj as Blob);
      }
    });

    console.log(
      "Images count:",
      fileList.filter((f) => f.originFileObj).length,
    );
    console.log("Form data:", formData);
    upload({ id: 1, formData: formData });
    message.success("Sản phẩm đã được lưu thành công!");
  };
  const handleSaveImageAfterProduct = (product_id: number) => {
    console.log("Images:", fileList);
    const formData = new FormData();
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj as Blob);
      }
    });

    console.log(
      "Images count:",
      fileList.filter((f) => f.originFileObj).length,
    );
    console.log("Form data:", formData);
    upload({ id: product_id, formData: formData });
    message.success("Sản phẩm đã được lưu thành công!");
  };

  useEffect(() => {
    if (isError) {
      console.warn(
        "⚠️ Cannot load images due to error, keeping empty fileList",
      );
      setFileList([]); // Reset to empty on error
      return;
    }

    if (data && data.length > 0) {
      console.log("✅ Data exists, mapping images...");
      const images = data.map((item) => {
        console.log("Processing item:", item);
        return {
          uid: String(item.id),
          name: item.image_url.split("/").pop() || `image-${item.id}`,
          status: "done" as const,
          url: item.image_url,
          thumbUrl: item.image_url,
        };
      });
      console.log("📸 Mapped images:", images);
      setFileList(images);
    } else {
      console.log("ℹ️ No images found for this product");
      setFileList([]);
    }
  }, [data, isLoading, isError]);

  return { fileList, handleChange, handleSave, handleSaveImageAfterProduct };
};
