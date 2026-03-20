export interface ProductVariant {
  id: number;
  product_id: number;
  variant_name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  image_url: string;
}
