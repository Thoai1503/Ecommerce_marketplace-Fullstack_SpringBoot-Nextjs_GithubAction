import http from "@/lib/http";

export const addProduct = async (product: any): Promise<any> => {
  return await http
    .post("/seller/product", product)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
