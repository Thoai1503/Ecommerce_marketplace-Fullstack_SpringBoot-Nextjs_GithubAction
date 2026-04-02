import { API_URL } from "@/helper/api";
import http from "@/lib/http";
import { IOrder } from "@/validators/order";
import { IProduct } from "@/validators/product";
import axios from "axios";

export const getAllProduct = async (): Promise<Partial<IProduct>> => {
  return http
    .get("/product")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const createOrder = async (orderData: IOrder): Promise<any> => {
  return axios
    .post(`${API_URL}/api/orders`, orderData)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
