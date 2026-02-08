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
  variants?: Variant[];
  is_active: number;
}

interface Variant {
  id: string;
  name: string; // ví dụ: "Đen", "Xanh", "Size M",...
  image_url?: string;
  price: number;
  stock_quantity: number;
  sku: string;
  //model_id: string;
  // thêm các field khác nếu cần
}
