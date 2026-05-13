export interface IOrderItem {
  id: number;
  product_id: number;
  variant_id: number;
  product_name: string;
  shop?: any;

  shop_owner_id?: number; // Shop owner user ID
  shop_owner_info?: ShopOwnerInfo; // Shop owner info (name, email, phone)
  variant_name: string;
  quantity: number;
  price: number;
  image_url?: string;
  // totalPrice: number;
}

export interface ShopOwnerInfo {
  id: number;
  email?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
}

export interface Shop {
  id: number;
  shop_name: string;
  api_key: string;
  contact_email: string;
  phone: string;
}
