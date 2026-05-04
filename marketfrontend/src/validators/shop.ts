export interface Shop {
  id: number;
  user_id: number;
  shop_name: string;
  shop_description: string;
  shop_logo: string;
  shop_banner: string;
  rating: number;
  total_products: number;
  total_orders: number;
  response_rate: number;
  response_time: number;
  is_verified: number;
  is_active: number;
  owner_name?: string;
  business_license?: string;
  tax_code?: string;
  url_card_front?: string;
  url_card_back?: string;
}
