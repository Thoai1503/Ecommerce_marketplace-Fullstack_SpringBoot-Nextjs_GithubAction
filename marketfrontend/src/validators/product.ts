export interface Product {
  id: number; // instead of int
  shop_id: number; // instead of long
  category_id: number;
  product_name: string;
  product_slug: string;
  image_url: string;
  description: string;
  price: number;
  original_price: number;
  stock_quantity: number;
  sold_count: number;
  rating: number;
  review_count: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  brand: number | null;
  is_active: number;
}
