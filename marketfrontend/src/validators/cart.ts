export interface ICart {
  user_id: number;
  product_id: number;
  variant_id: number;
  product?: any;
  quantity: number;
}
export interface Shop {
  id: number;
  userId: number;
  shopName: string;
}

export interface ProductVariant {
  id: number;
  variantName: string;
  sku: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
}

export interface Product {
  id: number;
  name: string;
  shop: Shop;
}

export interface CartItem {
  id: number;
  userId: number;
  product: Product;
  quantity: number;

  width?: number;
  length?: number;
  height?: number;
  weight?: number;
  addedAt: string;
  updatedAt: string;
  productVariant: ProductVariant | null;
}

export interface GroupedCartByShop {
  shop: Shop;
  items: CartItem[];
}
