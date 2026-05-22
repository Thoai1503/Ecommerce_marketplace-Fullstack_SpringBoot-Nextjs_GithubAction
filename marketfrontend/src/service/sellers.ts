
import axios from 'axios';
import { Seller, SellerStatus } from '@/types/index';
import { API_URL } from '@/helper/api';

export interface SellerOrderShipment {
  shipmentId: string;
  orderId: string;
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  itemCount: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  shippingStatus: string;
  carrierName: string;
  trackingNumber: string;
}

/**
 * Map shop data from backend to Seller interface
 */
const mapShopToSeller = (shop: any): Seller => {
  return {
    id: String(shop.id || shop.shop_id || ''),
    accountCode: `SE-${String(shop.id || 0).padStart(4, '0')}`,
    brandTitle: shop.shop_name || '',
    category: shop.category || 'General',
    website: shop.website || '',
    location: shop.location || '',
    email: shop.email || '',
    phone: shop.phone || '',
    logoUrl: shop.shop_logo || `https://ui-avatars.com/api/?name=${(shop.shop_name || 'Shop').charAt(0)}&background=0078FF&color=fff`,
    status: (shop.is_active ? 'ACTIVE' : 'BLOCKED') as SellerStatus,
    createdAt: shop.created_at || new Date().toISOString(),
    ownerName: shop.owner_name || '',
    idCardFront: shop.id_card_front || '',
    idCardBack: shop.id_card_back || '',
    userId: String(shop.user_id || shop.userId || ''),
    totalProducts: shop.total_products || 0,
    totalOrders: shop.total_orders || 0,
    totalRevenue: shop.total_revenue || 0,
    rating: shop.rating || 0,
    reviewCount: shop.review_count || 0
  };
};

const getShipmentRows = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const toText = (value: unknown, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const toNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const mapShipmentToSellerOrder = (shipment: any): SellerOrderShipment => {
  const order = shipment?.order ?? {};
  const recipient = shipment?.recipient ?? {};
  const orderId = toText(shipment?.orderId ?? shipment?.order_id);
  const items = Array.isArray(shipment?.items) ? shipment.items : [];

  return {
    shipmentId: toText(shipment?.shipmentId ?? shipment?.shipment_id ?? shipment?.id),
    orderId,
    orderNumber: toText(order?.orderNumber ?? order?.order_number, orderId ? `#${orderId}` : '-'),
    recipientName: toText(recipient?.recipientName ?? recipient?.recipient_name, 'Khách mua'),
    recipientPhone: toText(recipient?.recipientPhone ?? recipient?.recipient_phone, '-'),
    itemCount: items.reduce((total: number, item: any) => total + toNumber(item?.quantity, 0), 0),
    totalAmount: toNumber(shipment?.totalAmount ?? shipment?.total_amount),
    paymentStatus: toText(order?.paymentStatus ?? order?.payment_status, 'UNKNOWN'),
    orderStatus: toText(order?.orderStatus ?? order?.order_status, 'UNKNOWN'),
    shippingStatus: toText(shipment?.shippingStatus ?? shipment?.shipping_status, 'UNKNOWN'),
    carrierName: toText(shipment?.carrierName ?? shipment?.carrier_name, '-'),
    trackingNumber: toText(shipment?.trackingNumber ?? shipment?.tracking_number, '-'),
  };
};

export const getSellers = async (): Promise<Seller[]> => {
  try {
    const response = await axios.get(`${API_URL}/shops`);
    const shops = Array.isArray(response.data) ? response.data : response.data.data || [];
    return shops.map(mapShopToSeller);
  } catch (error) {
    console.error('Failed to fetch sellers:', error);
    throw error;
  }
};

export const getSellerById = async (id: string): Promise<Seller | undefined> => {
  try {
    const response = await axios.get(`${API_URL}/shops/${id}`);
    const shop = response.data;
    return mapShopToSeller(shop);
  } catch (error) {
    console.error(`Failed to fetch seller ${id}:`, error);
    throw error;
  }
};

export const getSellerOrderShipments = async (id: string): Promise<SellerOrderShipment[]> => {
  const response = await axios.get(`${API_URL}/api/orders/shipments/shop/${id}`, {
    params: {
      page: 1,
      size: 100,
      sortOrder: 'desc',
    },
  });

  return getShipmentRows(response.data).map(mapShipmentToSellerOrder);
};

export const createSeller = async (data: Omit<Seller, 'id' | 'accountCode' | 'createdAt' | 'totalProducts' | 'totalOrders' | 'totalRevenue' | 'rating' | 'reviewCount'>): Promise<Seller> => {
  try {
    const payload = {
      shop_name: data.brandTitle,
      category: data.category,
      website: data.website,
      location: data.location,
      email: data.email,
      phone: data.phone,
      shop_logo: data.logoUrl,
      owner_name: data.ownerName,
      id_card_front: (data as any).idCardFront,
      id_card_back: (data as any).idCardBack,
      is_active: data.status === 'ACTIVE' ? 1 : 0,
    };
    const response = await axios.post(`${API_URL}/shops`, payload);
    const shop = response.data;
    return mapShopToSeller(shop);
  } catch (error) {
    console.error('Failed to create seller:', error);
    throw error;
  }
};

export const updateSeller = async (id: string, data: Partial<Seller>): Promise<Seller> => {
  try {
    const payload: any = {};
    if (data.brandTitle) payload.shop_name = data.brandTitle;
    if (data.category) payload.category = data.category;
    if (data.website) payload.website = data.website;
    if (data.location) payload.location = data.location;
    if (data.email) payload.email = data.email;
    if (data.phone) payload.phone = data.phone;
    if (data.logoUrl) payload.shop_logo = data.logoUrl;
    if (data.ownerName) payload.owner_name = data.ownerName;
    if ((data as any).idCardFront !== undefined) payload.id_card_front = (data as any).idCardFront;
    if ((data as any).idCardBack !== undefined) payload.id_card_back = (data as any).idCardBack;
    if (data.status) payload.is_active = data.status === 'ACTIVE' ? 1 : 0;

    const response = await axios.put(`${API_URL}/shops/${id}`, payload);
    const shop = response.data;
    return mapShopToSeller(shop);
  } catch (error) {
    console.error(`Failed to update seller ${id}:`, error);
    throw error;
  }
};

export const deleteSellers = async (ids: string[]): Promise<boolean> => {
  try {
    await Promise.all(ids.map(id => axios.delete(`${API_URL}/shops/${id}`)));
    return true;
  } catch (error) {
    console.error('Failed to delete sellers:', error);
    throw error;
  }
};

export const toggleSellerStatus = async (id: string, newStatus: SellerStatus): Promise<boolean> => {
  try {
    const is_active = newStatus === 'ACTIVE' ? 1 : 0;
    await axios.put(`${API_URL}/shops/${id}`, { is_active });
    return true;
  } catch (error) {
    console.error(`Failed to update seller status ${id}:`, error);
    throw error;
  }
};
