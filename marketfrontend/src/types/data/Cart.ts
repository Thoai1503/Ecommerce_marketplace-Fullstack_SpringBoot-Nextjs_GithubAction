import { CartItem, ICart } from "@/validators/cart";
import { Model } from "../core/model";
import { ObjectsFactory } from "../core/objectFactory";
import { API_URL } from "@/helper/api";
import { IHttpError, IResponse } from "../core/api";
import { useMutation } from "@tanstack/react-query";

const modelConfig = {
  path: "/api/cart",
  modal: "cart",
};

export class Cart extends Model {
  static queryKeys = {
    paginate: "CARTS_PAGINATE_QUERY",
    findOne: "CARTS_FIND_ONE_QUERY",
  };
  static object = ObjectsFactory.factory<ICart>(modelConfig, this.queryKeys);
  static addToCart(payload: ICart) {
    return this.api.post<ICart>({ url: this.path, data: payload });
  }
  static getByUserId(userId: number) {
    return {
      queryKey: ["CARTS_BY_USER_ID_QUERY", userId],
      queryFn: (): Promise<CartItem[]> =>
        this.api
          .get<CartItem[]>({
            url: `${this.path}/user/${userId}`,
          })
          .then((r) => r.data),
    };
  }
}

Cart.setup({ path: "/api/cart", baseUrl: API_URL });

export function useAddToCartMutation() {
  return useMutation<ICart, IHttpError, ICart>({
    mutationFn: (payload: ICart) => {
      return Cart.addToCart(payload).then((r) => r.data);
    },
  });
}

export function useQueryCartByUserId(userId: number) {
  return Cart.object.paginate({
    url: `${Cart.object.path}/user/${userId}`,
  });
}
