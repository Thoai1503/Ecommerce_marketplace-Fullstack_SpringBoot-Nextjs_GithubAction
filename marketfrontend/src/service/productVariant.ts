import http from "@/lib/http";

export const getProductVariantById = async (id: number): Promise<any> => {
  return http
    .get(`/product-variant/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
