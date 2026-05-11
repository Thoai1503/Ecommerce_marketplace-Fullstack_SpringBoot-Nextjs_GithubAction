// hooks/useAddProductSeller.ts
import { IProduct } from "@/validators/product";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import {
  categoryProductOptionsQuery,
  categoryQuery,
  productImageQuery,
} from "./query";
import { slugify, generateUniqueSlug, isValidSlug } from "@/helper/utils";
import {
  addProduct,
  createProductVariant,
  saveProductAttributes,
  updateVariantImage,
  uploadToProduct,
} from "./service";
import type { ProductAttributePayload, ProductCreatePayload } from "./service";
import { message, UploadFile, UploadProps } from "antd";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { IProductVariant } from "@/validators/productVariant";

export interface ProductAttributeSelection {
  attributeValueId?: number | null;
  unitId?: number | null;
  valueText?: string;
}

export const useAddProductSeller = (
  onSuccessCallback: (id: number) => void,
  id?: number,
  variantImageFile?: UploadFile,
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
    category_id: 0,
    brand: null,
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    stock_quantity: 0,
    original_price: 0,
    price: 0,
  });
  const [productAttributeSelections, setProductAttributeSelections] = useState<
    Record<number, ProductAttributeSelection>
  >({});

  const selectedCategoryId = Number(product.category_id || 0);
  const {
    data: categoryProductOptions,
    isFetching: isLoadingCategoryProductOptions,
  } = useQuery({
    ...categoryProductOptionsQuery.by_category_id(selectedCategoryId),
    enabled: selectedCategoryId > 0,
  });

  useEffect(() => {
    if (shop) setProduct((pre) => ({ ...pre, shop_id: shop.id }));
  }, [shop]);

  useEffect(() => {
    setProductAttributeSelections({});
    setProduct((prev) => {
      if (!prev.brand) return prev;
      return { ...prev, brand: null };
    });
  }, [selectedCategoryId]);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    // Giới hạn tối đa 8 ảnh như yêu cầu
    const updatedList = newFileList.slice(0, 8);
    setFileList(updatedList);

    // Optional: thông báo khi đạt giới hạn
    if (newFileList.length > 8) {
      message.warning("Chỉ được upload tối đa 8 ảnh!");
    }
  };

  // const { mutate: createVariant } = useMutation({
  //   mutationFn: (en: ProductVariant) => createProductVariant(en),
  //   onSuccess: (data) => {
  //     console.log("Variant created:", data);
  //     message.success(`Tạo biến thể sản phẩm thành công`);
  //   },
  //   onError: (error) => {
  //     console.error("Error creating variant:", error);
  //     message.error(`Lỗi khi tạo biến thể sản phẩm: ${error.message}`);
  //   },
  // });

  const { mutate: createVariant } = useMutation({
    mutationFn: (en: IProductVariant) => createProductVariant(en),
    onSuccess: (data) => {
      console.log("Variant created:", data);
      message.success(`Tạo biến thể sản phẩm thành công`);
      if (variantImageFile?.originFileObj) {
        const formData = new FormData();

        formData.append("image", variantImageFile.originFileObj as Blob); // Upload ảnh được chọn cho biến thể
        updateVariantImageMutate({ id: data.id, formData });
      }
    },
    onError: (error) => {
      console.error("Error creating variant:", error);
      message.error(`Lỗi khi tạo biến thể sản phẩm: ${error.message}`);
    },
  });

  const { mutate: updateVariantImageMutate } = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      updateVariantImage(id, formData),
    onSuccess: (data) => {
      console.log("Variant image updated:", data);
      message.success(`Cập nhật ảnh biến thể sản phẩm thành công`);
    },
    onError: (error) => {
      console.error("Error updating variant image:", error);
      message.error(`Lỗi khi cập nhật ảnh biến thể sản phẩm: ${error.message}`);
    },
  });

  const buildProductAttributePayload = useCallback(
    (productId: number): ProductAttributePayload[] =>
      Object.entries(productAttributeSelections)
        .map(([attributeId, selection]): ProductAttributePayload => {
          const valueText = selection.valueText?.trim() || null;

          return {
            productId,
            attributeId: Number(attributeId),
            attributeValueId: selection.attributeValueId ?? null,
            valueText,
            valueNumber: null,
            valueDate: null,
            unitId: selection.unitId ?? null,
          };
        })
        .filter(
          (item) =>
            (item.attributeValueId != null && item.attributeValueId > 0) ||
            Boolean(item.valueText) ||
            item.valueNumber != null ||
            Boolean(item.valueDate),
        ),
    [productAttributeSelections],
  );

  const { mutate: add } = useMutation({
    mutationFn: (product: ProductCreatePayload) => addProduct(product),
    onSuccess: async (data, submittedProduct) => {
      //    message.success(`Lưu thành công sản phẩm thành công`);
      console.log("Added: " + JSON.stringify(data));
      const attributePayload = (submittedProduct.attributes ?? []).map(
        (attribute) => ({
          ...attribute,
          productId: data.id,
        }),
      );
      const savedAttributes = (data as IProduct & {
        attributes?: ProductAttributePayload[];
      }).attributes;
      const attributesAlreadySaved =
        Array.isArray(savedAttributes) &&
        savedAttributes.length >= attributePayload.length;

      if (attributePayload.length > 0 && !attributesAlreadySaved) {
        try {
          await saveProductAttributes(data.id, attributePayload);
        } catch (error: any) {
          console.error("Error saving product attributes:", {
            payload: attributePayload,
            response: error?.response?.data,
            status: error?.response?.status,
            error,
          });
          message.error(
            "Sản phẩm đã tạo nhưng lưu thuộc tính thất bại: " +
              (error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Unknown error"),
          );
        }
      }

      onSuccessCallback(data.id);
      // Reset form sau khi thêm thành công
      setProduct({
        product_name: "",
        product_slug: "",
        shop_id: shop?.id || 0,
        description: "",
        category_id: 0,
        brand: null,
        original_price: 0,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        price: 0,
        stock_quantity: 0,
      });
      setProductAttributeSelections({});
      createVariant({
        id: 0,
        product_id: data.id,
        variant_name: data.product_name,
        sku: `SKU-${data.id}`,
        price: data.original_price || 0,
        stock_quantity: data.stock_quantity || 0,
        weight: data.weight || 0,
        height: data.height || 0,
        length: data.length || 0,
        width: data.width || 0,
        image_url: data.image_url || "",
      });
    },
    onError: (error) => {
      //  alert(error.message);
      message.error("Lỗi thêm sản phẩm: " + error.message);
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

    // alert(JSON.stringify(product, null, 2));
    // return;
    add({
      ...product,
      attributes: buildProductAttributePayload(0),
    });
    // TODO: Gọi API để tạo sản phẩm
  }, [add, buildProductAttributePayload, product, validateProduct]);

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
    categoryProductOptions,
    isLoadingCategoryProductOptions,
    productAttributeSelections,
    setProductAttributeSelections,
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
    //  alert("uploadImage: " + JSON.stringify(updatedList));
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
    //  message.success("Sản phẩm đã được lưu thành công!");
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

export const useEditProductDetails = (id: number) => {
  return {};
};
