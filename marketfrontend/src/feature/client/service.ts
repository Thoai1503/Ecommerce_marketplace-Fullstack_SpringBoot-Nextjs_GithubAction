<<<<<<< HEAD
import http from "@/lib/http";
import { IProduct } from "@/validators/product";
=======
import { API_URL } from "@/helper/api";
import http from "@/lib/http";
import { IOrder } from "@/validators/order";
import { IProduct } from "@/validators/product";
import axios from "axios";
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e

export const getAllProduct = async (): Promise<Partial<IProduct>> => {
  return http
    .get("/product")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
<<<<<<< HEAD
=======

export const createOrder = async (orderData: IOrder): Promise<any> => {
  return axios
    .post(`${API_URL}/api/orders`, orderData)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
