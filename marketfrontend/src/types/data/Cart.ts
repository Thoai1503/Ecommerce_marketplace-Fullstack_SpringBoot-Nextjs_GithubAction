import { ICart } from "@/validators/cart";
import { Model } from "../core/model";
import { ObjectsFactory } from "../core/objectFactory";
import { API_URL } from "@/helper/api";
import { IHttpError, IResponse } from "../core/api";
import { useMutation } from "@tanstack/react-query";

const modelConfig = {
  path: "/cart",
  modal: "cart",
};

export class Cart extends Model {
  static queryKeys = {
    paginate: "CARTS_PAGINATE_QUERY",
    findOne: "CARTS_FIND_ONE_QUERY",
  };
  static object = ObjectsFactory.factory<ICart>(modelConfig, this.queryKeys);
  static addToCart(payload: FormData) {
    return this.api.post<ICart>({ url: "", data: payload });
  }
}

Cart.setup({ path: "/api/cart", baseUrl: API_URL });

export function useAddToCartMutation() {
  return useMutation<ICart, IHttpError, FormData>({
    mutationFn: (payload: FormData) => {
      return Cart.addToCart(payload).then((r) => r.data);
    },
  });
}
