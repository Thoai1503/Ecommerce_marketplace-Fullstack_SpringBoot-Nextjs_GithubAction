<<<<<<< HEAD

import { mockGet } from '../lib/http';
import { Seller, SellerStatus } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const BASE_SELLERS: Seller[] = [
  {
    id: 's1',
    accountCode: 'SE-0001',
    brandTitle: 'ZARA International',
    category: 'Fashion',
    website: 'www.zara.com',
    location: '123 Đồng Khởi, Quận 1, TP.HCM',
    email: 'contact@zara.vn',
    phone: '0901234567',
    logoUrl: 'https://ui-avatars.com/api/?name=ZARA&background=000&color=fff&length=1',
    status: 'ACTIVE',
    createdAt: '2023-01-15T08:00:00Z',
    ownerName: 'Nguyễn Văn A',
    totalProducts: 865,
    totalOrders: 4500,
    totalRevenue: 2300000000,
    rating: 4.5,
    reviewCount: 3500
  },
  {
    id: 's2',
    accountCode: 'SE-0002',
    brandTitle: 'Samsung Official',
    category: 'Electronics',
    website: 'www.samsung.com/vn',
    location: 'Khu Công Nghệ Cao, TP. Thủ Đức',
    email: 'sales@samsung.vn',
    phone: '0909888777',
    logoUrl: 'https://ui-avatars.com/api/?name=Samsung&background=034EA2&color=fff&length=1',
    status: 'ACTIVE',
    createdAt: '2023-02-20T10:00:00Z',
    ownerName: 'Lee Byung',
    totalProducts: 420,
    totalOrders: 12000,
    totalRevenue: 15400000000,
    rating: 4.8,
    reviewCount: 8200
  },
  {
    id: 's3',
    accountCode: 'SE-0003',
    brandTitle: 'Rolex Watch',
    category: 'Watches',
    website: 'www.rolex.com',
    location: 'Tràng Tiền Plaza, Hà Nội',
    email: 'vn.rolex@autho.com',
    phone: '0911223344',
    logoUrl: 'https://ui-avatars.com/api/?name=Rolex&background=006039&color=fff&length=1',
    status: 'PENDING',
    createdAt: '2024-02-10T14:30:00Z',
    ownerName: 'Trần Thị B',
    totalProducts: 50,
    totalOrders: 120,
    totalRevenue: 5000000000,
    rating: 4.9,
    reviewCount: 85
  },
  {
    id: 's4',
    accountCode: 'SE-0004',
    brandTitle: 'Anker Vietnam',
    category: 'Accessories',
    website: 'www.anker.vn',
    location: 'Quận 3, TP.HCM',
    email: 'support@anker.vn',
    phone: '0988776655',
    logoUrl: 'https://ui-avatars.com/api/?name=Anker&background=00A3E0&color=fff&length=1',
    status: 'BLOCKED',
    createdAt: '2023-05-05T09:15:00Z',
    ownerName: 'Phạm Minh C',
    totalProducts: 200,
    totalOrders: 3500,
    totalRevenue: 800000000,
    rating: 4.2,
    reviewCount: 1500
  }
];

// Generate 80 mock sellers to test pagination
const MOCK_SELLERS: Seller[] = Array.from({ length: 80 }, (_, i) => {
  const base = BASE_SELLERS[i % BASE_SELLERS.length];
  return {
    ...base,
    id: `${base.id}_${i}`,
    accountCode: `SE-${String(1000 + i)}`,
    brandTitle: `${base.brandTitle} ${i + 1}`,
  };
});

export const getSellers = async (): Promise<Seller[]> => {
  return await mockGet('/admin/sellers', MOCK_SELLERS);
};

export const getSellerById = async (id: string): Promise<Seller | undefined> => {
  await delay(600);
  return MOCK_SELLERS.find(s => s.id === id);
};

export const createSeller = async (data: Omit<Seller, 'id' | 'accountCode' | 'createdAt' | 'totalProducts' | 'totalOrders' | 'totalRevenue' | 'rating' | 'reviewCount'>): Promise<Seller> => {
  await delay(1000);
  const newSeller: Seller = {
    ...data,
    id: `s${Date.now()}`,
    accountCode: `SE-${(MOCK_SELLERS.length + 1).toString().padStart(4, '0')}`,
    createdAt: new Date().toISOString(),
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    rating: 0,
    reviewCount: 0
  };
  MOCK_SELLERS.unshift(newSeller);
  return newSeller;
};

export const updateSeller = async (id: string, data: Partial<Seller>): Promise<Seller> => {
  await delay(1000);
  const index = MOCK_SELLERS.findIndex(s => s.id === id);
  if (index !== -1) {
    MOCK_SELLERS[index] = { ...MOCK_SELLERS[index], ...data };
    return MOCK_SELLERS[index];
  }
  throw new Error('Seller not found');
};

export const deleteSellers = async (ids: string[]): Promise<boolean> => {
  await delay(800);
  // Filter out deleted items in real app
  return true;
};

export const toggleSellerStatus = async (id: string, newStatus: SellerStatus): Promise<boolean> => {
  await delay(600);
  const index = MOCK_SELLERS.findIndex(s => s.id === id);
  if (index !== -1) {
    MOCK_SELLERS[index].status = newStatus;
  }
  return true;
};
=======

import axios from 'axios';
import { Seller, SellerStatus } from '@/types/index';
import { API_URL } from '@/helper/api';

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
>>>>>>> c9d4b1976cb5b3a10edc460d55b593d2cd8808dc
