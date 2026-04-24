
import { Coupon } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const BASE_COUPONS: Coupon[] = [
  {
    id: 'cp1',
    code: 'SUMMER24',
    name: 'Summer Sale 2024',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    usageLimit: 100,
    usedCount: 45,
    minOrderAmount: 0,
    status: 'ACTIVE',
    createdAt: '2024-05-20T10:00:00Z',
  },
  {
    id: 'cp2',
    code: 'FASHION50',
    name: 'Fashion Discount',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50000,
    startDate: '2024-07-15',
    endDate: '2024-08-15',
    usageLimit: 50,
    usedCount: 12,
    minOrderAmount: 200000,
    status: 'ACTIVE',
    createdAt: '2024-07-01T09:00:00Z',
  },
  {
    id: 'cp3',
    code: 'WELCOME10',
    name: 'Welcome New User',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    usageLimit: null, // Unlimited
    usedCount: 234,
    minOrderAmount: 0,
    status: 'ACTIVE',
    createdAt: '2023-12-25T08:00:00Z',
  },
  {
    id: 'cp4',
    code: 'OLD2023',
    name: 'Old Coupon 2023',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    usageLimit: 200,
    usedCount: 200,
    minOrderAmount: 0,
    status: 'EXPIRED',
    createdAt: '2022-12-20T10:00:00Z',
  },
  {
    id: 'cp5',
    code: 'VIP_ONLY',
    name: 'VIP Customer Special',
    discountType: 'FIXED_AMOUNT',
    discountValue: 100000,
    startDate: '2024-09-01',
    endDate: '2024-09-30',
    usageLimit: 20,
    usedCount: 0,
    minOrderAmount: 1000000,
    status: 'INACTIVE', // Manual inactive
    createdAt: '2024-08-01T10:00:00Z',
  }
];

const MOCK_COUPONS: Coupon[] = Array.from({ length: 60 }, (_, i) => {
  const base = BASE_COUPONS[i % BASE_COUPONS.length];
  return {
    ...base,
    id: `${base.id}_${i}`,
    code: `${base.code}_${i+1}`,
  };
});

// Helper to auto-update status based on date
const calculateStatus = (coupon: Coupon): Coupon => {
  const now = new Date();
  const endDate = new Date(coupon.endDate);
  
  if (coupon.status === 'INACTIVE') return coupon; // Keep manual inactive
  
  if (now > endDate) {
    return { ...coupon, status: 'EXPIRED' };
  }
  
  return { ...coupon, status: 'ACTIVE' };
};

export const getCoupons = async (): Promise<Coupon[]> => {
  await delay(600);
  return MOCK_COUPONS.map(calculateStatus);
};

export const getCouponById = async (id: string): Promise<Coupon | undefined> => {
  await delay(600);
  const coupon = MOCK_COUPONS.find(c => c.id === id);
  return coupon ? calculateStatus(coupon) : undefined;
};

export const createCoupon = async (data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Promise<Coupon> => {
  await delay(1000);
  const newCoupon: Coupon = {
    ...data,
    id: `cp${Date.now()}`,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };
  MOCK_COUPONS.unshift(newCoupon);
  return newCoupon;
};

export const updateCoupon = async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
  await delay(1000);
  const index = MOCK_COUPONS.findIndex(c => c.id === id);
  if (index !== -1) {
    MOCK_COUPONS[index] = { ...MOCK_COUPONS[index], ...data };
    return calculateStatus(MOCK_COUPONS[index]);
  }
  throw new Error('Coupon not found');
};

export const deleteCoupon = async (id: string): Promise<boolean> => {
  await delay(800);
  const index = MOCK_COUPONS.findIndex(c => c.id === id);
  if (index !== -1) {
    MOCK_COUPONS.splice(index, 1);
    return true;
  }
  return false;
};
