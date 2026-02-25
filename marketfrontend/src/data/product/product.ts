import { ObjectsFactory } from "@/types/core/objectFactory";
import { Model } from "../../types/core/model";
import { IProduct } from "@/validators/product";
import { API_URL } from "@/helper/api";

export const modelConfig = {
  path: `${API_URL}/product`,
  model: "Product",
};

export class Product extends Model {
  static queryKeys = {
    findAll: "products",
    findOne: "product",
  };
  static objects = ObjectsFactory.factory<IProduct>(
    modelConfig,
    this.queryKeys,
  );

  static getProductDetails(productId: number) {
    return this.api.get<IProduct>({ url: `${this.path}/${productId}` });
  }
}
