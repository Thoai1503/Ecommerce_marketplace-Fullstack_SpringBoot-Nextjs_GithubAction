
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProductDetail, useProducts } from '@/hooks/admin/useProducts';
import { 
  ChevronLeft, ChevronRight, Package, CheckCircle, XCircle, Trash2, Edit3, 
  Layers, AlertCircle, Eye, Box, DollarSign, Image as ImageIcon, 
  Maximize2, X, ChevronDown, ChevronUp, Mail, MessageCircle, BarChart3, Tag
} from 'lucide-react';
import { ProductStatus } from '@/types';
import { useToast } from '@/context/ToastContext';
import RejectProductModal from '@/components/admin/products/RejectProductModal';
import DeleteConfirmationModal from '@/components/admin/products/DeleteConfirmationModal';
import { DetailSkeleton } from '@/components/ui/Skeleton';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

// Synced StatusConfig with ProductsPage
const StatusConfig: Record<ProductStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: any }> = {
  PENDING: { 
    label: 'Chờ duyệt', 
    color: 'text-amber-700', 
    bgColor: 'bg-amber-100', 
    borderColor: 'border-amber-200',
    icon: <AlertCircle size={14} /> 
  },
  APPROVED: { 
    label: 'Đang bán', 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-100', 
    borderColor: 'border-emerald-200',
    icon: <CheckCircle size={14} /> 
  },
  REJECTED: { 
    label: 'Từ chối', 
    color: 'text-rose-700', 
    bgColor: 'bg-rose-100', 
    borderColor: 'border-rose-200',
    icon: <XCircle size={14} /> 
  },
  DRAFT: { 
    label: 'Nháp', 
    color: 'text-slate-600', 
    bgColor: 'bg-slate-100', 
    borderColor: 'border-slate-200',
    icon: <Edit3 size={14} /> 
  },
  HIDDEN: { 
    label: 'Đang ẩn', 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-100', 
    borderColor: 'border-indigo-200',
    icon: <Package size={14} /> 
  },
};

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = params?.id || '';
  const { data: product, isLoading } = useProductDetail(id);
  const { approveProduct, rejectProduct, deleteProducts } = useProducts();
  const { success, info, error } = useToast();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // UX State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Set initial state
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setActiveImageIndex(0);
    }
  }, [product]);

  const handleNextImage = () => {
    if (product && product.images.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const handlePrevImage = () => {
    if (product && product.images.length > 0) {
      setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (isLoading) return <DetailSkeleton />;

  if (!product)
    return (
      <div className="p-20 text-center flex flex-col items-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-bold text-slate-800">Không tìm thấy sản phẩm</h3>
        <button
          onClick={() => router.push('/admin/products')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );

  const activeImage = product.images?.[activeImageIndex];
  // Determine if description is long enough to need truncation (e.g., > 300 chars)
  const shouldTruncateDescription = product.description && product.description.length > 300;

  const handleApprove = async () => {
    if (confirm("Xác nhận duyệt sản phẩm này?")) {
      await approveProduct(product.id);
      success("Đã duyệt sản phẩm thành công!");
    }
  };

  const handleConfirmReject = async (reason: string) => {
    try {
      await rejectProduct({ id: product.id, reason });
      info("Đã từ chối sản phẩm!");
      setIsRejectModalOpen(false);
    } catch(err) {
      error("Lỗi khi từ chối sản phẩm.");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProducts([product.id]);
      success("Đã xóa sản phẩm thành công!");
      setTimeout(() => router.push('/admin/products'), 1000);
    } catch (err) {
      error("Lỗi khi xóa sản phẩm.");
    }
  };

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto space-y-8 pb-24">
      {/* Modals */}
      <RejectProductModal 
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        productName={product.name}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={product.name}
      />

      {/* Image Lightbox (Zoom) */}
      {isImageZoomOpen && activeImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200" onClick={() => setIsImageZoomOpen(false)}>
          <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50">
            <X size={24} />
          </button>
          
          <button 
             onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
             className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
          >
             <ChevronLeft size={32} />
          </button>

          <img 
            src={activeImage} 
            alt="Zoomed" 
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300 select-none"
            onClick={(e) => e.stopPropagation()} 
          />

          <button 
             onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
             className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
          >
             <ChevronRight size={32} />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/50 px-4 py-2 rounded-full pointer-events-none">
            {activeImageIndex + 1} / {product.images.length}
          </div>
        </div>
      )}

      <Breadcrumbs items={[
        { label: 'Products', path: '/admin/products' },
        { label: 'Details' }
      ]} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => router.push('/admin/products')}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500 mt-1"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">{product.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${StatusConfig[product.status].bgColor} ${StatusConfig[product.status].color} ${StatusConfig[product.status].borderColor}`}>
                {StatusConfig[product.status].icon}
                {StatusConfig[product.status].label}
              </span>
            </div>

            {/* Quick Metadata in Header */}
            <div className="flex items-center gap-4 mt-2 text-sm animate-in slide-in-from-left-2 duration-300">
              <span className="flex items-center gap-1.5 font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                 <Tag size={14} className="text-slate-400" /> {product.sku}
              </span>
              <span className="flex items-center gap-1.5 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                 <DollarSign size={14} /> {product.price.toLocaleString()}₫
              </span>
              <span className="flex items-center gap-1.5 font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                 <Box size={14} /> {product.stock} sp
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Edit3 size={18} /> <span className="hidden sm:inline">Chỉnh sửa</span>
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-all shadow-sm"
          >
            <Trash2 size={18} /> <span className="hidden sm:inline">Xóa</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 1: Media / Images Gallery (Moved to Top) */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <ImageIcon size={18} /> Hình ảnh sản phẩm
            </h3>
            
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Large Image */}
                <div 
                  className="aspect-square md:aspect-[16/9] w-full bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative flex items-center justify-center group select-none cursor-zoom-in"
                  onClick={() => setIsImageZoomOpen(true)}
                  title="Click to zoom"
                >
                   {activeImage ? (
                     <>
                       <img 
                         src={activeImage} 
                         alt={product.name} 
                         className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" 
                       />
                       
                       <div className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none">
                          <Maximize2 size={18} />
                       </div>
                       
                       {/* Carousel Controls */}
                       {product.images.length > 1 && (
                         <>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                             className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all transform -translate-x-4 group-hover:translate-x-0"
                             aria-label="Previous image"
                           >
                             <ChevronLeft size={24} />
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                             className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0"
                             aria-label="Next image"
                           >
                             <ChevronRight size={24} />
                           </button>
                           
                           {/* Image Counter Badge */}
                           <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold pointer-events-none">
                             {activeImageIndex + 1} / {product.images.length}
                           </div>
                         </>
                       )}
                     </>
                   ) : (
                     <div className="text-slate-400 flex flex-col items-center">
                       <ImageIcon size={48} className="mb-2 opacity-30" />
                       <span className="text-sm">Select an image</span>
                     </div>
                   )}
                </div>

                {/* Thumbnails Row */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {product.images.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white ${
                        activeImageIndex === idx 
                          ? 'border-blue-600 ring-2 ring-blue-100 ring-offset-1 opacity-100' 
                          : 'border-transparent hover:border-slate-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ImageIcon size={48} className="mb-3 opacity-50" />
                <p className="text-sm font-medium">Chưa có hình ảnh nào.</p>
              </div>
            )}
          </div>

          {/* SECTION 2: General Information */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Layers size={18} /> Thông tin chi tiết
            </h3>
            
            <div className="space-y-6">
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Mô tả sản phẩm</label>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative group">
                  <div className={`text-slate-600 text-sm leading-relaxed whitespace-pre-line transition-all duration-300 ${!isDescriptionExpanded && shouldTruncateDescription ? 'max-h-[150px] overflow-hidden' : ''}`}>
                    {product.description || "Chưa có mô tả."}
                  </div>
                  
                  {/* Gradient Overlay when collapsed */}
                  {!isDescriptionExpanded && shouldTruncateDescription && (
                    <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent rounded-b-2xl pointer-events-none"></div>
                  )}

                  {shouldTruncateDescription && (
                    <button 
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all relative z-10"
                    >
                      {isDescriptionExpanded ? (
                        <>Thu gọn <ChevronUp size={14} /></>
                      ) : (
                        <>Xem thêm mô tả <ChevronDown size={14} /></>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Attributes Grid */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Thuộc tính</label>
                {product.attributes && Object.keys(product.attributes).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(product.attributes).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                        <span className="text-sm font-medium text-slate-500">{key}</span>
                        <span className="text-sm font-bold text-slate-800">{value as string}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-sm text-slate-400 italic">Không có thuộc tính nào.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-8">
          
          {/* Action Card (If Pending) */}
          {product.status === 'PENDING' && (
            <div className="bg-amber-50 rounded-[24px] border border-amber-200 p-6 animate-in slide-in-from-top-4">
              <h3 className="text-xs font-black text-amber-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <AlertCircle size={14} /> Cần phê duyệt
              </h3>
              <p className="text-sm text-amber-700 mb-4">Sản phẩm này đang chờ duyệt để được đăng bán công khai.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleApprove}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Duyệt ngay
                </button>
                <button 
                  onClick={() => setIsRejectModalOpen(true)}
                  className="w-full py-3 bg-white border border-amber-200 hover:bg-red-50 hover:text-red-600 text-amber-800 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Từ chối
                </button>
              </div>
            </div>
          )}

          {/* Pricing & Stock Summary */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tổng quan</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <DollarSign size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-600">Giá bán</span>
                 </div>
                 <span className="text-lg font-black text-slate-800">{product.price.toLocaleString()}₫</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                      <Box size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-600">Kho hàng</span>
                 </div>
                 <span className="text-lg font-black text-slate-800">{product.stock}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-600">Lượt xem</span>
                 </div>
                 <span className="text-lg font-black text-slate-800">{product.viewCount?.toLocaleString() || 0}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-50">
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase">Ngày tạo</span>
                    <span className="font-bold text-slate-700">{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Rejected Reason (If Rejected) */}
          {product.status === 'REJECTED' && product.rejectReason && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-xs font-bold text-red-800 uppercase mb-2 flex items-center gap-2">
                   <AlertCircle size={14} /> Lý do từ chối
                </p>
                <p className="text-sm text-red-600 bg-white p-3 rounded-xl border border-red-100">{product.rejectReason}</p>
              </div>
          )}

          {/* Organization & Seller Card */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Thông tin khác</h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nhà bán hàng</p>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                   <img src={product.sellerAvatar} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                   <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 truncate">{product.sellerName}</p>
                      <p className="text-xs text-blue-600 font-bold group-hover:underline">Xem hồ sơ</p>
                   </div>
                   
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chat">
                        <MessageCircle size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Email">
                        <Mail size={16} />
                      </button>
                   </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Danh mục</p>
                <div className="flex items-center gap-2">
                   <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-2">
                      <Layers size={14} />
                      {product.category}
                   </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
