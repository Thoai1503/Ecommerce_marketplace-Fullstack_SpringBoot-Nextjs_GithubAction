import { IOrderItem } from "./orderItem";

export interface IOrder {
  id: number;
  user_id: number;
  recipient?: Recipient;
  order_number: string;
  address_id: number;
  shop_id: number;
  shipping_fee: number;
  discount_amount: number;
  payment_method: string;
  total_price: number;
  final_amount: number;
  order_status?: string;
  status_change_reason?: string;

  created_at?: Date;
  updated_at?: Date;
  orders_items: IOrderItem[];
  note?: string;
  tracking_number?: string;
}

export interface Recipient {
  name: string;
  phone: string;
  address: string;
  province: number;
  district: number;
  ward: number;
}
