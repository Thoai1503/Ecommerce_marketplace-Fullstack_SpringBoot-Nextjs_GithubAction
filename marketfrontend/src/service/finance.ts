
import { mockGet } from '../lib/http';
import { FinanceStats, Transaction, SellerPayment } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock Data
const MOCK_STATS: FinanceStats = {
  totalRevenue: 2500000000, // 2.5B (Doanh thu hệ thống)
  thisMonthRevenue: 234800000, // 234.8M
  pendingPayoutsCount: 12, // Có 12 yêu cầu thanh toán chưa duyệt
  pendingPayoutsValue: 45000000, // 45M đang chờ chi
  revenueTrend: 15.3,
  monthTrend: 12.5,
  payoutsTrend: 5.2, // Tăng nhẹ so với tháng trước
};

const BASE_TRANSACTIONS: Transaction[] = [
  { id: 'tx1', orderId: 'ord1', orderCode: '#TZ5625', customerName: 'Nguyễn Văn A', sellerName: 'ZARA International', amount: 850000, date: '2023-09-10T10:00:00Z', status: 'PAID', paymentMethod: 'Credit Card' },
  { id: 'tx2', orderId: 'ord2', orderCode: '#TZ5624', customerName: 'Trần Thị B', sellerName: 'Samsung Official', amount: 12000000, date: '2023-09-09T14:30:00Z', status: 'PENDING', paymentMethod: 'Bank Transfer' },
  { id: 'tx3', orderId: 'ord3', orderCode: '#TZ5623', customerName: 'Lê Văn C', sellerName: 'Rolex Watch', amount: 650000, date: '2023-09-08T09:15:00Z', status: 'PAID', paymentMethod: 'E-Wallet' },
  { id: 'tx4', orderId: 'ord4', orderCode: '#TZ5622', customerName: 'Phạm Minh D', sellerName: 'Anker Vietnam', amount: 450000, date: '2023-09-08T08:00:00Z', status: 'CANCELLED', paymentMethod: 'COD' },
  { id: 'tx5', orderId: 'ord5', orderCode: '#TZ5621', customerName: 'Hoàng Thị E', sellerName: 'ZARA International', amount: 1850000, date: '2023-09-07T11:20:00Z', status: 'PAID', paymentMethod: 'Credit Card' },
  { id: 'tx6', orderId: 'ord6', orderCode: '#TZ5620', customerName: 'Vũ Văn F', sellerName: 'Samsung Official', amount: 2500000, date: '2023-09-06T16:45:00Z', status: 'PAID', paymentMethod: 'Bank Transfer' },
  { id: 'tx7', orderId: 'ord7', orderCode: '#TZ5619', customerName: 'Ngô Thị G', sellerName: 'Rolex Watch', amount: 8900000, date: '2023-09-05T13:10:00Z', status: 'PAID', paymentMethod: 'Credit Card' },
  { id: 'tx8', orderId: 'ord8', orderCode: '#TZ5618', customerName: 'Đặng Văn H', sellerName: 'Anker Vietnam', amount: 320000, date: '2023-09-04T10:05:00Z', status: 'PENDING', paymentMethod: 'COD' },
  { id: 'tx9', orderId: 'ord9', orderCode: '#TZ5617', customerName: 'Bùi Thị I', sellerName: 'ZARA International', amount: 1200000, date: '2023-09-03T09:30:00Z', status: 'PAID', paymentMethod: 'E-Wallet' },
  { id: 'tx10', orderId: 'ord10', orderCode: '#TZ5616', customerName: 'Đỗ Văn K', sellerName: 'Samsung Official', amount: 5500000, date: '2023-09-02T15:00:00Z', status: 'PAID', paymentMethod: 'Bank Transfer' },
];

const BASE_PAYMENTS: SellerPayment[] = [
  { id: 'pay1', sellerId: 's1', sellerName: 'ZARA International', period: 'Sep 2023', revenue: 50500000, commission: 5050000, commissionRate: 10, amount: 45450000, status: 'PENDING', createdAt: '2023-10-01T08:00:00Z' },
  { id: 'pay2', sellerId: 's2', sellerName: 'Samsung Official', period: 'Sep 2023', revenue: 154000000, commission: 15400000, commissionRate: 10, amount: 138600000, status: 'PAID', paidAt: '2023-10-02T10:00:00Z', createdAt: '2023-10-01T08:00:00Z' },
  { id: 'pay3', sellerId: 's3', sellerName: 'Rolex Watch', period: 'Sep 2023', revenue: 25800000, commission: 2580000, commissionRate: 10, amount: 23220000, status: 'PAID', paidAt: '2023-10-02T11:30:00Z', createdAt: '2023-10-01T08:00:00Z' },
  { id: 'pay4', sellerId: 's4', sellerName: 'Anker Vietnam', period: 'Sep 2023', revenue: 12500000, commission: 1250000, commissionRate: 10, amount: 11250000, status: 'CANCELLED', createdAt: '2023-10-01T08:00:00Z' },
  { id: 'pay5', sellerId: 's1', sellerName: 'ZARA International', period: 'Aug 2023', revenue: 48200000, commission: 4820000, commissionRate: 10, amount: 43380000, status: 'PAID', paidAt: '2023-09-02T09:00:00Z', createdAt: '2023-09-01T08:00:00Z' },
];

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 150 }, (_, i) => {
  const base = BASE_TRANSACTIONS[i % BASE_TRANSACTIONS.length];
  return {
    ...base,
    id: `${base.id}_${i}`,
    orderCode: `${base.orderCode}-${i}`,
  };
});

const MOCK_PAYMENTS: SellerPayment[] = Array.from({ length: 80 }, (_, i) => {
  const base = BASE_PAYMENTS[i % BASE_PAYMENTS.length];
  return {
    ...base,
    id: `${base.id}_${i}`,
  };
});

export const getFinanceStats = async (): Promise<FinanceStats> => {
  return await mockGet('/admin/finance/stats', MOCK_STATS);
};

export const getRevenueChartData = async (period: string) => {
  await delay(600);
  // Mock data generator based on period
  const data = [];
  const points = period === '1Y' ? 12 : period === '6M' ? 6 : period === '1M' ? 30 : 7;
  const labels = period === '1Y' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] :
                 period === '6M' ? ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] :
                 period === '1M' ? Array.from({length: 30}, (_, i) => `${i+1}`) :
                 ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < points; i++) {
    data.push({
      name: labels[i] || `Day ${i+1}`,
      revenue: Math.floor(Math.random() * 50000000) + 10000000,
    });
  }
  return data;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  await delay(800);
  return MOCK_TRANSACTIONS;
};

export const getRecentTransactions = async (): Promise<Transaction[]> => {
  await delay(500);
  return MOCK_TRANSACTIONS.slice(0, 5);
};

export const getSellerPayments = async (): Promise<SellerPayment[]> => {
  await delay(800);
  return MOCK_PAYMENTS;
};

export const approveSellerPayment = async (id: string): Promise<boolean> => {
  await delay(1000);
  const payment = MOCK_PAYMENTS.find(p => p.id === id);
  if (payment) {
    payment.status = 'PAID';
    payment.paidAt = new Date().toISOString();
    return true;
  }
  return false;
};
