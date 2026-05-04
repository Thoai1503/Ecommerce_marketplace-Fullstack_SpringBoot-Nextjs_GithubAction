import { API_URL } from "@/helper/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { IProductVariant } from "@/validators/productVariant";

import { useMutation } from "@tanstack/react-query";
import path from "path";

const modelConfig = {
  path: "/product-variant",
  modal: "productVariant",
  baseUrl: API_URL,
};

export class ProductVariant extends Model {
  static queryKeys = {
    paginate: "PRODUCT_VARIANTS_PAGINATE_QUERY",
    findOne: "PRODUCT_VARIANTS_FIND_ONE_QUERY",
  };
  static object = ObjectsFactory.factory<IProductVariant>(
    modelConfig,
    this.queryKeys,
  );

  static updateProductVariant(
    variantId: number,
    payload: Partial<IProductVariant>,
  ) {
    return this.api
      .put<IProductVariant>({
        url: `${API_URL}${this.object.path}/${variantId}`,
        data: payload,
      })
      .then((r) => r.data);
  }
}

ProductVariant.setup(modelConfig);

export function useUpdateProductVariantMutation() {
  return useMutation<IProductVariant, unknown, Partial<IProductVariant>>({
    mutationFn: (payload: Partial<IProductVariant>) => {
      if (!payload.id) {
        throw new Error("Variant ID is required for update");
      }
      return ProductVariant.updateProductVariant(payload.id, payload);
    },
  });
}
