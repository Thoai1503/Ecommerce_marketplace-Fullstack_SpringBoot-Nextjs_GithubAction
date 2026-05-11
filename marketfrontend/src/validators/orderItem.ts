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
  shop_voucher_discount_amount?: number;
  platform_voucher_discount_amount?: number;
  total_voucher_discount_amount?: number;
  total_after_shop_voucher?: number;
  total_after_all_vouchers?: number;
  platform_commission_rate?: number;
  platform_commission_amount?: number;
  seller_receivable_amount?: number;
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
