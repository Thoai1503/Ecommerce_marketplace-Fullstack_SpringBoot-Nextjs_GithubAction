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
            url: `${API_URL}/api/orders/shipments/shop/${shopId}`,
          })
          .then((r) => r.data),
    };
  }

  static getById(shipmentId: number) {
    return {
      queryKey: [this.queryKeys.findOne, shipmentId],
      queryFn: (): Promise<IOrderShipment> =>
        this.api
          .get<IOrderShipment>({
            url: `${API_URL}/api/orders/shipments/${shipmentId}`,
          })
          .then((r) => r.data),
      enabled: !!shipmentId,
    };
  }

  static confirmPackaged(shipmentId: number) {
    return this.api.post<{
      shipmentId: number;
      orderId: number;
      trackingCode: string;
      shippingStatus: string;
      message: string;
    }>({
      url: `${API_URL}/api/orders/shipments/${shipmentId}/confirm-packaged`,
    });
  }

  static createAdjustmentRequest(
    shipmentId: number,
    payload: {
      shopReason: string;
      items: Array<{
        orderItemId: number;
        newQuantity: number;
      }>;
    },
  ) {
    return this.api.post({
      url: `${API_URL}/api/orders/shipments/${shipmentId}/adjustment-request`,
      data: payload,
    });
  }

  static cancelByOutOfStock(
    shipmentId: number,
    payload: {
      reason: string;
    },
  ) {
    return this.api.post({
      url: `${API_URL}/api/orders/shipments/${shipmentId}/cancel-by-oos`,
      data: payload,
    });
  }
}
