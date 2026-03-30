import http from "@/lib/http";
<<<<<<< HEAD
import { IProduct } from "@/validators/product";
=======
import { IOrder } from "@/validators/order";
import { IProduct } from "@/validators/product";
import axios from "axios";
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5

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
    .post("http://localhost:8002/api/orders", orderData)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
