
import { mockGet } from '../lib/http';
import { DashboardStats, Order, RevenueChartData, TopProduct, DashboardPeriod } from '@/types/index';

// Helper to simulate data changing based on period
const getMultiplier = (period: DashboardPeriod) => {
  switch (period) {
    case 'today': return 1;
    case 'week': return 7;
    case 'month': return 30;
    default: return 1;
  }
};

export const getDashboardStats = async (period: DashboardPeriod = 'today'): Promise<DashboardStats> => {
  const m = getMultiplier(period);
  
  // Simulated data math
  const revenueBase = 15000000;
  const ordersBase = 120;
  const customersBase = 35;
  
  return await mockGet(`/admin/dashboard/stats?period=${period}`, {
    revenue: revenueBase * m * (0.8 + Math.random() * 0.4), // Random variation
    orders: Math.floor(ordersBase * m * (0.9 + Math.random() * 0.2)),
    newCustomers: Math.floor(customersBase * m * (0.7 + Math.random() * 0.5)),
    activeProducts: 420, // Static for now
    changes: {
      revenue: period === 'today' ? 12 : period === 'week' ? 8 : 15,
      orders: period === 'today' ? 5 : period === 'week' ? -2 : 10,
      newCustomers: period === 'today' ? 8 : period === 'week' ? 12 : 20,
      activeProducts: -2,
    },
    lastUpdated: new Date().toISOString(),
  });
};

export const getRevenueChartData = async (period: DashboardPeriod = 'today'): Promise<RevenueChartData[]> => {
  const data: RevenueChartData[] = [];
  const days = period === 'today' ? 12 : period === 'week' ? 7 : 30; // hours vs days
  
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    let revenue = 0;
    let prevRevenue = 0;

    if (period === 'today') {
      // Hourly data for 'today'
      date.setHours(now.getHours() - (days - 1 - i));
      const hour = date.getHours();
      // Peak hours simulation (10am-2pm, 7pm-9pm)
      const isPeak = (hour >= 10 && hour <= 14) || (hour >= 19 && hour <= 21);
      const base = isPeak ? 2500000 : 800000;
      
      revenue = Math.floor(Math.random() * base) + 500000;
      prevRevenue = Math.floor(Math.random() * base * 0.85) + 400000; // prev is slightly lower

      data.push({
        date: `${date.getHours()}:00`,
        revenue: revenue,
        prevRevenue: prevRevenue,
      });
    } else {
      // Daily data for week/month
      date.setDate(now.getDate() - (days - 1 - i));
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const base = isWeekend ? 25000000 : 15000000;

      revenue = Math.floor(Math.random() * base) + 5000000;
      prevRevenue = Math.floor(Math.random() * base * 0.9) + 4000000;

      data.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        revenue: revenue,
        prevRevenue: prevRevenue,
      });
    }
  }
  
  return await mockGet(`/admin/dashboard/revenue-chart?period=${period}`, data);
};

export const getTopProducts = async (period: DashboardPeriod = 'today'): Promise<TopProduct[]> => {
  const m = getMultiplier(period);
  return await mockGet(`/admin/dashboard/top-products?period=${period}`, [
    {
      id: 'p1',
      name: 'Tai nghe Wireless Pro Noise Cancelling',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80',
      sold: Math.floor(1204 * (m / 30)),
      price: 850000,
      growth: 15.2,
      stock: 45,
      totalRevenue: Math.floor(1204 * (m / 30) * 850000)
    },
    {
      id: 'p2',
      name: 'Đồng hồ thông minh Series 8 GPS',
      category: 'Watches',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100&q=80',
      sold: Math.floor(890 * (m / 30)),
      price: 1200000,
      growth: 8.5,
      stock: 120,
      totalRevenue: Math.floor(890 * (m / 30) * 1200000)
    },
    {
      id: 'p3',
      name: 'Giày chạy bộ Ultra Boost DNA',
      category: 'Fashion',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80',
      sold: Math.floor(650 * (m / 30)),
      price: 2500000,
      growth: -2.4,
      stock: 200,
      totalRevenue: Math.floor(650 * (m / 30) * 2500000)
    },
    {
      id: 'p4',
      name: 'Balo laptop chống nước cao cấp',
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&q=80',
      sold: Math.floor(430 * (m / 30)),
      price: 450000,
      growth: 5.1,
      stock: 12,
      totalRevenue: Math.floor(430 * (m / 30) * 450000)
    },
    {
      id: 'p5',
      name: 'Loa Bluetooth Mini Bass Boost',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&q=80',
      sold: Math.floor(320 * (m / 30)),
      price: 320000,
      growth: 12.0,
      stock: 8,
      totalRevenue: Math.floor(320 * (m / 30) * 320000)
    }
  ]);
};

// Reusing existing logic but keeping it consistent with the new types if needed
export const getRecentOrders = async (): Promise<Order[]> => {
  return await mockGet('/admin/recent-orders', [
    { 
      id: 'ORD-00125', 
      orderCode: 'ORD-00125', 
      customerName: 'Hoàng Minh Khôi', 
      customerEmail: 'khoi@example.com',
      customerPhone: '0909000111',
      shippingAddress: 'TP.HCM',
      totalAmount: 3200000, 
      subtotalAmount: 3200000,
      discountAmount: 0,
      shippingAmount: 0,
      taxAmount: 0,
      itemsCount: 4,
      paymentStatus: 'PAID',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-005',
      deliveryNumber: 'DEL-005',
      status: 'PENDING', 
      priority: 'HIGH',
      createdAt: new Date().toISOString(), // Just now
      updatedAt: new Date().toISOString()
    },
    { 
      id: 'ORD-00124', 
      orderCode: 'ORD-00124', 
      customerName: 'Lê Thu Thảo', 
      customerEmail: 'thao@example.com',
      customerPhone: '0909000222',
      shippingAddress: 'Hà Nội',
      totalAmount: 150000, 
      subtotalAmount: 120000,
      discountAmount: 0,
      shippingAmount: 30000,
      taxAmount: 0,
      itemsCount: 1,
      paymentStatus: 'UNPAID',
      paymentMethod: 'COD',
      transactionId: '',
      deliveryNumber: 'DEL-006',
      status: 'CONFIRMED', 
      priority: 'NORMAL',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
      updatedAt: new Date().toISOString()
    },
    { 
      id: 'ORD-00123', 
      orderCode: 'ORD-00123', 
      customerName: 'Trần Văn B', 
      customerEmail: 'b@example.com',
      customerPhone: '0909000111',
      shippingAddress: 'TP.HCM',
      totalAmount: 2500000, 
      subtotalAmount: 2500000,
      discountAmount: 0,
      shippingAmount: 0,
      taxAmount: 0,
      itemsCount: 2,
      paymentStatus: 'PAID',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-001',
      deliveryNumber: 'DEL-001',
      status: 'PROCESSING', 
      priority: 'NORMAL',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      updatedAt: new Date().toISOString()
    },
    { 
      id: 'ORD-00122', 
      orderCode: 'ORD-00122', 
      customerName: 'Lê Thị C', 
      customerEmail: 'c@example.com',
      customerPhone: '0909000222',
      shippingAddress: 'Hà Nội',
      totalAmount: 850000, 
      subtotalAmount: 800000,
      discountAmount: 0,
      shippingAmount: 50000,
      taxAmount: 0,
      itemsCount: 1,
      paymentStatus: 'UNPAID',
      paymentMethod: 'COD',
      transactionId: '',
      deliveryNumber: 'DEL-002',
      status: 'SHIPPED', 
      priority: 'NORMAL',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
      updatedAt: new Date().toISOString()
    },
    { 
      id: 'ORD-00121', 
      orderCode: 'ORD-00121', 
      customerName: 'Phạm Văn D', 
      customerEmail: 'd@example.com',
      customerPhone: '0909000333',
      shippingAddress: 'Đà Nẵng',
      totalAmount: 1200000, 
      subtotalAmount: 1200000,
      discountAmount: 0,
      shippingAmount: 0,
      taxAmount: 0,
      itemsCount: 3,
      paymentStatus: 'PAID',
      paymentMethod: 'E-Wallet',
      transactionId: 'TXN-003',
      deliveryNumber: '',
      status: 'COMPLETED', 
      priority: 'HIGH',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
  ]);
};
