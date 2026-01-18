import { DbCategory } from "@/helper/utils";
import http from "@/lib/http";
import { Product } from "@/validators/product";

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

export const uploadToProduct = async (formData: FormData): Promise<any> => {
  return await http
    .post("/seller/product-image/product/1", formData)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
