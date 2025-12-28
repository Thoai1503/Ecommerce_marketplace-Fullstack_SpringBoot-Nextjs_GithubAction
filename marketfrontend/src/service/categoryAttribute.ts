import http from "@/lib/http";
import { CategoryAttribute } from "@/validators/categoryAttribute";

export const getByCategoryId = async (
  cattegory_id: number
): Promise<CategoryAttribute[]> => {
  return await http
    .get(`/category-attribute/category/${cattegory_id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
