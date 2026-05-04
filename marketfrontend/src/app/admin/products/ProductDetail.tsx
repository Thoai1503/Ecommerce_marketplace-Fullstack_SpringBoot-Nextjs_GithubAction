
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProductDetail, useProducts } from '@/hooks/admin/useProducts';
import { useProductVariants } from '@/hooks/admin/useProductVariants';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ChevronLeft, ChevronRight, Package, CheckCircle, XCircle, Edit3,
  Layers, AlertCircle, Eye, Box, DollarSign, Image as ImageIcon,
  Maximize2, X, ChevronDown, ChevronUp, Mail, MessageCircle, BarChart3, Tag,
  EyeOff, RotateCcw, Trash2, Clock, Shield, Activity, Lock,
  Star, ShoppingCart, Weight, Ruler, Award, TrendingUp, Plus, Power
} from 'lucide-react';
import { ProductStatus, ProductVariant } from '@/types';
import { useToast } from '@/context/ToastContext';
import RejectProductModal from '@/components/admin/products/RejectProductModal';
import HideProductModal from '@/components/admin/products/HideProductModal';
import AIFraudWarning from '@/components/admin/products/AIFraudWarning';
import FieldWarning from '@/components/admin/products/FieldWarning';
import QualityWarnings from '@/components/admin/products/QualityWarnings';
import ProductPerformanceDashboard from '@/components/admin/products/performance/ProductPerformanceDashboard';
import { DetailSkeleton } from '@/components/ui/Skeleton';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { checkProductQuality } from '@/lib/productQualityCheck';

type ProductVariantWithMeta = ProductVariant & {
  isActive?: boolean | number | string;
  is_active?: boolean | number | string;
  imageUrl?: string;
  image_url?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
};

const optionalNonNegativeNumber = z.preprocess(
  (value) => (value === '' || value === undefined || value === null ? undefined : Number(value)),
  z.number().min(0, 'Khong duoc am').optional(),
);

const variantSchema = z.object({
  variantName: z.string().min(1, 'Ten bien the la bat buoc').max(255, 'Toi da 255 ky tu'),
  sku: z.string().min(1, 'SKU la bat buoc').max(100, 'SKU toi da 100 ky tu')
    .regex(/^[A-Za-z0-9_-]+$/, 'SKU chi chua chu, so, gach ngang, gach duoi')
    .transform((value) => value.toUpperCase()),
  price: z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? undefined : Number(value)),
    z.number().min(0.01, 'Gia phai lon hon 0').max(999_999_999, 'Gia toi da 999.999.999d'),
  ),
  stockQuantity: z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? undefined : Number(value)),
    z.number().int('Phai la so nguyen').min(0, 'Khong duoc am').max(1_000_000, 'Ton kho toi da 1.000.000'),
  ),
  imageUrl: z.string().max(500, 'URL anh toi da 500 ky tu').optional().or(z.literal('')),
  weight: optionalNonNegativeNumber,
  length: optionalNonNegativeNumber,
  width: optionalNonNegativeNumber,
  height: optionalNonNegativeNumber,
});

type VariantFormInput = z.input<typeof variantSchema>;
type VariantFormValues = z.output<typeof variantSchema>;

// Synced StatusConfig with ProductsPage - vibrant colors
const StatusConfig: Record<ProductStatus, { label: string; color: string; bgColor: string; borderColor: string; bannerBg: string; bannerText: string; icon: any }> = {
  PENDING: {
    label: 'Chờ duyệt',
    color: 'text-white',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-600',
    bannerBg: 'bg-amber-50 border-amber-200',
    bannerText: 'text-amber-800',
    icon: <AlertCircle size={14} />
  },
  APPROVED: {
    label: 'Đang bán',
    color: 'text-white',
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-600',
    bannerBg: 'bg-emerald-50 border-emerald-200',
    bannerText: 'text-emerald-800',
    icon: <CheckCircle size={14} />
  },
  REJECTED: {
    label: 'Từ chối',
    color: 'text-white',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-600',
    bannerBg: 'bg-red-50 border-red-200',
    bannerText: 'text-red-800',
    icon: <XCircle size={14} />
  },
  DRAFT: {
    label: 'Nháp',
    color: 'text-white',
    bgColor: 'bg-gray-500',
    borderColor: 'border-gray-600',
    bannerBg: 'bg-gray-50 border-gray-200',
    bannerText: 'text-gray-800',
    icon: <Edit3 size={14} />
  },
  HIDDEN: {
    label: 'Đang ẩn',
    color: 'text-white',
    bgColor: 'bg-slate-600',
    borderColor: 'border-slate-700',
    bannerBg: 'bg-slate-50 border-slate-200',
    bannerText: 'text-slate-800',
    icon: <Lock size={14} />
  },
};

function ProductDetail() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = params?.id || '';
  const { data: product, isLoading, statusHistory } = useProductDetail(id);
  const { approveProduct, rejectProduct, updateProductStatus, deleteProducts } = useProducts();
  const {
    variants: fetchedVariants,
    isLoading: isVariantsLoading,
    isError: isVariantsError,
    createVariant,
    updateVariant,
    toggleVariant,
    deleteVariant,
    isMutating: isVariantMutating,
  } = useProductVariants(product?.id);
  const { success, info, error } = useToast();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [isHideSubmitting, setIsHideSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void; type: 'success' | 'warning' | 'danger' } | null>(null);
  const [variantModal, setVariantModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    variant?: ProductVariantWithMeta;
  }>({ open: false, mode: 'create' });
  const [deleteVariantModal, setDeleteVariantModal] = useState<{
    open: boolean;
    variant?: ProductVariantWithMeta;
  }>({ open: false });

  // UX State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'description' | 'history'>('info');
  const [reviewChecklist, setReviewChecklist] = useState({
    images: false,
    description: false,
    price: false,
    category: false,
  });

  // Set initial state
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setActiveImageIndex(0);
    }
  }, [product]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // ESC closes any open modal/lightbox (priority order)
      if (e.key === 'Escape') {
        if (isImageZoomOpen) { setIsImageZoomOpen(false); return; }
        if (variantModal.open) { setVariantModal({ open: false, mode: 'create' }); return; }
        if (deleteVariantModal.open) { setDeleteVariantModal({ open: false }); return; }
        if (confirmAction) { setConfirmAction(null); return; }
        if (isHideModalOpen) { setIsHideModalOpen(false); return; }
        if (isRejectModalOpen) { setIsRejectModalOpen(false); return; }
        return;
      }

      // Other shortcuts only when no modal is open
      if (isRejectModalOpen || isHideModalOpen || confirmAction || isImageZoomOpen || variantModal.open || deleteVariantModal.open) return;
      if (!product) return;

      if (product.status === 'PENDING') {
        if (e.key === 'a' || e.key === 'A') handleApprove();
        if (e.key === 'r' || e.key === 'R') setIsRejectModalOpen(true);
      }
      // Image gallery navigation
      if (product.images && product.images.length > 1) {
        if (e.key === 'ArrowLeft') handlePrevImage();
        if (e.key === 'ArrowRight') handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isRejectModalOpen, isHideModalOpen, confirmAction, isImageZoomOpen, variantModal.open, deleteVariantModal.open]);

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

  const handleApprove = () => {
    setConfirmAction({
      title: 'Duyệt sản phẩm?',
      message: `Sản phẩm "${product.name}" sẽ được đăng bán công khai trên store.`,
      type: 'success',
      onConfirm: async () => {
        try {
          await approveProduct(product.id);
          success('Đã duyệt sản phẩm thành công!');
        } catch {
          error('Lỗi khi duyệt sản phẩm.');
        }
        setConfirmAction(null);
      },
    });
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

  const handleHide = () => {
    setIsHideModalOpen(true);
    if (confirmAction) setConfirmAction({
      title: 'Tạm ẩn sản phẩm?',
      message: 'Sản phẩm sẽ không hiển thị trên store. Bạn có thể hiện lại bất cứ lúc nào.',
      type: 'warning',
      onConfirm: async () => {
        try {
          await updateProductStatus({ id: product.id, status: 'HIDDEN' });
          info('Đã tạm ẩn sản phẩm.');
        } catch {
          error('Lỗi khi ẩn sản phẩm.');
        }
        setConfirmAction(null);
      },
    });
  };

  const handleConfirmHide = async (reason: string) => {
    setIsHideSubmitting(true);
    try {
      await updateProductStatus({ id: product.id, status: 'HIDDEN', reason });
      info('Đã tạm ẩn sản phẩm.');
      setIsHideModalOpen(false);
    } catch {
      error('Lỗi khi ẩn sản phẩm.');
    } finally {
      setIsHideSubmitting(false);
    }
  };

  const handleUnhide = () => {
    setConfirmAction({
      title: 'Hiện lại sản phẩm?',
      message: 'Sản phẩm sẽ trở lại trạng thái "Đang bán" và hiển thị trên store.',
      type: 'success',
      onConfirm: async () => {
        try {
          await updateProductStatus({ id: product.id, status: 'APPROVED' });
          success('Đã hiện lại sản phẩm.');
        } catch {
          error('Lỗi khi hiện lại sản phẩm.');
        }
        setConfirmAction(null);
      },
    });
  };

  const handleRestore = () => {
    setConfirmAction({
      title: 'Phục hồi sản phẩm?',
      message: 'Sản phẩm sẽ chuyển về trạng thái "Chờ duyệt" để seller có thể sửa và gửi lại.',
      type: 'success',
      onConfirm: async () => {
        try {
          await updateProductStatus({ id: product.id, status: 'PENDING' });
          info('Đã phục hồi sản phẩm về Chờ duyệt.');
        } catch {
          error('Lỗi khi phục hồi sản phẩm.');
        }
        setConfirmAction(null);
      },
    });
  };

  const handleDelete = () => {
    setConfirmAction({
      title: 'Xóa vĩnh viễn?',
      message: `Sản phẩm "${product.name}" sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác!`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteProducts([product.id]);
          success('Đã xóa sản phẩm vĩnh viễn.');
          router.push('/admin/products');
        } catch {
          error('Lỗi khi xóa sản phẩm.');
        }
        setConfirmAction(null);
      },
    });
  };

  const allChecked = Object.values(reviewChecklist).every(v => v);
  const qualityIssues = checkProductQuality(product);
  const qualityIssueFor = (field: string) => qualityIssues.find((issue) => issue.field === field);
  const imageIssue = qualityIssueFor('images');
  const descriptionIssue = qualityIssueFor('description');
  const priceIssue = qualityIssueFor('price');
  const stockIssue = qualityIssueFor('stock');
  const formatDateTime = (value?: string | null) => {
    if (!value) return 'Chưa ghi nhận';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
  };
  const fallbackVariants = (product.variants ?? []) as ProductVariantWithMeta[];
  const variants = ((isVariantsLoading || isVariantsError) && fallbackVariants.length > 0
    ? fallbackVariants
    : fetchedVariants) as ProductVariantWithMeta[];
  const isVariantActive = (variant: ProductVariantWithMeta) => {
    const raw = variant.isActive ?? variant.is_active;
    return !(raw === false || raw === 0 || raw === '0');
  };
  const handleToggleVariant = async (variant: ProductVariantWithMeta) => {
    try {
      await toggleVariant(variant.id);
      success('Đã ẩn/hiện biến thể.');
    } catch {
      error('Lỗi khi cập nhật trạng thái biến thể.');
    }
  };
  const handleConfirmDeleteVariant = async () => {
    if (!deleteVariantModal.variant) return;
    try {
      await deleteVariant(deleteVariantModal.variant.id);
      success('Đã xóa biến thể.');
      setDeleteVariantModal({ open: false });
    } catch {
      error('Lỗi khi xóa biến thể.');
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

      <HideProductModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        onConfirm={handleConfirmHide}
        productName={product.name}
        isSubmitting={isHideSubmitting}
      />

      <VariantModal
        isOpen={variantModal.open}
        mode={variantModal.mode}
        productId={product.id}
        variant={variantModal.variant}
        onClose={() => setVariantModal({ open: false, mode: 'create' })}
        onCreate={createVariant}
        onUpdate={updateVariant}
      />

      <ConfirmationModal
        isOpen={deleteVariantModal.open}
        onClose={() => setDeleteVariantModal({ open: false })}
        onConfirm={handleConfirmDeleteVariant}
        title="Xóa biến thể?"
        description={`Biến thể "${deleteVariantModal.variant?.variantName || deleteVariantModal.variant?.sku || ''}" sẽ được ẩn khỏi sản phẩm này.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        isLoading={isVariantMutating}
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

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-full ${
                confirmAction.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                confirmAction.type === 'danger' ? 'bg-red-100 text-red-600' :
                'bg-amber-100 text-amber-600'
              }`}>
                {confirmAction.type === 'success' ? <CheckCircle size={24} /> :
                 confirmAction.type === 'danger' ? <Trash2 size={24} /> :
                 <AlertCircle size={24} />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-800 mb-2">{confirmAction.title}</h3>
                <p className="text-sm text-slate-600">{confirmAction.message}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                Hủy <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-200 rounded">Esc</kbd>
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className={`flex-1 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg transition-all ${
                  confirmAction.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' :
                  confirmAction.type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' :
                  'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <Breadcrumbs items={[
        { label: 'Sản phẩm', path: '/admin/products' },
        { label: 'Chi tiết' }
      ]} />

      {/* Status Banner */}
      <div className={`rounded-2xl border-2 p-5 flex items-center gap-4 ${StatusConfig[product.status].bannerBg}`}>
        <div className={`w-12 h-12 ${StatusConfig[product.status].bgColor} text-white rounded-xl flex items-center justify-center shrink-0 shadow-md`}>
          {React.cloneElement(StatusConfig[product.status].icon, { size: 24 })}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-base font-black ${StatusConfig[product.status].bannerText}`}>
            {product.status === 'PENDING' && '⏳ Sản phẩm đang chờ duyệt'}
            {product.status === 'APPROVED' && '✅ Sản phẩm đang bán công khai'}
            {product.status === 'REJECTED' && '❌ Sản phẩm đã bị từ chối'}
            {product.status === 'HIDDEN' && '🔒 Sản phẩm đang bị ẩn'}
            {product.status === 'DRAFT' && '📝 Bản nháp'}
          </p>
          <p className={`text-sm mt-1 ${StatusConfig[product.status].bannerText} opacity-80`}>
            {product.status === 'PENDING' && 'Admin cần review thông tin và duyệt hoặc từ chối.'}
            {product.status === 'APPROVED' && `Đăng bán từ ngày ${new Date(product.createdAt).toLocaleDateString('vi-VN')}.`}
            {product.status === 'REJECTED' && (product.rejectReason || 'Không có lý do cụ thể được ghi nhận.')}
            {product.status === 'HIDDEN' && 'Sản phẩm tạm thời không hiển thị trên store. Có thể hiện lại bất cứ lúc nào.'}
          </p>
        </div>
      </div>

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
            <div className="flex items-center gap-3 mt-2 text-sm animate-in slide-in-from-left-2 duration-300" title={product.sku}>
              <span className="flex items-center gap-1.5 font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                 <DollarSign size={14} /> {product.price.toLocaleString()}₫
              </span>
              <span className="flex items-center gap-1.5 font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
                 <Box size={14} /> {product.stock} sp
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-500 text-xs">
                 <Tag size={12} /> #{product.id}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 flex items-center gap-2">
          <Shield size={14} /> Quyền: Duyệt / Từ chối / Ẩn / Xóa
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 1: Media / Images Gallery (Moved to Top) */}
          <FieldWarning
            field="images"
            severity={imageIssue?.severity}
            message={imageIssue ? `${imageIssue.message}. ${imageIssue.suggestion}` : undefined}
          >
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
          </FieldWarning>

          {/* SECTION 2: General Information */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Layers size={18} /> Thông tin chi tiết
            </h3>

            <div className="space-y-6">

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Mô tả sản phẩm</label>
                <FieldWarning
                  field="description"
                  severity={descriptionIssue?.severity}
                  message={descriptionIssue ? `${descriptionIssue.message}. ${descriptionIssue.suggestion}` : undefined}
                >
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
                </FieldWarning>
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

          {product.status === 'APPROVED' && (
            <ProductPerformanceDashboard product={product} />
          )}

          {/* SECTION 3: Pricing & Discount */}
          <FieldWarning
            field="price"
            severity={priceIssue?.severity}
            message={priceIssue ? `${priceIssue.message}. ${priceIssue.suggestion}` : undefined}
          >
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <DollarSign size={18} /> Giá bán & Khuyến mãi
            </h3>
            <div className="flex items-end gap-6 flex-wrap">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Giá bán</p>
                <p className="text-3xl font-black text-blue-600">{product.price.toLocaleString()}₫</p>
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Giá gốc</p>
                    <p className="text-xl font-bold text-slate-400 line-through">{product.originalPrice.toLocaleString()}₫</p>
                  </div>
                  <div className="px-4 py-2 bg-red-500 text-white rounded-xl font-black shadow-lg shadow-red-500/20">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                </>
              )}
            </div>
          </div>
          </FieldWarning>

          {/* SECTION 4: Logistics Info */}
          {(product.weight || product.length || product.width || product.height || product.brand) && (
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Weight size={18} /> Thông tin vận chuyển
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {product.brand && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <Award size={14} /> Thương hiệu
                    </div>
                    <p className="text-sm font-black text-slate-800">{product.brand}</p>
                  </div>
                )}
                {product.weight !== undefined && product.weight !== null && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <Weight size={14} /> Cân nặng
                    </div>
                    <p className="text-sm font-black text-slate-800">{product.weight} g</p>
                  </div>
                )}
                {(product.length || product.width || product.height) && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 col-span-1 sm:col-span-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <Ruler size={14} /> Kích thước (D × R × C)
                    </div>
                    <p className="text-sm font-black text-slate-800">
                      {product.length || 0} × {product.width || 0} × {product.height || 0} cm
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: Variants */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers size={18} /> Biến thể sản phẩm ({variants.length})
              </h3>
              <button
                onClick={() => setVariantModal({ open: true, mode: 'create' })}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-60"
                disabled={isVariantMutating}
              >
                <Plus size={16} /> Thêm biến thể
              </button>
            </div>

            {isVariantsLoading && fallbackVariants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm font-bold text-slate-500">Đang tải biến thể...</p>
              </div>
            ) : variants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                  <Package size={24} />
                </div>
                <p className="text-sm font-black text-slate-700">Sản phẩm này chưa có biến thể nào.</p>
                <p className="mt-1 text-xs text-slate-500">Thêm biến thể nếu sản phẩm có nhiều phiên bản như size, màu hoặc dung lượng.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kho</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                      <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((v) => {
                      const active = isVariantActive(v);
                      return (
                        <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-bold text-slate-800">{v.variantName || '-'}</td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-600">{v.sku || '-'}</td>
                          <td className="px-4 py-3 text-sm font-bold text-blue-600">{v.price ? `${v.price.toLocaleString()}₫` : '-'}</td>
                          <td className="px-4 py-3">
                            {v.stockQuantity === 0 ? (
                              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Hết</span>
                            ) : (
                              <span className="text-sm font-bold text-slate-700">{v.stockQuantity ?? '-'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                              active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setVariantModal({ open: true, mode: 'edit', variant: v })}
                                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Sửa biến thể"
                                disabled={isVariantMutating}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleToggleVariant(v)}
                                className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Ẩn/hiện biến thể"
                                disabled={isVariantMutating}
                              >
                                <Power size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteVariantModal({ open: true, variant: v })}
                                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Xóa biến thể"
                                disabled={isVariantMutating}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-8">
          
          {/* PENDING — Action Card with Review Checklist */}
          {product.status === 'PENDING' && (
            <div className="bg-amber-50 rounded-[24px] border-2 border-amber-200 p-6 animate-in slide-in-from-top-4 shadow-md">
              <h3 className="text-xs font-black text-amber-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Shield size={14} /> Review Checklist
              </h3>

              <AIFraudWarning product={product} />

              <div className="mb-5">
                <QualityWarnings product={product} issues={qualityIssues} />
              </div>

              <div className="space-y-2 mb-5">
                {[
                  { key: 'images', label: 'Hình ảnh rõ ràng' },
                  { key: 'description', label: 'Mô tả đầy đủ' },
                  { key: 'price', label: 'Giá hợp lý' },
                  { key: 'category', label: 'Danh mục đúng' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={reviewChecklist[item.key as keyof typeof reviewChecklist]}
                      onChange={(e) => setReviewChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className={`text-sm transition-colors ${reviewChecklist[item.key as keyof typeof reviewChecklist] ? 'text-amber-900 font-semibold line-through' : 'text-amber-800'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-amber-200">
                <button
                  onClick={handleApprove}
                  disabled={!allChecked}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  title="Phím tắt: A"
                >
                  <CheckCircle size={18} /> Duyệt ngay {allChecked && <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded">A</kbd>}
                </button>
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="w-full py-3 bg-white border-2 border-red-200 hover:bg-red-50 hover:border-red-400 text-red-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  title="Phím tắt: R"
                >
                  <XCircle size={18} /> Từ chối <kbd className="px-1.5 py-0.5 text-[10px] bg-red-100 rounded">R</kbd>
                </button>
              </div>

              {!allChecked && (
                <p className="text-xs text-amber-700 mt-3 italic">⚠️ Hoàn thành checklist trước khi duyệt</p>
              )}
            </div>
          )}

          {/* APPROVED — Live + Hide Action */}
          {product.status === 'APPROVED' && (
            <div className="bg-emerald-50 rounded-[24px] border-2 border-emerald-200 p-6 animate-in slide-in-from-top-4 shadow-md">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-emerald-500 text-white rounded-lg">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-900">Đang bán công khai</h3>
                  <p className="text-xs text-emerald-700 mt-0.5">Từ {new Date(product.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-emerald-200">
                <button
                  onClick={handleHide}
                  className="w-full py-3 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-400 text-slate-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  <EyeOff size={18} /> Tạm ẩn sản phẩm
                </button>
              </div>
            </div>
          )}

          {/* REJECTED — Reason + Restore */}
          {product.status === 'REJECTED' && (
            <div className="bg-red-50 rounded-[24px] border-2 border-red-200 p-6 animate-in slide-in-from-top-4 shadow-md">
              <h3 className="text-xs font-black text-red-900 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <XCircle size={14} /> Đã từ chối
              </h3>

              <div className="bg-white p-4 rounded-xl border border-red-200 mb-4">
                <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2">Lý do từ chối</p>
                <p className="text-sm text-slate-700">{product.rejectReason || 'Không có lý do cụ thể'}</p>
              </div>

              <div className="mb-4">
                <QualityWarnings product={product} issues={qualityIssues} />
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-red-200">
                <button
                  onClick={handleRestore}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Phục hồi → Chờ duyệt
                </button>
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="w-full py-3 bg-white border-2 border-red-200 hover:bg-red-100 text-red-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 size={18} /> Sửa lý do từ chối
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full py-2.5 bg-transparent text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Xóa vĩnh viễn
                </button>
              </div>
            </div>
          )}

          {/* HIDDEN — Unhide */}
          {product.status === 'HIDDEN' && (
            <div className="bg-slate-100 rounded-[24px] border-2 border-slate-300 p-6 animate-in slide-in-from-top-4 shadow-md">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-slate-600 text-white rounded-lg">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Đang ẩn</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Sản phẩm không hiển thị trên store</p>
                </div>
              </div>

              <div className="mb-4 space-y-3 rounded-xl border border-slate-300 bg-white p-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đã ẩn lúc</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">{formatDateTime(product.hiddenAt)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bởi</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {product.hiddenByName || (product.hiddenBy ? `Admin #${product.hiddenBy}` : 'Chưa ghi nhận')}
                    {product.hiddenByRole && <span className="ml-1 text-xs text-slate-500">({product.hiddenByRole})</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lý do</p>
                  <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                    {product.hiddenReason || 'Chưa ghi nhận lý do ẩn'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-slate-300">
                <button
                  onClick={handleUnhide}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={18} /> Hiện lại → Đang bán
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full py-2.5 bg-transparent text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Xóa vĩnh viễn
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

              <FieldWarning
                field="stock"
                severity={stockIssue?.severity}
                message={stockIssue ? `${stockIssue.message}. ${stockIssue.suggestion}` : undefined}
              >
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                      <Box size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-600">Kho hàng</span>
                 </div>
                 <span className="text-lg font-black text-slate-800">{product.stock}</span>
              </div>
              </FieldWarning>

              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-600">Lượt xem</span>
                 </div>
                 <span className="text-lg font-black text-slate-800">{product.viewCount?.toLocaleString() || 0}</span>
              </div>

              {(product.soldCount !== undefined && product.soldCount !== null) && (
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                      <ShoppingCart size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-600">Đã bán</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">{product.soldCount.toLocaleString()}</span>
                </div>
              )}

              {(product.rating !== undefined && product.rating !== null && product.rating > 0) && (
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                      <Star size={20} fill="currentColor" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">Đánh giá</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">
                    {product.rating.toFixed(1)}
                    <span className="text-xs font-medium text-slate-400 ml-1">({product.reviewCount || 0})</span>
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-50 space-y-2">
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase">Ngày tạo</span>
                    <span className="font-bold text-slate-700">{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
                 </div>
                 {product.updatedAt && (
                   <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-400 uppercase">Cập nhật</span>
                      <span className="font-bold text-slate-700">{new Date(product.updatedAt).toLocaleDateString('vi-VN')}</span>
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Activity size={14} /> Lịch sử hoạt động
            </h3>

            <div className="space-y-4 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

              {/* Created */}
              <div className="flex items-start gap-3 relative">
                <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-100 shrink-0 mt-0.5 z-10"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800">Sản phẩm được tạo</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{new Date(product.createdAt).toLocaleString('vi-VN')}</p>
                  <p className="text-xs text-slate-600 mt-1">Bởi seller: <span className="font-semibold">{product.sellerName}</span></p>
                </div>
              </div>

              {/* Status timeline */}
              {product.status === 'PENDING' && (
                <div className="flex items-start gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-100 shrink-0 mt-0.5 z-10 animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-700">Đang chờ duyệt</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Hiện tại</p>
                  </div>
                </div>
              )}

              {product.status === 'APPROVED' && (
                <div className="flex items-start gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0 mt-0.5 z-10"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-700">Admin đã duyệt</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Đang bán công khai</p>
                  </div>
                </div>
              )}

              {product.status === 'REJECTED' && (
                <div className="flex items-start gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-red-500 ring-4 ring-red-100 shrink-0 mt-0.5 z-10"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-700">Admin từ chối</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{product.rejectReason || 'Không có lý do'}</p>
                  </div>
                </div>
              )}

              {product.status === 'HIDDEN' && (
                <div className="flex items-start gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-slate-500 ring-4 ring-slate-100 shrink-0 mt-0.5 z-10"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700">Đã ẩn sản phẩm</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Không hiển thị trên store</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {statusHistory.length > 0 && (
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Clock size={14} /> Nhật ký trạng thái
              </h3>
              <div className="space-y-3">
                {statusHistory.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black text-slate-700">{entry.fromStatus} → {entry.toStatus}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{formatDateTime(entry.changedAt)}</p>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Bởi {entry.changedByName || (entry.changedBy ? `Admin #${entry.changedBy}` : 'Admin')}
                    </p>
                    {entry.reason && (
                      <p className="mt-2 text-xs italic leading-relaxed text-slate-600">{entry.reason}</p>
                    )}
                  </div>
                ))}
              </div>
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

interface VariantModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  productId: string | number;
  variant?: ProductVariantWithMeta;
  onClose: () => void;
  onCreate: (body: Partial<ProductVariant>) => Promise<ProductVariant>;
  onUpdate: (payload: { id: number; body: Partial<ProductVariant> }) => Promise<ProductVariant>;
}

const emptyVariantValues: VariantFormInput = {
  variantName: '',
  sku: '',
  price: '',
  stockQuantity: '',
  imageUrl: '',
  weight: '',
  length: '',
  width: '',
  height: '',
};

function VariantModal({
  isOpen,
  mode,
  productId,
  variant,
  onClose,
  onCreate,
  onUpdate,
}: VariantModalProps) {
  const { success, error } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<VariantFormInput, unknown, VariantFormValues>({
    resolver: zodResolver(variantSchema),
    mode: 'onChange',
    defaultValues: emptyVariantValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && variant) {
      reset({
        variantName: variant.variantName || '',
        sku: variant.sku || '',
        price: variant.price,
        stockQuantity: variant.stockQuantity,
        imageUrl: variant.imageUrl ?? variant.image_url ?? '',
        weight: variant.weight,
        length: variant.length,
        width: variant.width,
        height: variant.height,
      } as VariantFormInput);
      return;
    }
    reset(emptyVariantValues);
  }, [isOpen, mode, reset, variant]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const mapBackendField = (field: string): keyof VariantFormInput | null => {
    const fieldMap: Record<string, keyof VariantFormInput> = {
      variant_name: 'variantName',
      variantName: 'variantName',
      sku: 'sku',
      price: 'price',
      stock_quantity: 'stockQuantity',
      stockQuantity: 'stockQuantity',
      image_url: 'imageUrl',
      imageUrl: 'imageUrl',
      weight: 'weight',
      length: 'length',
      width: 'width',
      height: 'height',
    };
    return fieldMap[field] ?? null;
  };

  const mapBackendError = (caught: any) => {
    const data = caught?.response?.data;
    const errorCode = String(data?.error || '').toUpperCase();
    const message = String(data?.message || caught?.message || '');
    const lowerMessage = message.toLowerCase();

    if (errorCode === 'VALIDATION_FAILED' && data?.fieldErrors) {
      Object.entries(data.fieldErrors as Record<string, string>).forEach(([field, fieldMessage]) => {
        const formField = mapBackendField(field);
        if (formField) {
          setError(formField, { type: 'server', message: fieldMessage });
        }
      });
      return true;
    }

    if (errorCode === 'DUPLICATE_KEY' || lowerMessage.includes('duplicate sku') || lowerMessage.includes('duplicate entry')) {
      setError('sku', {
        type: 'server',
        message: 'SKU đã tồn tại. Vui lòng chọn SKU khác.',
      });
      return true;
    }

    if (errorCode === 'INTERNAL_ERROR') {
      error('Lỗi hệ thống, vui lòng thử lại.');
      return true;
    }

    return false;
  };

  const onSubmit = async (values: VariantFormValues) => {
    try {
      const body = values as Partial<ProductVariant>;
      if (mode === 'edit' && variant) {
        await onUpdate({ id: variant.id, body });
        success('Đã cập nhật biến thể.');
      } else {
        await onCreate(body);
        success('Đã thêm biến thể.');
      }
      onClose();
    } catch (caught) {
      if (!mapBackendError(caught)) {
        error('Không thể lưu biến thể. Vui lòng thử lại.');
      }
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-50";
  const labelClass = "mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400";
  const errorClass = "mt-1.5 text-xs font-semibold text-red-600";
  const numberParser = (value: string) => (value === '' ? undefined : Number(value));
  const title = mode === 'edit' ? 'Sửa biến thể' : 'Thêm biến thể mới';

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-3xl overflow-hidden rounded-[24px] bg-white shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Product #{productId}</p>
            <h3 className="mt-1 text-lg font-black text-slate-800">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Tên biến thể *</label>
              <input className={inputClass} {...register('variantName')} placeholder="64GB - Đen" />
              {errors.variantName && <p className={errorClass}>{errors.variantName.message}</p>}
            </div>

            <div>
              <label className={labelClass}>SKU *</label>
              <input className={inputClass} {...register('sku')} placeholder="IPH15-64BK" />
              {errors.sku && <p className={errorClass}>{errors.sku.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Giá (₫) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                className={inputClass}
                {...register('price', { setValueAs: numberParser })}
                placeholder="22990000"
              />
              {errors.price && <p className={errorClass}>{errors.price.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Tồn kho *</label>
              <input
                type="number"
                min="0"
                step="1"
                className={inputClass}
                {...register('stockQuantity', { setValueAs: numberParser })}
                placeholder="12"
              />
              {errors.stockQuantity && <p className={errorClass}>{errors.stockQuantity.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>URL ảnh</label>
              <input className={inputClass} {...register('imageUrl')} placeholder="https://..." />
              {errors.imageUrl && <p className={errorClass}>{errors.imageUrl.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Cân nặng (g)</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                {...register('weight', { setValueAs: numberParser })}
                placeholder="250"
              />
              {errors.weight && <p className={errorClass}>{errors.weight.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Dài × Rộng × Cao (mm)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  {...register('length', { setValueAs: numberParser })}
                  placeholder="Dài"
                />
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  {...register('width', { setValueAs: numberParser })}
                  placeholder="Rộng"
                />
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  {...register('height', { setValueAs: numberParser })}
                  placeholder="Cao"
                />
              </div>
              {(errors.length || errors.width || errors.height) && (
                <p className={errorClass}>
                  {errors.length?.message || errors.width?.message || errors.height?.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!isDirty || isSubmitting || !isValid}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductDetail;
