import { DbCategory } from "@/helper/utils";
import http from "@/lib/http";
import { IProduct } from "@/validators/product";
import { ProductImage } from "./types";
import { Shop } from "@/validators/shop";
import { ProductVariant } from "@/validators/productVariant";

export const addProduct = async (
  product: Partial<IProduct>,
): Promise<IProduct> => {
  return await http
    .post("/seller/product", product)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
export const getProductById = async (id: number): Promise<IProduct> => {
  return await http
    .get(`/seller/product/${id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getAllCategory = async (): Promise<DbCategory[]> => {
  return await http
    .get("/api/categories")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const uploadToProduct = async (
  id: number,
  formData: FormData,
): Promise<any> => {
  return await http
    .post(`/seller/product-image/product/${id}`, formData)
    .then((res) => {
      alert("Upload successful: " + JSON.stringify(res.data));
      return res.data;
    })
    .catch((error) => {
      throw error;
    });
};

export const getProductImageByProductId = async (
  product_id: number,
): Promise<ProductImage[]> => {
  return await http
    .get(`/seller/product-image/product/${product_id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getShopByUserId = async (user_id: number): Promise<Shop> => {
  return await http
    .get(`/seller/shop/user/${user_id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const createProductVariant = async (
  productVariant: ProductVariant,
): Promise<ProductVariant> => {
  return await http
    .post("/seller/product-variant", productVariant)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateVariantImage = async (
  variantId: number,
  formData: FormData,
): Promise<any> => {
  return await http
    .post(`/seller/product-variant/${variantId}/image`, formData)
    .then((res) => {
      alert("Upload successful: " + JSON.stringify(res.data));
      return res.data;
    })
    .catch((error) => {
      throw error;
    });
};
