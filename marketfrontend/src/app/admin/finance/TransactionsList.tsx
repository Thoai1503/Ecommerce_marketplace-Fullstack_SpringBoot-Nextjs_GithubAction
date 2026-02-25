
"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTransactions } from '../../../hooks/admin/useFinance';
import { 
  Search, Filter, Download, ArrowUpRight, ArrowDownRight, 
  CheckCircle, AlertTriangle, XCircle, CreditCard, ChevronLeft,
  Calendar, Wallet, Copy, X, ExternalLink, MoreHorizontal, Banknote,
  ShieldAlert, ScanLine
} from 'lucide-react';
import { TransactionStatus, Transaction } from '../../../types/index';
import { Skeleton } from '../../../components/ui/Skeleton';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import Pagination from '../../../components/ui/Pagination';

const StatusConfig: Record<TransactionStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  PAID: { label: 'Thành công', color: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: <CheckCircle size={14} /> },
  PENDING: { label: 'Chờ xử lý', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: <AlertTriangle size={14} /> },
  CANCELLED: { label: 'Đã hủy', color: 'text-rose-700', bgColor: 'bg-rose-50', icon: <XCircle size={14} /> },
};

const ITEMS_PER_PAGE = 10;

// Extended Transaction Type for UI
interface ExtendedTransaction extends Transaction {
  riskScore?: number;
  riskReason?: string;
}

export default function TransactionsList() {
  const router = useRouter();
  const { transactions, isLoading } = useTransactions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | TransactionStatus>('ALL');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedTx, setSelectedTx] = useState<ExtendedTransaction | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // AI Fraud Detection State
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResults, setScannedResults] = useState<Record<string, number>>({});

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const totalVolume = transactions.filter(t => t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0);
    const successCount = transactions.filter(t => t.status === 'PAID').length;
    const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
    const failRate = transactions.length > 0 
      ? ((transactions.filter(t => t.status === 'CANCELLED').length / transactions.length) * 100).toFixed(1) 
      : 0;

    return { totalVolume, successCount, pendingCount, failRate };
  }, [transactions]);

  // --- FILTER LOGIC ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchTab = activeTab === 'ALL' || t.status === activeTab;
      const matchSearch = t.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMethod = selectedMethod === 'ALL' || t.paymentMethod === selectedMethod;
      return matchTab && matchSearch && matchMethod;
    });
  }, [transactions, activeTab, searchQuery, selectedMethod]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const uniqueMethods = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.paymentMethod))) as string[];
  }, [transactions]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: `Đã sao chép: ${text}`, type: 'success' });
  };

  // --- AI HANDLER ---
  const handleFraudScan = () => {
    setIsScanning(true);
    setToast({ message: "AI đang quét các giao dịch bất thường...", type: "info" });

    setTimeout(() => {
      const newResults: Record<string, number> = {};
      let fraudCount = 0;

      // Mock Scan Logic
      transactions.forEach(t => {
        let score = 0;
        // High amount detection
        if (t.amount > 5000000) score += 40;
        if (t.amount > 10000000) score += 40;
        // Suspicious name mock
        if (t.customerName.includes("Bad") || t.customerName.includes("Fake")) score += 50;
        
        // Random anomaly
        if (Math.random() > 0.85) score += 30;

        if (score > 0) newResults[t.id] = Math.min(100, score);
        if (score > 50) fraudCount++;
      });

      setScannedResults(newResults);
      setIsScanning(false);
      setToast({ message: `Hoàn tất quét! Phát hiện ${fraudCount} giao dịch rủi ro cao.`, type: "warning" });
    }, 2000);
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6 pb-20 relative">
      {toast && <ToastComponent toast={{ id: 'toast-1', message: toast.message, type: toast.type }} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin/finance')}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Lịch sử giao dịch</h1>
              <p className="text-sm text-slate-500 font-medium">Theo dõi dòng tiền vào ra chi tiết.</p>
            </div>
         </div>
         <div className="flex gap-3">
            {/* AI Scan Button */}
            <button 
              onClick={handleFraudScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all border-0 ${
                isScanning 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
              }`}
            >
               {isScanning ? <ScanLine size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
               {isScanning ? 'Scanning...' : 'AI Fraud Scan'}
            </button>
            
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 shadow-sm">
               <Download size={18} /> Export
            </button>
         </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <Wallet size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng giá trị (Paid)</p>
               <p className="text-xl font-black text-slate-800">{(stats.totalVolume / 1000000).toFixed(1)}M₫</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <CheckCircle size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thành công</p>
               <p className="text-xl font-black text-slate-800">{stats.successCount} GD</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
               <AlertTriangle size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang chờ xử lý</p>
               <p className="text-xl font-black text-slate-800">{stats.pendingCount} GD</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
               <XCircle size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ hủy</p>
               <p className="text-xl font-black text-slate-800">{stats.failRate}%</p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 w-full lg:max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Tìm mã đơn, khách hàng, seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>
            
            {/* Filter by Method */}
            <div className="relative hidden md:block">
               <select 
                 value={selectedMethod}
                 onChange={(e) => setSelectedMethod(e.target.value)}
                 className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/5 cursor-pointer hover:bg-slate-50"
               >
                 <option value="ALL">Tất cả phương thức</option>
                 {uniqueMethods.map(m => <option key={m} value={m}>{m}</option>)}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                 <Filter size={14} />
               </div>
            </div>

            {/* Date Filter (Mock) */}
            <button className="hidden md:flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
               <Calendar size={16} /> <span>Tháng này</span>
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full lg:w-auto overflow-x-auto no-scrollbar">
             {['ALL', 'PAID', 'PENDING', 'CANCELLED'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`flex-1 lg:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all border-0 whitespace-nowrap ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {tab === 'ALL' ? 'Tất cả' : StatusConfig[tab as TransactionStatus].label}
               </button>
             ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Mã giao dịch</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng / Đối tác</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giá trị</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Phương thức</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thời gian</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-6 py-4"><Skeleton className="h-12 w-full" /></td></tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                         <Search size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold">Không tìm thấy giao dịch phù hợp.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const riskScore = scannedResults[tx.id] || 0;
                  const isRisky = riskScore > 50;

                  return (
                  <tr 
                    key={tx.id} 
                    className={`hover:bg-blue-50/30 transition-colors cursor-pointer group ${selectedTx?.id === tx.id ? 'bg-blue-50' : ''} ${isRisky ? 'bg-red-50/50 hover:bg-red-50' : ''}`}
                    onClick={() => setSelectedTx({...tx, riskScore, riskReason: isRisky ? "Phát hiện bất thường bởi AI" : ""})}
                  >
                    <td className="px-6 py-5 pl-8">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <span className="font-mono font-bold text-sm text-slate-700">{tx.orderCode}</span>
                             <button onClick={(e) => { e.stopPropagation(); copyToClipboard(tx.orderCode); }} className="text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Copy size={12} />
                             </button>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">ID: {tx.id.toUpperCase()}</span>
                          
                          {/* Risk Badge */}
                          {riskScore > 0 && (
                             <span className={`inline-flex items-center gap-1 mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${isRisky ? 'bg-red-100 text-red-600 border-red-200' : 'bg-green-100 text-green-600 border-green-200'}`}>
                                <ShieldAlert size={10} /> Risk Score: {riskScore}
                             </span>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-800">{tx.customerName}</span>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                             <ArrowUpRight size={10} className="text-slate-400" /> {tx.sellerName}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <span className={`text-sm font-black ${tx.status === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                         {tx.amount.toLocaleString()}₫
                       </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                          <CreditCard size={12} /> {tx.paymentMethod}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{new Date(tx.date).toLocaleDateString('vi-VN')}</span>
                          <span className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${StatusConfig[tx.status].bgColor} ${StatusConfig[tx.status].color}`}>
                        {StatusConfig[tx.status].icon}
                        {StatusConfig[tx.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right pr-8">
                       <button className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition-all">
                          <MoreHorizontal size={18} />
                       </button>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredTransactions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredTransactions.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>

      {/* Transaction Detail Slide-over Panel */}
      {selectedTx && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedTx(null)}></div>
          <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 p-0 overflow-y-auto animate-in slide-in-from-right duration-300">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-lg font-black text-slate-800">Chi tiết giao dịch</h3>
                <button onClick={() => setSelectedTx(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                   <X size={20} className="text-slate-500" />
                </button>
             </div>
             
             <div className="p-6 space-y-8">
                {/* Amount Header */}
                <div className="text-center">
                   <div className={`inline-flex p-4 rounded-full mb-4 ${StatusConfig[selectedTx.status].bgColor} ${StatusConfig[selectedTx.status].color}`}>
                      <Banknote size={32} />
                   </div>
                   <h2 className={`text-3xl font-black mb-1 ${selectedTx.status === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {selectedTx.amount.toLocaleString()}₫
                   </h2>
                   <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${StatusConfig[selectedTx.status].bgColor} ${StatusConfig[selectedTx.status].color}`}>
                      {StatusConfig[selectedTx.status].label}
                   </span>
                </div>

                {/* Risk Warning in Slide-over */}
                {selectedTx.riskScore && selectedTx.riskScore > 50 && (
                   <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                      <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={20} />
                      <div>
                         <h4 className="text-sm font-bold text-red-700">Cảnh báo rủi ro cao</h4>
                         <p className="text-xs text-red-600 mt-1">{selectedTx.riskReason}</p>
                         <p className="text-xs font-black text-red-700 mt-2">Risk Score: {selectedTx.riskScore}/100</p>
                      </div>
                   </div>
                )}

                {/* Details List */}
                <div className="space-y-4">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-medium">Mã giao dịch</span>
                         <span className="font-mono font-bold text-slate-800 flex items-center gap-2">
                            {selectedTx.id.toUpperCase()} 
                            <Copy size={12} className="cursor-pointer text-slate-400 hover:text-blue-600" onClick={() => copyToClipboard(selectedTx.id)} />
                         </span>
                      </div>
                      <div className="h-px bg-slate-200"></div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-medium">Mã đơn hàng</span>
                         <span 
                           className="font-mono font-bold text-blue-600 cursor-pointer hover:underline flex items-center gap-1"
                           onClick={() => router.push(`/admin/orders/${selectedTx.orderId}`)}
                         >
                            {selectedTx.orderCode} <ExternalLink size={12} />
                         </span>
                      </div>
                      <div className="h-px bg-slate-200"></div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-medium">Thời gian</span>
                         <span className="font-bold text-slate-800">{new Date(selectedTx.date).toLocaleString('vi-VN')}</span>
                      </div>
                   </div>

                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-medium">Người gửi</span>
                         <span className="font-bold text-slate-800 text-right">{selectedTx.customerName}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-medium">Người nhận</span>
                         <span className="font-bold text-slate-800 text-right">{selectedTx.sellerName}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-medium">Cổng thanh toán</span>
                         <span className="font-bold text-slate-800 text-right">{selectedTx.paymentMethod}</span>
                      </div>
                   </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                   <button className="py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                      Gửi hóa đơn
                   </button>
                   <button className="py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900">
                      Tra soát
                   </button>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
