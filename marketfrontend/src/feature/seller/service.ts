import { DbCategory } from "@/helper/utils";
import http from "@/lib/http";
import { Product } from "@/validators/product";
import { ProductImage } from "./types";

export const addProduct = async (
  product: Partial<Product>,
): Promise<Product> => {
  return await http
    .post("/seller/product", product)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getAllCategory = async (): Promise<DbCategory[]> => {
  return await http
    .get("/category")
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
    .then((res) => res.data)
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
