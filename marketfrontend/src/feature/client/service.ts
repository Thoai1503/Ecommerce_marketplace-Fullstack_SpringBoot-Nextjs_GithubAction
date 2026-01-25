import http from "@/lib/http";
import { Product } from "@/validators/product";

export const getAllProduct = async (): Promise<Partial<Product>> => {
  return http
    .get("/product")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
