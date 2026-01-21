import http from "@/lib/http";
import { Units } from "@/validators/units";

export const getAllUnit = async (): Promise<Units[]> => {
  return await http
    .get("/unit")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
