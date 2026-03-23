export interface IOrderItem {
  id: number;
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  price: number;
  image_url?: string;
  // totalPrice: number;
}
