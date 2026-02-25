"use client";

import React, { useState, useEffect } from 'react';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  CreditCard, ShoppingCart, Users, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Eye, Filter, Download,
  TrendingUp, Calendar, Trophy, Medal, Package, Minus, Banknote, Wallet, FileText, Check, Clock
} from 'lucide-react';
import { DashboardPeriod, OrderStatus } from '../../types/index';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../../components/ui/Skeleton';
import ToastComponent, { ToastType } from '../../components/ui/Toast';

// --- COMPONENTS ---

// 1. Stats Card Component
const StatCard = ({ title, value, change, icon: Icon, colorClass, bgClass, isPositive }: any) => (
  <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-2">
      <div className={`p-3 rounded-2xl ${bgClass} ${colorClass} shrink-0`}>
        <Icon size={22} />
      </div>
      <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg shrink-0 ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        {isPositive ? '+' : ''}{change}% 
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      </div>
    </div>
    <div className="min-w-0">
      <h3 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight truncate" title={String(value)}>{value}</h3>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1 truncate" title={title}>{title}</p>
    </div>
  </div>
);

// 2. Date Filter Component
const PeriodFilter = ({ active, onChange }: { active: DashboardPeriod, onChange: (p: DashboardPeriod) => void }) => (
  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
    {[
      { id: 'today', label: 'Hôm nay' },
      { id: 'week', label: '7 ngày qua' },
      { id: 'month', label: 'Tháng này' }
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id as DashboardPeriod)}
        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border-0 ${active === item.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        {item.label}
      </button>
    ))}
  </div>
);

// 3. Status Badge Component
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const config: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-700 border-green-200',
    SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    PROCESSING: 'bg-orange-100 text-orange-700 border-orange-200',
    CANCELED: 'bg-red-100 text-red-700 border-red-200',
  };
  const style = config[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${style}`}>
      {status}
    </span>
  );
};

// 4. Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const current = payload[0].value;
    const prev = payload[1]?.value || 0;
    const growth = prev > 0 ? ((current - prev) / prev) * 100 : 0;
    const isGrowthPositive = growth >= 0;

    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{label}</p>
        
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <span className="text-sm font-bold text-slate-600">Hiện tại:</span>
          <span className="text-sm font-black text-slate-800">{current.toLocaleString()}₫</span>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
          <span className="text-sm font-bold text-slate-600">Kỳ trước:</span>
          <span className="text-sm font-black text-slate-500">{prev.toLocaleString()}₫</span>
        </div>

        <div className={`pt-2 border-t border-slate-100 flex items-center gap-1 text-xs font-bold ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isGrowthPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          <span>{Math.abs(growth).toFixed(1)}% so với kỳ trước</span>
        </div>
      </div>
    );
  }
  return null;
};

// --- HELPER FOR TOP PRODUCTS RANKING ---
const RankBadge = ({ index }: { index: number }) => {
  if (index === 0) {
    return (
      <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 w-6 h-6 flex items-center justify-center rounded-br-xl shadow-sm z-10">
        <Trophy size={14} fill="currentColor" />
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="absolute top-0 left-0 bg-slate-300 text-slate-800 w-6 h-6 flex items-center justify-center rounded-br-xl shadow-sm z-10">
        <Medal size={14} fill="currentColor" />
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="absolute top-0 left-0 bg-orange-300 text-orange-900 w-6 h-6 flex items-center justify-center rounded-br-xl shadow-sm z-10">
        <Medal size={14} fill="currentColor" />
      </div>
    );
  }
  return (
    <div className="absolute top-0 left-0 bg-slate-800 text-white w-6 h-6 flex items-center justify-center rounded-br-xl font-bold text-[10px] z-10">
      {index + 1}
    </div>
  );
};

// --- HELPER FOR PAYMENT METHOD ICONS ---
const PaymentMethodIcon = ({ method }: { method: string }) => {
  const m = method.toLowerCase();
  if (m.includes('credit') || m.includes('card') || m.includes('visa')) return <CreditCard size={14} className="text-purple-600" />;
  if (m.includes('cod') || m.includes('cash')) return <Banknote size={14} className="text-green-600" />;
  if (m.includes('wallet') || m.includes('momo') || m.includes('zalo')) return <Wallet size={14} className="text-blue-600" />;
  if (m.includes('transfer') || m.includes('bank')) return <ArrowUpRight size={14} className="text-orange-600" />;
  return <Banknote size={14} className="text-slate-500" />;
};

// --- CLIENT-SIDE ONLY TIME AGO COMPONENT ---
const TimeAgo = ({ dateStr }: { dateStr: string }) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (mins < 1) setTimeAgo('Vừa xong');
      else if (mins < 60) setTimeAgo(`${mins} phút trước`);
      else if (hours < 24) setTimeAgo(`${hours} giờ trước`);
      else setTimeAgo(`${days} ngày trước`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [dateStr]);

  return <>{timeAgo || 'Đang tải...'}</>;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { period, setPeriod, stats, chartData, topProducts, recentOrders, isLoading, lastUpdated } = useAdminDashboard();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Helper to get total revenue shown in chart for summary
  const chartTotalRevenue = chartData.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
  const chartTotalPrevRevenue = chartData.reduce((sum: number, item: any) => sum + (item.prevRevenue || 0), 0);
  const chartTrend = chartTotalPrevRevenue > 0 ? ((chartTotalRevenue - chartTotalPrevRevenue) / chartTotalPrevRevenue) * 100 : 0;

  const handleQuickApprove = (e: React.MouseEvent, orderCode: string) => {
    e.stopPropagation();
    setToast({ message: `Đơn hàng ${orderCode} đã được duyệt nhanh!`, type: 'success' });
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex justify-between">
           <Skeleton className="h-10 w-48" />
           <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[24px]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Skeleton className="h-80 col-span-2 rounded-[24px]" />
           <Skeleton className="h-80 col-span-1 rounded-[24px]" />
        </div>
        <Skeleton className="h-64 w-full rounded-[24px]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-8 pb-20">
      {toast && <ToastComponent toast={{ ...toast, id: 'toast-1' }} onClose={() => setToast(null)} />}
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             📊 Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Cập nhật lúc: {lastUpdated.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}, {lastUpdated.toLocaleDateString('vi-VN')}
          </p>
        </div>
        <PeriodFilter active={period} onChange={setPeriod} />
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng doanh thu" 
          value={`${stats?.revenue.toLocaleString()}₫`} 
          change={stats?.changes?.revenue} 
          isPositive={(stats?.changes?.revenue ?? 0) >= 0}
          icon={CreditCard} 
          colorClass="text-blue-600" 
          bgClass="bg-blue-50"
        />
        <StatCard 
          title="Tổng đơn hàng" 
          value={stats?.orders.toLocaleString()} 
          change={stats?.changes?.orders} 
          isPositive={(stats?.changes?.orders ?? 0) >= 0}
          icon={ShoppingCart} 
          colorClass="text-amber-600" 
          bgClass="bg-amber-50"
        />
        <StatCard 
          title="Khách hàng mới" 
          value={stats?.newCustomers.toLocaleString()} 
          change={stats?.changes?.newCustomers} 
          isPositive={(stats?.changes?.newCustomers ?? 0) >= 0}
          icon={Users} 
          colorClass="text-cyan-600" 
          bgClass="bg-cyan-50"
        />
        <StatCard 
          title="Sản phẩm hoạt động" 
          value={stats?.activeProducts.toLocaleString()} 
          change={stats?.changes?.activeProducts} 
          isPositive={(stats?.changes?.activeProducts ?? 0) >= 0}
          icon={CheckCircle2} 
          colorClass="text-emerald-600" 
          bgClass="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 3. Enhanced Revenue Chart (Col 8) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col min-h-[450px]">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                 <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800">📈 Phân tích doanh thu</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${chartTrend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                       {chartTrend >= 0 ? '+' : ''}{chartTrend.toFixed(1)}%
                    </span>
                 </div>
                 <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-800">{chartTotalRevenue.toLocaleString()}₫</span>
                    <span className="text-xs font-bold text-slate-400 uppercase">trong kỳ này</span>
                 </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Hiện tại</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    <span>Kỳ trước</span>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                       dy={10} 
                    />
                    <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#94a3b8', fontSize: 11}} 
                       tickFormatter={(val) => `${(val/1000000).toFixed(0)}M`} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Previous Period Area (Behind) */}
                    <Area 
                       type="monotone" 
                       dataKey="prevRevenue" 
                       stroke="#cbd5e1" 
                       strokeWidth={2} 
                       fillOpacity={1} 
                       fill="url(#colorPrev)" 
                       activeDot={false}
                       strokeDasharray="5 5"
                    />

                    {/* Current Period Area (Front) */}
                    <Area 
                       type="monotone" 
                       dataKey="revenue" 
                       stroke="#3b82f6" 
                       strokeWidth={3} 
                       fillOpacity={1} 
                       fill="url(#colorRevenue)" 
                       activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff', fill: '#3b82f6' }}
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* 4. Enhanced Top Products (Col 4) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col h-full">
           <div className="flex items-center justify-between mb-6">
              <div>
                 <h3 className="text-lg font-bold text-slate-800">🏆 Top Sản phẩm</h3>
                 <p className="text-xs text-slate-500 font-medium">Xếp hạng theo số lượng bán</p>
              </div>
              <button onClick={() => router.push('/admin/products')} className="text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                 Xem tất cả
              </button>
           </div>
           
           <div className="space-y-4 flex-1">
              {topProducts.map((product, idx) => (
                 <div key={product.id} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all border border-transparent hover:border-slate-100 hover:shadow-sm">
                    {/* Rank & Image */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                       <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                       <RankBadge index={idx} />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-1.5 rounded truncate max-w-[80px]">{product.category}</span>
                          {product.stock < 10 && (
                             <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 rounded flex items-center gap-0.5">
                                <Package size={8} /> Only {product.stock}
                             </span>
                          )}
                       </div>
                       <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors" title={product.name}>
                          {product.name}
                       </p>
                       <p className="text-xs text-slate-500 font-medium">{product.price.toLocaleString()}₫</p>
                    </div>
                    
                    {/* Metrics */}
                    <div className="text-right shrink-0 flex flex-col items-end">
                       <p className="text-sm font-black text-slate-800">{product.sold}</p>
                       <div className="flex items-center gap-1 text-[10px]">
                          <span className="text-slate-400 font-bold uppercase">Sold</span>
                          {product.growth !== 0 && (
                             <span className={`font-bold ${product.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {product.growth > 0 ? '↑' : '↓'} {Math.abs(product.growth)}%
                             </span>
                          )}
                       </div>
                    </div>
                 </div>
              ))}
           </div>
           
           <button 
              className="w-full mt-4 py-3 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-all border-0 flex items-center justify-center gap-2"
              onClick={() => router.push('/admin/products')}
           >
              <TrendingUp size={14} /> Xem báo cáo chi tiết
           </button>
        </div>
      </div>

      {/* 5. Enhanced Recent Orders Table */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  📦 Đơn hàng gần đây
               </h3>
               <p className="text-xs text-slate-500 font-medium">Theo dõi các đơn hàng vừa phát sinh trên hệ thống.</p>
            </div>
            
            <div className="flex gap-2">
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
                  <Filter size={14} /> Lọc trạng thái
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all border-0">
                  <Download size={14} /> Xuất báo cáo
               </button>
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Mã đơn / Sản phẩm</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tổng thanh toán</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thời gian</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Hành động</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order) => {
                     const isPending = order.status === 'PENDING';
                     return (
                     <tr 
                        key={order.id} 
                        className={`transition-colors group cursor-pointer ${isPending ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-blue-50/20'}`} 
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                     >
                        
                        {/* Order Info */}
                        <td className="px-6 py-4 pl-8">
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-slate-700">{order.orderCode}</span>
                                {order.priority === 'HIGH' && (
                                   <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="High Priority"></span>
                                )}
                                {isPending && (
                                   <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 animate-pulse">NEW</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                 <Package size={10} /> 
                                 <span>{order.itemsCount} sản phẩm</span>
                              </div>
                           </div>
                        </td>

                        {/* Customer Info */}
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-2 border-white shadow-sm ${['A','C','E','G'].includes(order.customerName.charAt(0)) ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                 {order.customerName.charAt(0)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                 <span className="text-sm font-bold text-slate-800 truncate">{order.customerName}</span>
                                 <span className="text-[10px] text-slate-400 truncate">{order.customerEmail}</span>
                              </div>
                           </div>
                        </td>

                        {/* Payment Info */}
                        <td className="px-6 py-4 text-right">
                           <div className="flex flex-col items-end gap-1">
                              <span className="text-sm font-black text-slate-900">{order.totalAmount.toLocaleString()}₫</span>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white border border-slate-100 px-1.5 py-0.5 rounded shadow-sm">
                                 <PaymentMethodIcon method={order.paymentMethod} />
                                 {order.paymentMethod}
                              </div>
                           </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                           <StatusBadge status={order.status} />
                        </td>

                        {/* Time */}
                        <td className="px-6 py-4 text-right">
                           <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                                 <TimeAgo dateStr={order.createdAt} />
                                 {isPending && <Clock size={10} className="text-amber-500" />}
                              </div>
                              <span className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                           </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right pr-8" onClick={(e) => e.stopPropagation()}>
                           <div className="flex items-center justify-end gap-1">
                              {isPending ? (
                                <button 
                                   onClick={(e) => handleQuickApprove(e, order.orderCode)}
                                   className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md shadow-green-500/20 text-[10px] font-bold border-0"
                                   title="Duyệt nhanh"
                                >
                                   <Check size={12} /> Duyệt
                                </button>
                              ) : (
                                <button 
                                   className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                   title="In hóa đơn"
                                >
                                   <FileText size={16} />
                                </button>
                              )}
                              
                              <button 
                                 className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                 title="Xem chi tiết"
                                 onClick={() => router.push(`/admin/orders/${order.id}`)}
                              >
                                 <Eye size={16} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  )})}
               </tbody>
            </table>
         </div>
         
         <div className="p-4 border-t border-slate-100 text-center bg-slate-50/50">
            <button onClick={() => router.push('/admin/orders')} className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-1 mx-auto">
               Xem tất cả đơn hàng <ArrowUpRight size={12} />
            </button>
         </div>
      </div>
    </div>
  );
}
