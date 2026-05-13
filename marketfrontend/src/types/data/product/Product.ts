import { API_URL } from "@/helper/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { IProduct } from "@/validators/product";
import { useMutation } from "@tanstack/react-query";

const modelConfig = {
  path: "/product",
  modal: "product",
  baseUrl: API_URL,
};

export class Product extends Model {
  static queryKeys = {
    paginate: "PRODUCTS_PAGINATE_QUERY",
    findOne: "PRODUCTS_FIND_ONE_QUERY",
  };
  static object = ObjectsFactory.factory<IProduct>(modelConfig, this.queryKeys);

  static getById(productId: number) {
    return {
      queryKey: [this.queryKeys.findOne, productId],
      queryFn: (): Promise<IProduct> =>
        this.api
          .get<IProduct>({
            url: `${API_URL}${this.object.path}/${productId}`,
          })
          .then((r) => r.data),
      enabled: !!productId,
    };
  }

  static updateProduct(productId: number, payload: Partial<IProduct>) {
    return this.api
      .put<IProduct>({
        url: `${API_URL}${this.object.path}/${productId}`,
        data: payload,
      })
      .then((r) => r.data);
  }
}

Product.setup(modelConfig);

export function useUpdateProductMutation() {
  return useMutation<
    IProduct,
    unknown,
    { id: number; updatedData: Partial<IProduct> }
  >({
    mutationFn: ({ id, updatedData }) => Product.updateProduct(id, updatedData),
  });
}
