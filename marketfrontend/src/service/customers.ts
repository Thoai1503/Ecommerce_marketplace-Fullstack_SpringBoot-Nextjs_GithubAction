    
import { mockGet } from '../lib/http';
import { Customer, CustomerStatus, Order } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const BASE_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    accountCode: 'AC-0001',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    totalOrders: 15,
    totalSpent: 25000000,
    lastOrderDate: '2024-03-10T14:30:00Z',
    status: 'ACTIVE',
    joinedAt: '2023-01-15T08:00:00Z',
    addresses: [
      { id: 'a1', fullAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM', city: 'TP.HCM', isDefault: true },
      { id: 'a2', fullAddress: '456 Lê Lợi, Vũng Tàu', city: 'Vũng Tàu', isDefault: false }
    ],
    note: 'Khách hàng VIP, thường mua đồ công nghệ cao cấp.'
  },
  {
    id: 'c2',
    accountCode: 'AC-0002',
    fullName: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0912345678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    totalOrders: 3,
    totalSpent: 1200000,
    lastOrderDate: '2024-02-28T09:15:00Z',
    status: 'INACTIVE',
    joinedAt: '2023-06-20T10:30:00Z',
    addresses: [
      { id: 'a3', fullAddress: '456 Lê Lợi, Quận Hải Châu, Đà Nẵng', city: 'Đà Nẵng', isDefault: true }
    ]
  },
  {
    id: 'c3',
    accountCode: 'AC-0003',
    fullName: 'Lê Văn C',
    email: 'levanc@example.com',
    phone: '0987654321',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    totalOrders: 0,
    totalSpent: 0,
    status: 'BANNED',
    joinedAt: '2024-01-05T14:20:00Z',
    addresses: [
      { id: 'a4', fullAddress: '789 Cầu Giấy, Hà Nội', city: 'Hà Nội', isDefault: true }
    ],
    note: 'Boom hàng 3 lần, đã chặn.'
  },
  {
    id: 'c4',
    accountCode: 'AC-0004',
    fullName: 'Phạm Minh D',
    email: 'phamminhd@example.com',
    phone: '0933445566',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dora',
    totalOrders: 42,
    totalSpent: 156000000,
    lastOrderDate: '2024-03-14T11:00:00Z',
    status: 'ACTIVE',
    joinedAt: '2022-11-11T09:00:00Z',
    addresses: [
      { id: 'a5', fullAddress: '101 Võ Văn Kiệt, Quận 1, TP.HCM', city: 'TP.HCM', isDefault: true }
    ]
  }
];

// Generate 100 mock customers to test pagination
const MOCK_CUSTOMERS: Customer[] = Array.from({ length: 100 }, (_, i) => {
  const base = BASE_CUSTOMERS[i % BASE_CUSTOMERS.length];
  return {
    ...base,
    id: `${base.id}_${i}`,
    accountCode: `AC-${String(1000 + i)}`,
    fullName: `${base.fullName} ${i + 1}`,
    totalSpent: Math.floor(Math.random() * 50000000),
  };
});

export const getCustomers = async (): Promise<Customer[]> => {
  return await mockGet('/admin/customers', MOCK_CUSTOMERS);
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  await delay(600);
  return MOCK_CUSTOMERS.find(c => c.id === id);
};

// Mock function to get orders for a specific customer
export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
  await delay(600);
  // Return some mock orders
  return [
    { 
      id: '1', orderCode: '#ORD-0001', customerName: 'Nguyễn Văn A', customerEmail: 'a@a.com', customerPhone: '1', shippingAddress: '', totalAmount: 850000, subtotalAmount: 0, discountAmount: 0, shippingAmount: 0, taxAmount: 0, itemsCount: 1, paymentStatus: 'PAID', paymentMethod: 'COD', transactionId: '', deliveryNumber: '', status: 'COMPLETED', priority: 'NORMAL', createdAt: '2023-09-10T00:00:00Z', updatedAt: '', items: [] 
    },
    { 
      id: '2', orderCode: '#ORD-0002', customerName: 'Nguyễn Văn A', customerEmail: 'a@a.com', customerPhone: '1', shippingAddress: '', totalAmount: 1200000, subtotalAmount: 0, discountAmount: 0, shippingAmount: 0, taxAmount: 0, itemsCount: 2, paymentStatus: 'PAID', paymentMethod: 'COD', transactionId: '', deliveryNumber: '', status: 'COMPLETED', priority: 'NORMAL', createdAt: '2023-09-15T00:00:00Z', updatedAt: '', items: [] 
    },
    { 
      id: '3', orderCode: '#ORD-0003', customerName: 'Nguyễn Văn A', customerEmail: 'a@a.com', customerPhone: '1', shippingAddress: '', totalAmount: 650000, subtotalAmount: 0, discountAmount: 0, shippingAmount: 0, taxAmount: 0, itemsCount: 1, paymentStatus: 'UNPAID', paymentMethod: 'COD', transactionId: '', deliveryNumber: '', status: 'PENDING', priority: 'NORMAL', createdAt: '2023-09-20T00:00:00Z', updatedAt: '', items: [] 
    }
  ];
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  await delay(800);
  const index = MOCK_CUSTOMERS.findIndex(c => c.id === id);
  if (index !== -1) {
    MOCK_CUSTOMERS[index] = { ...MOCK_CUSTOMERS[index], ...data };
    return MOCK_CUSTOMERS[index];
  }
  throw new Error('Customer not found');
};

export const deleteCustomers = async (ids: string[]): Promise<boolean> => {
  await delay(800);
  console.log('Deleted customers:', ids);
  return true;
};

export const toggleBlockStatus = async (id: string, isBlocked: boolean): Promise<boolean> => {
  await delay(600);
  const index = MOCK_CUSTOMERS.findIndex(c => c.id === id);
  if (index !== -1) {
    MOCK_CUSTOMERS[index].status = isBlocked ? 'BANNED' : 'ACTIVE';
  }
  return true;
};
