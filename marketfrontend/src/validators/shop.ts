export interface Shop {
  id: number;
  user_id: number;
  shop_name: string;
  shop_description: string;
  shop_logo: string;
  shop_banner: string;
  business_license: string;
  tax_code: string;
  rating: number;
  total_products: number;
  total_orders: number;
  response_rate: number;
  response_time: number;
  is_verified: number;
  is_active: number;
}
