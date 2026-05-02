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

  static getByShopId(
    shopId: number,
    filters?: {
      status?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: string;
      page?: number;
      pageSize?: number;
      paymentStatus?: string;
    },
  ) {
    const params = new URLSearchParams();

    // Add non-empty filters to query params
    if (filters?.status && filters.status !== "ALL")
      params.set("status", filters.status);
    if (filters?.paymentStatus && filters.paymentStatus !== "ALL")
      params.set("paymentStatus", filters.paymentStatus);
    if (filters?.search) params.set("search", filters.search);

    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);

    if (filters?.sortBy) params.set("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters?.page) params.set("page", filters?.page.toString());
    if (filters?.pageSize) params.set("size", filters?.pageSize.toString());

    console.log("Fetching order shipments with params:", params.toString());
    return {
      queryKey: [
        this.queryKeys.findByShopId,
        shopId,
        JSON.stringify(filters ?? {}),
      ],
      queryFn: (): Promise<IOrderShipment[]> =>
        this.api
          .get<IOrderShipment[]>({
            url: `${API_URL}/api/orders/shipments/shop/${shopId}${params.toString() ? `?${params.toString()}` : ""}`,
            //params: filterParams,
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
