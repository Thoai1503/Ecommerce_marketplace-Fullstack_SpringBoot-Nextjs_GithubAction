import type { Category, DbCategory } from "@/helper/utils";
import http from "@/lib/http";

export const getAllCategory = async (): Promise<DbCategory[]> => {
  return await http
    .get("/category")
    .then((res) => res.data)
    .catch((error) => {
      console.log(error);
      throw error;
    });
};

export const createCategory = async (item: DbCategory): Promise<DbCategory> => {
  return await http
    .post("/category", item)
    .then((res) => res.data)
    .catch((error) => {
      console.log(error);
      throw error;
    });
};
