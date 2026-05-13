export interface IProductVariant {
  id: number;
  product_id: number;
  variant_name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  weight?: number;
  height?: number;
  length?: number;
  width?: number;
  image_url: string;
}
