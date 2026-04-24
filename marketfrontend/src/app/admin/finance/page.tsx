
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceOverview } from '@/hooks/admin/useFinance';
import { 
  DollarSign, ShoppingBag, ArrowUpRight, ArrowDownRight, 
  CreditCard, ChevronRight, Wallet, AlertTriangle, Briefcase, Calendar,
  TrendingUp, Activity, PieChart, BrainCircuit, Sparkles, Target, Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';

// --- AI COMPONENT: FINANCIAL BRAIN ---
const AIFinancialBrain = ({ stats }: { stats: any }) => {
  const [isThinking, setIsThinking] = useState(true);
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    if (!stats) return;
    
    // Simulate AI Analysis
    const timer = setTimeout(() => {
      // Mock Forecasting Logic
      const growthRate = stats.monthTrend > 0 ? 1.15 : 1.05; // Base growth + optimism
      const nextMonthRevenue = stats.thisMonthRevenue * growthRate;
      const confidenceScore = 89; // 89% confidence
      
      let insight = '';
      if (stats.monthTrend > 10) {
        insight = "Xu hướng tăng trưởng mạnh. Dự báo tháng tới sẽ phá kỷ lục doanh thu nếu duy trì chiến dịch Marketing hiện tại.";
      } else if (stats.monthTrend < 0) {
        insight = "Đà tăng trưởng đang chậm lại. Đề xuất tung ra Voucher kích cầu vào giữa tháng để đạt mục tiêu.";
      } else {
        insight = "Doanh thu ổn định. Cần tối ưu chi phí vận hành để tăng biên lợi nhuận ròng.";
      }

      setForecast({
        nextMonthRevenue,
        confidenceScore,
        insight,
        growthRate: Math.round((growthRate - 1) * 100)
      });
      setIsThinking(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [stats]);

  return (
    <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden mb-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <BrainCircuit size={140} />
      </div>
      <div className="absolute bottom-0 left-0 p-10 opacity-10 bg-white rounded-full blur-3xl w-40 h-40"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-yellow-300 animate-pulse" size={20} />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-100">AI Revenue Forecast</h3>
        </div>

        {isThinking ? (
          <div className="flex flex-col gap-4 animate-pulse">
             <div className="h-8 bg-white/20 rounded-lg w-1/3"></div>
             <div className="h-4 bg-white/20 rounded-lg w-1/2"></div>
             <div className="h-16 bg-white/10 rounded-xl w-full mt-2"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
             {/* Forecast Stats */}
             <div className="flex-1">
                <p className="text-indigo-200 text-sm font-medium mb-1">Dự báo doanh thu tháng tới</p>
                <div className="flex items-end gap-3">
                   <h2 className="text-4xl font-black tracking-tight">{(forecast.nextMonthRevenue / 1000000).toFixed(1)}M₫</h2>
                   <span className="text-green-300 font-bold bg-green-500/20 px-2 py-1 rounded-lg text-sm mb-1.5 flex items-center gap-1">
                      <TrendingUp size={14} /> +{forecast.growthRate}%
                   </span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs font-medium text-indigo-200/80">
                   <Target size={14} /> Độ tin cậy của AI: <span className="text-white">{forecast.confidenceScore}%</span>
                </div>
             </div>

             {/* Insight Box */}
             <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex gap-4 items-start">
                <div className="p-2 bg-yellow-400/20 rounded-lg text-yellow-300 shrink-0">
                   <Zap size={20} fill="currentColor" />
                </div>
                <div>
                   <h4 className="font-bold text-white text-sm mb-1">AI Recommendation</h4>
                   <p className="text-xs text-indigo-100 leading-relaxed opacity-90">
                      {forecast.insight}
                   </p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Improved StatCard with clearer visual hierarchy & Soft Colors
const StatCard = ({ title, value, subtext, trend, isUp, icon, colorClass, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-all duration-300 relative overflow-hidden group ${onClick ? 'cursor-pointer active:scale-95 ring-2 ring-transparent hover:ring-blue-100' : ''}`}
  >
    <div className="flex justify-between items-start mb-3 relative z-10">
      <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10 text-current`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-[11px] font-black ${isUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-lg`}>
          {isUp ? '+' : ''}{trend}% {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        </div>
      )}
    </div>
    <div className="relative z-10">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
      <p className="text-[11px] font-bold text-slate-400 uppercase mt-1 tracking-wide">{title}</p>
      {subtext && <p className="text-[11px] text-slate-500 mt-2 font-medium bg-slate-50 inline-block px-2 py-1 rounded-md">{subtext}</p>}
    </div>
    
    {/* Decorative background circle */}
    <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 ${colorClass.replace('text-', 'bg-')} group-hover:scale-125 transition-transform duration-500 pointer-events-none`}></div>
  </div>
);

export default function FinanceOverview() {
  const router = useRouter();
  const [period, setPeriod] = useState('1M');
  const { stats, chartData, recentTransactions, isLoading } = useFinanceOverview(period);

  if (isLoading) return (
    <div className="p-8 space-y-8">
       <Skeleton className="h-24 w-full rounded-[24px]" />
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-48 w-full rounded-[24px]" />
          <Skeleton className="h-48 w-full rounded-[24px]" />
       </div>
       <Skeleton className="h-96 w-full rounded-[24px]" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-8 pb-24">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             💰 Tài chính
          </h1>
          <p className="text-sm text-slate-500 font-medium">Theo dõi dòng tiền và hiệu quả kinh doanh.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => router.push('/admin/finance/transactions')}
             className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
           >
             Lịch sử giao dịch
           </button>
           <button 
             onClick={() => router.push('/admin/finance/payments')}
             className="px-5 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/20 border-0"
           >
             Quản lý chi trả
           </button>
        </div>
      </div>

      {/* 2. AI FORECASTING SECTION */}
      <AIFinancialBrain stats={stats} />

      {/* 3. Critical Action Alert */}
      {stats && stats.pendingPayoutsCount && stats.pendingPayoutsCount > 0 ? (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-[24px] p-6 shadow-xl shadow-orange-500/20 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer" onClick={() => router.push('/admin/finance/payments')}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <Wallet size={120} />
          </div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner shrink-0">
              <AlertTriangle size={28} className="animate-pulse text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white">Cần xử lý gấp</span>
              </div>
              <h4 className="font-bold text-2xl mb-1">Có {stats.pendingPayoutsCount} yêu cầu thanh toán</h4>
              <p className="text-sm font-medium text-white/90">
                Tổng giá trị cần chi trả: <span className="font-black text-white text-lg">{stats.pendingPayoutsValue?.toLocaleString() ?? '0'}₫</span>
              </p>
            </div>
          </div>
          
          <div className="relative z-10">
             <button className="px-6 py-3 bg-white text-orange-600 text-sm font-bold rounded-xl hover:bg-orange-50 transition-all shadow-sm border-0 whitespace-nowrap flex items-center gap-2">
               Duyệt thanh toán ngay <ChevronRight size={16} />
             </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-[24px] p-4 flex items-center gap-3 text-green-800">
           <div className="p-2 bg-green-100 rounded-full"><Activity size={18} /></div>
           <p className="text-sm font-bold">Hệ thống đang hoạt động tốt. Không có khoản thanh toán nào cần xử lý.</p>
        </div>
      )}

      {/* 4. Grouped Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Group A: Hiệu quả kinh doanh (Period Metrics) */}
         <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
               <Calendar size={16} className="text-blue-500" />
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Tháng này (Current Period)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 h-full">
               <StatCard 
                  title="Doanh thu tháng" 
                  value={`${((stats?.thisMonthRevenue ?? 0) / 1000000).toFixed(1)}M₫`} 
                  trend={stats?.monthTrend} 
                  isUp={(stats?.monthTrend ?? 0) > 0} 
                  icon={<TrendingUp />} 
                  colorClass="text-blue-600"
                  subtext="Tổng giá trị đơn hàng"
               />
               <StatCard 
                  title="Lợi nhuận ước tính (10%)" 
                  value={`${((stats?.thisMonthRevenue ?? 0) * 0.1 / 1000000).toFixed(1)}M₫`} 
                  trend={stats?.monthTrend} 
                  isUp={(stats?.monthTrend ?? 0) > 0} 
                  icon={<PieChart />} 
                  colorClass="text-emerald-600"
                  subtext="Doanh thu sau chiết khấu"
               />
            </div>
         </div>

         {/* Group B: Tổng quan tài sản (Lifetime Metrics) */}
         <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
               <Briefcase size={16} className="text-purple-500" />
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Tổng quan (Lifetime)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 h-full">
               <StatCard 
                  title="Tổng doanh thu hệ thống" 
                  value={`${((stats?.totalRevenue ?? 0) / 1000000000).toFixed(2)}B₫`} 
                  trend={stats?.revenueTrend} 
                  isUp={(stats?.revenueTrend ?? 0) > 0} 
                  icon={<DollarSign />} 
                  colorClass="text-purple-600"
                  subtext="Tích lũy trọn đời"
               />
               <StatCard 
                  title="Dư nợ người bán" 
                  value={`${((stats?.pendingPayoutsValue ?? 0) / 1000000).toFixed(1)}M₫`}
                  trend={stats?.payoutsTrend} 
                  isUp={(stats?.payoutsTrend ?? 0) > 0} 
                  icon={<Wallet />} 
                  colorClass="text-orange-600"
                  subtext="Đang chờ thanh toán"
                  onClick={() => router.push('/admin/finance/payments')}
               />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Chart Section */}
         <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Activity size={18} /></div>
                  <h3 className="text-lg font-bold text-slate-800">Biểu đồ tăng trưởng</h3>
               </div>
               <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['1W', '1M', '6M', '1Y'].map(p => (
                     <button 
                        key={p} 
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border-0 ${period === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                        {p}
                     </button>
                  ))}
               </div>
            </div>
            <div className="flex-1 min-h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value/1000000}M`} />
                     <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                        itemStyle={{color: '#3b82f6'}}
                        formatter={(value: any) => [`${value.toLocaleString()}₫`, 'Doanh thu']}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Recent Transactions */}
         <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-slate-800">Giao dịch mới</h3>
               <button onClick={() => router.push('/admin/finance/transactions')} className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả</button>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
               {recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all cursor-pointer group">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${tx.status === 'PAID' ? 'bg-green-100 text-green-600' : tx.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                           <CreditCard size={18} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{tx.sellerName}</p>
                           <p className="text-[10px] font-medium text-slate-400">{tx.orderCode} • {new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className="text-right shrink-0">
                        <p className={`text-sm font-black ${tx.status === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                           {tx.amount.toLocaleString()}₫
                        </p>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${tx.status === 'PAID' ? 'text-green-600' : tx.status === 'PENDING' ? 'text-amber-600' : 'text-red-500'}`}>
                           {tx.status}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-50">
               <button 
                  onClick={() => router.push('/admin/finance/transactions')}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all border-0 flex items-center justify-center gap-1"
               >
                  Tra cứu chi tiết <ChevronRight size={14} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
