import { IOrderShipment } from "@/validators/orderShipment";
import { Model } from "../core/model";
import { ObjectsFactory } from "../core/objectFactory";
import { API_URL } from "@/helper/api";

const modelConfig = {
  path: "/api/order-shipments",
  modal: "order-shipment",
};

export class OrderShipments extends Model {
  static queryKeys = {
    paginate: "ORDER_SHIPMENTS_PAGINATE_QUERY",
    findOne: "ORDER_SHIPMENTS_FIND_ONE_QUERY",
    findByShopId: "ORDER_SHIPMENTS_FIND_ONE_BY_SHOP_ID",
  };
  static object = ObjectsFactory.factory<IOrderShipment>(
    modelConfig,
    this.queryKeys,
  );

  static getByShopId(shopId: number) {
    return {
      queryKey: [this.queryKeys.findByShopId, shopId],
      queryFn: (): Promise<IOrderShipment[]> =>
        this.api
          .get<IOrderShipment[]>({
            url: `${API_URL}${this.path}/shop/${shopId}`,
          })
          .then((r) => r.data),
    };
  }
}
