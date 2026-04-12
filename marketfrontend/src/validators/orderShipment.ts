export interface IOrderShipment {
  id: number;
  order_id: number;
  shop_id: number;
  shipment_code: string;
  shipping_fee: number;
  total_amount: number;
  carrier_name: string;
  tracking_number: string;
  shipping_status: string;
  // estimated_delivery_date: string;
}
